const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendTransactionAlert } = require('../utils/email');
const logger = require('../utils/logger');

// @route POST /api/transactions/transfer
exports.transferFunds = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fromAccountId, toAccountNumber, amount, description, category } = req.body;

    if (!amount || amount <= 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user.id }).session(session);
    if (!fromAccount) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Source account not found' });
    }
    if (fromAccount.status !== 'active') {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: `Source account is ${fromAccount.status}` });
    }

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).session(session);
    if (!toAccount) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Recipient account not found' });
    }
    if (toAccount.status !== 'active') {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Recipient account is not active' });
    }
    if (fromAccount._id.equals(toAccount._id)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
    }

    const availableBalance = fromAccount.balance + fromAccount.overdraftLimit;
    if (availableBalance < amount) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Check daily limit
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const todaysTotal = await Transaction.aggregate([
      { $match: { fromAccount: fromAccount._id, status: 'completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).session(session);
    const usedToday = todaysTotal[0]?.total || 0;
    if (usedToday + amount > fromAccount.dailyTransactionLimit) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Daily transaction limit exceeded' });
    }

    const fromBalanceBefore = fromAccount.balance;
    const toBalanceBefore = toAccount.balance;

    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save({ session });
    await toAccount.save({ session });

    const toUser = await User.findById(toAccount.user).session(session);

    const debitTxn = await Transaction.create([{
      user: req.user.id, fromAccount: fromAccount._id, toAccount: toAccount._id,
      type: 'transfer', amount, description: description || 'Fund Transfer',
      category: category || 'transfer', status: 'completed',
      balanceBefore: fromBalanceBefore, balanceAfter: fromAccount.balance,
      receiverDetails: { name: toUser ? `${toUser.firstName} ${toUser.lastName}` : '', accountNumber: toAccount.accountNumber },
      metadata: { ipAddress: req.ip }, processedAt: new Date()
    }], { session });

    const creditTxn = await Transaction.create([{
      user: toAccount.user, fromAccount: fromAccount._id, toAccount: toAccount._id,
      type: 'credit', amount, description: description || 'Fund Received',
      category: category || 'transfer', status: 'completed',
      balanceBefore: toBalanceBefore, balanceAfter: toAccount.balance,
      processedAt: new Date()
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Post-transaction: notifications & emails (non-blocking)
    Notification.create({
      user: req.user.id, title: 'Money Sent',
      message: `₹${amount.toLocaleString()} sent to ${toAccount.accountNumber}`,
      type: 'transaction'
    }).catch(e => logger.warn(e.message));

    Notification.create({
      user: toAccount.user, title: 'Money Received',
      message: `₹${amount.toLocaleString()} received from ${fromAccount.accountNumber}`,
      type: 'transaction'
    }).catch(e => logger.warn(e.message));

    sendTransactionAlert(req.user, debitTxn[0]).catch(e => logger.warn('Email failed: ' + e.message));

    res.status(200).json({ success: true, data: debitTxn[0], message: 'Transfer completed successfully' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @route POST /api/transactions/deposit
exports.deposit = async (req, res, next) => {
  try {
    const { accountId, amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const balanceBefore = account.balance;
    account.balance += amount;
    await account.save();

    const txn = await Transaction.create({
      user: req.user.id, toAccount: account._id, type: 'deposit', amount,
      description: description || 'Cash Deposit', category: 'other', status: 'completed',
      balanceBefore, balanceAfter: account.balance, processedAt: new Date()
    });

    await Notification.create({
      user: req.user.id, title: 'Deposit Successful',
      message: `₹${amount.toLocaleString()} deposited to ${account.accountNumber}`,
      type: 'transaction'
    });

    res.status(200).json({ success: true, data: txn });
  } catch (err) { next(err); }
};

// @route POST /api/transactions/withdraw
exports.withdraw = async (req, res, next) => {
  try {
    const { accountId, amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const availableBalance = account.balance + account.overdraftLimit;
    if (availableBalance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });
    if (account.balance - amount < account.minimumBalance && account.overdraftLimit === 0) {
      return res.status(400).json({ success: false, message: `Minimum balance of ₹${account.minimumBalance} must be maintained` });
    }

    const balanceBefore = account.balance;
    account.balance -= amount;
    await account.save();

    const txn = await Transaction.create({
      user: req.user.id, fromAccount: account._id, type: 'withdrawal', amount,
      description: description || 'Cash Withdrawal', category: 'other', status: 'completed',
      balanceBefore, balanceAfter: account.balance, processedAt: new Date()
    });

    await Notification.create({
      user: req.user.id, title: 'Withdrawal Successful',
      message: `₹${amount.toLocaleString()} withdrawn from ${account.accountNumber}`,
      type: 'transaction'
    });

    res.status(200).json({ success: true, data: txn });
  } catch (err) { next(err); }
};

// @route POST /api/transactions/bill-payment
exports.payBill = async (req, res, next) => {
  try {
    const { accountId, amount, billerName, billType, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    if (account.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

    const balanceBefore = account.balance;
    account.balance -= amount;
    await account.save();

    const txn = await Transaction.create({
      user: req.user.id, fromAccount: account._id, type: 'payment', amount,
      description: description || `${billType} bill payment - ${billerName}`,
      category: 'utilities', status: 'completed',
      balanceBefore, balanceAfter: account.balance, processedAt: new Date(),
      receiverDetails: { name: billerName }
    });

    await Notification.create({
      user: req.user.id, title: 'Bill Payment Successful',
      message: `₹${amount.toLocaleString()} paid to ${billerName}`,
      type: 'transaction'
    });

    res.status(200).json({ success: true, data: txn });
  } catch (err) { next(err); }
};

// @route GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, category, startDate, endDate, search } = req.query;
    const query = { user: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }
    if (search) query.description = { $regex: search, $options: 'i' };

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('fromAccount', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true, data: transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

// @route GET /api/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user.id })
      .populate('fromAccount', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType');
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.status(200).json({ success: true, data: txn });
  } catch (err) { next(err); }
};

// @route GET /api/transactions/analytics/spending
exports.getSpendingAnalytics = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: { $in: ['debit', 'payment', 'transfer', 'withdrawal'] }, status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const monthlyTrend = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({ success: true, data: { categoryBreakdown, monthlyTrend } });
  } catch (err) { next(err); }
};
