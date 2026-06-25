const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  loanId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  loanType: { type: String, enum: ['personal', 'home', 'vehicle', 'education', 'business', 'gold'], required: true },
  principalAmount: { type: Number, required: true, min: 1000 },
  approvedAmount: { type: Number },
  disbursedAmount: { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
  interestRate: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  emiAmount: { type: Number },
  emiDay: { type: Number, default: 1, min: 1, max: 28 },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'closed', 'defaulted'],
    default: 'applied'
  },
  purpose: { type: String, required: true },
  employmentType: { type: String, enum: ['salaried', 'self_employed', 'business', 'retired'] },
  monthlyIncome: Number,
  creditScore: { type: Number, min: 300, max: 900 },
  collateral: {
    type: String,
    description: String,
    value: Number,
    documents: [String]
  },
  disbursementDate: Date,
  firstEmiDate: Date,
  lastEmiDate: Date,
  closureDate: Date,
  rejectionReason: String,
  adminNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repayments: [{
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    amount: Number,
    principalComponent: Number,
    interestComponent: Number,
    paidAt: Date,
    status: { type: String, enum: ['paid', 'pending', 'overdue'] }
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Generate loan ID
LoanSchema.pre('save', async function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 9000 + 1000).toString();
    this.loanId = `LN${timestamp}${random}`;
    // Calculate EMI using reducing balance method
    if (this.principalAmount && this.interestRate && this.tenureMonths) {
      const r = this.interestRate / 12 / 100;
      const n = this.tenureMonths;
      const p = this.principalAmount;
      this.emiAmount = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }
  }
  next();
});

module.exports = mongoose.model('Loan', LoanSchema);
