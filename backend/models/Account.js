const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, unique: true },
  accountType: { type: String, enum: ['savings', 'checking', 'fixed_deposit', 'recurring_deposit'], required: true },
  balance: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['active', 'inactive', 'frozen', 'closed'], default: 'active' },
  interestRate: { type: Number, default: 0 },
  minimumBalance: { type: Number, default: 0 },
  overdraftLimit: { type: Number, default: 0 },
  dailyTransactionLimit: { type: Number, default: 100000 },
  monthlyTransactionLimit: { type: Number, default: 1000000 },
  isPrimary: { type: Boolean, default: false },
  nominee: {
    name: String,
    relationship: String,
    dateOfBirth: Date,
    phone: String
  },
  fixedDepositDetails: {
    maturityDate: Date,
    tenureMonths: Number,
    principalAmount: Number,
    maturityAmount: Number
  },
  branch: {
    name: { type: String, default: 'Main Branch' },
    ifscCode: { type: String, default: 'DBNK0001' },
    address: String
  }
}, { timestamps: true });

// Generate unique account number before save
AccountSchema.pre('save', async function (next) {
  if (this.isNew) {
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 9000 + 1000).toString();
      accountNumber = timestamp + random;
      const existing = await mongoose.model('Account').findOne({ accountNumber });
      if (!existing) isUnique = true;
    }
    this.accountNumber = accountNumber;
    // Set interest rates based on account type
    const rates = { savings: 3.5, checking: 0, fixed_deposit: 6.5, recurring_deposit: 5.5 };
    this.interestRate = rates[this.accountType] || 0;
  }
  next();
});

module.exports = mongoose.model('Account', AccountSchema);
