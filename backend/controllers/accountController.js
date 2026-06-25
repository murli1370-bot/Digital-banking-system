const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @route GET /api/accounts
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id, status: { $ne: 'closed' } });
    res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (err) { next(err); }
};

// @route GET /api/accounts/:id
exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, data: account });
  } catch (err) { next(err); }
};

// @route POST /api/accounts
exports.createAccount = async (req, res, next) => {
  try {
    const { accountType, initialDeposit, nominee } = req.body;
    const existingCount = await Account.countDocuments({ user: req.user.id, status: { $ne: 'closed' } });
    if (existingCount >= 5) return res.status(400).json({ success: false, message: 'Maximum 5 accounts allowed' });

    const account = await Account.create({ user: req.user.id, accountType, nominee });

    if (initialDeposit && initialDeposit > 0) {
      account.balance += initialDeposit;
      await account.save();
      await Transaction.create({
        user: req.user.id, toAccount: account._id, type: 'deposit',
        amount: initialDeposit, description: 'Initial Deposit', category: 'other',
        status: 'completed', balanceBefore: 0, balanceAfter: initialDeposit
      });
    }

    await Notification.create({
      user: req.user.id, title: 'New Account Created',
      message: `Your ${accountType} account (${account.accountNumber}) has been created.`,
      type: 'account'
    });

    res.status(201).json({ success: true, data: account });
  } catch (err) { next(err); }
};

// @route GET /api/accounts/:id/statement
exports.getStatement = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = { $or: [{ fromAccount: account._id }, { toAccount: account._id }], status: 'completed' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

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

// @route PUT /api/accounts/:id/freeze
exports.freezeAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status: 'frozen' }, { new: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.status(200).json({ success: true, data: account, message: 'Account frozen successfully' });
  } catch (err) { next(err); }
};

// @route GET /api/accounts/summary
exports.getAccountSummary = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id, status: 'active' });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Monthly income/expense
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const accountIds = accounts.map(a => a._id);

    const credits = await Transaction.aggregate([
      { $match: { toAccount: { $in: accountIds }, type: { $in: ['credit', 'deposit', 'transfer'] }, status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const debits = await Transaction.aggregate([
      { $match: { fromAccount: { $in: accountIds }, type: { $in: ['debit', 'payment', 'transfer', 'withdrawal'] }, status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBalance, accounts: accounts.length,
        monthlyIncome: credits[0]?.total || 0,
        monthlyExpense: debits[0]?.total || 0
      }
    });
  } catch (err) { next(err); }
};
