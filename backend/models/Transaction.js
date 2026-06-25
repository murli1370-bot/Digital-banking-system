const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer', 'payment', 'deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'interest', 'fee', 'refund'],
    required: true
  },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'INR' },
  description: { type: String, required: true, maxlength: 200 },
  category: {
    type: String,
    enum: ['food', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'travel', 'salary', 'investment', 'loan', 'transfer', 'other'],
    default: 'other'
  },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed', 'on_hold'], default: 'pending' },
  referenceNumber: String,
  receiverDetails: {
    name: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  balanceBefore: Number,
  balanceAfter: Number,
  metadata: {
    ipAddress: String,
    deviceInfo: String,
    location: String
  },
  failureReason: String,
  reversedAt: Date,
  reversalTransactionId: String,
  scheduledAt: Date,
  processedAt: Date
}, { timestamps: true });

// Generate unique transaction ID
TransactionSchema.pre('save', async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 900000 + 100000).toString();
    this.transactionId = `TXN${timestamp}${random}`;
  }
  next();
});

// Index for faster queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ fromAccount: 1, createdAt: -1 });
TransactionSchema.index({ toAccount: 1, createdAt: -1 });
TransactionSchema.index({ transactionId: 1 });
TransactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
