const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');

// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ status: 'active' });
    const totalDeposits = await Account.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
    const pendingLoans = await Loan.countDocuments({ status: { $in: ['applied', 'under_review'] } });
    const pendingKyc = await User.countDocuments({ kycStatus: 'submitted' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayTxnCount = await Transaction.countDocuments({ createdAt: { $gte: today } });
    const todayTxnVolume = await Transaction.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers, totalAccounts, activeAccounts,
        totalDeposits: totalDeposits[0]?.total || 0,
        pendingLoans, pendingKyc, todayTxnCount,
        todayTxnVolume: todayTxnVolume[0]?.total || 0
      }
    });
  } catch (err) { next(err); }
};

// @route GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, kycStatus } = req.query;
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (kycStatus) query.kycStatus = kycStatus;

    const users = await User.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true, data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/users/:id/kyc
exports.updateKycStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // verified or rejected
    const user = await User.findByIdAndUpdate(req.params.id, { kycStatus: status }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await Notification.create({
      user: user._id, title: `KYC ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      message: status === 'verified' ? 'Your KYC has been verified successfully.' : 'Your KYC submission was rejected. Please resubmit.',
      type: 'kyc'
    });

    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route GET /api/admin/loans
exports.getAllLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const loans = await Loan.find(query)
      .populate('user', 'firstName lastName email')
      .populate('account', 'accountNumber')
      .sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Loan.countDocuments(query);

    res.status(200).json({
      success: true, data: loans,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/loans/:id/review
exports.reviewLoan = async (req, res, next) => {
  try {
    const { status, approvedAmount, rejectionReason, adminNotes } = req.body; // approved or rejected
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    loan.status = status;
    loan.reviewedBy = req.user.id;
    loan.adminNotes = adminNotes;

    if (status === 'approved') {
      loan.approvedAmount = approvedAmount || loan.principalAmount;
    } else if (status === 'rejected') {
      loan.rejectionReason = rejectionReason;
    }
    await loan.save();

    await Notification.create({
      user: loan.user, title: `Loan ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved'
        ? `Your loan application ${loan.loanId} has been approved for ₹${loan.approvedAmount.toLocaleString()}.`
        : `Your loan application ${loan.loanId} was rejected. ${rejectionReason || ''}`,
      type: 'loan'
    });

    res.status(200).json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/loans/:id/disburse
exports.disburseLoan = async (req, res, next) => {
  const mongoose = require('mongoose');
  const Account = require('../models/Account');
  const Transaction = require('../models/Transaction');
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const loan = await Loan.findById(req.params.id).session(session);
    if (!loan) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    if (loan.status !== 'approved') {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Loan must be approved before disbursement' });
    }

    const account = await Account.findById(loan.account).session(session);
    const balanceBefore = account.balance;
    account.balance += loan.approvedAmount;
    await account.save({ session });

    await Transaction.create([{
      user: loan.user, toAccount: account._id, type: 'loan_disbursement', amount: loan.approvedAmount,
      description: `Loan disbursement - ${loan.loanId}`, category: 'loan', status: 'completed',
      balanceBefore, balanceAfter: account.balance, processedAt: new Date()
    }], { session });

    loan.disbursedAmount = loan.approvedAmount;
    loan.outstandingBalance = loan.approvedAmount;
    loan.status = 'active';
    loan.disbursementDate = new Date();
    const firstEmi = new Date(); firstEmi.setMonth(firstEmi.getMonth() + 1);
    loan.firstEmiDate = firstEmi;
    await loan.save({ session });

    await session.commitTransaction();
    session.endSession();

    await Notification.create({
      user: loan.user, title: 'Loan Disbursed',
      message: `₹${loan.approvedAmount.toLocaleString()} has been disbursed to your account for loan ${loan.loanId}.`,
      type: 'loan'
    });

    res.status(200).json({ success: true, data: loan });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @route GET /api/admin/transactions
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true, data: transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};
