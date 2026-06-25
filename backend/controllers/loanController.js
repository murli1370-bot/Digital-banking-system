const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

const interestRates = { personal: 12, home: 8.5, vehicle: 9.5, education: 7.5, business: 11, gold: 9 };

// @route POST /api/loans/apply
exports.applyLoan = async (req, res, next) => {
  try {
    const { accountId, loanType, principalAmount, tenureMonths, purpose, employmentType, monthlyIncome, collateral } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    // Simple eligibility check
    if (monthlyIncome && principalAmount > monthlyIncome * 60) {
      return res.status(400).json({ success: false, message: 'Loan amount exceeds eligibility based on income' });
    }

    const creditScore = Math.floor(Math.random() * (850 - 650) + 650); // Simulated credit score

    const loan = await Loan.create({
      user: req.user.id, account: account._id, loanType, principalAmount, tenureMonths,
      purpose, employmentType, monthlyIncome, collateral, creditScore,
      interestRate: interestRates[loanType] || 10,
      status: 'under_review'
    });

    await Notification.create({
      user: req.user.id, title: 'Loan Application Submitted',
      message: `Your ${loanType} loan application for ₹${principalAmount.toLocaleString()} is under review.`,
      type: 'loan'
    });

    res.status(201).json({ success: true, data: loan, message: 'Loan application submitted successfully' });
  } catch (err) { next(err); }
};

// @route GET /api/loans
exports.getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).populate('account', 'accountNumber').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (err) { next(err); }
};

// @route GET /api/loans/:id
exports.getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user.id }).populate('account', 'accountNumber');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    res.status(200).json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// @route POST /api/loans/:id/repay
exports.repayLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user.id }).session(session);
    if (!loan) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    if (!['active', 'disbursed'].includes(loan.status)) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Loan is not active for repayment' });
    }

    const account = await Account.findById(loan.account).session(session);
    const payAmount = amount || loan.emiAmount;
    if (account.balance < payAmount) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Insufficient balance for EMI payment' });
    }

    const balanceBefore = account.balance;
    account.balance -= payAmount;
    await account.save({ session });

    const interestComponent = Math.round((loan.outstandingBalance * loan.interestRate) / (12 * 100));
    const principalComponent = payAmount - interestComponent;

    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - principalComponent);

    const txn = await Transaction.create([{
      user: req.user.id, fromAccount: account._id, type: 'loan_repayment', amount: payAmount,
      description: `EMI payment for loan ${loan.loanId}`, category: 'loan', status: 'completed',
      balanceBefore, balanceAfter: account.balance, processedAt: new Date()
    }], { session });

    loan.repayments.push({
      transactionId: txn[0]._id, amount: payAmount, principalComponent, interestComponent,
      paidAt: new Date(), status: 'paid'
    });

    if (loan.outstandingBalance <= 0) {
      loan.status = 'closed';
      loan.closureDate = new Date();
    }

    await loan.save({ session });
    await session.commitTransaction();
    session.endSession();

    await Notification.create({
      user: req.user.id, title: 'EMI Payment Successful',
      message: `₹${payAmount.toLocaleString()} EMI paid for loan ${loan.loanId}. ${loan.status === 'closed' ? 'Loan fully repaid!' : ''}`,
      type: 'loan'
    });

    res.status(200).json({ success: true, data: loan, message: 'EMI payment successful' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// @route GET /api/loans/calculate-emi
exports.calculateEMI = async (req, res, next) => {
  try {
    const { loanType, principalAmount, tenureMonths } = req.query;
    const rate = interestRates[loanType] || 10;
    const r = rate / 12 / 100;
    const n = parseInt(tenureMonths);
    const p = parseFloat(principalAmount);
    const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    res.status(200).json({ success: true, data: { emi, totalPayment, totalInterest, interestRate: rate } });
  } catch (err) { next(err); }
};
