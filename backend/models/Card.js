const mongoose = require('mongoose');
const crypto = require('crypto');

const CardSchema = new mongoose.Schema({
  cardId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  cardType: { type: String, enum: ['debit', 'credit', 'prepaid'], required: true },
  cardNetwork: { type: String, enum: ['visa', 'mastercard', 'rupay'], default: 'visa' },
  cardNumber: { type: String, select: false },
  maskedCardNumber: String,
  cardholderName: { type: String, required: true },
  expiryMonth: Number,
  expiryYear: Number,
  cvv: { type: String, select: false },
  status: { type: String, enum: ['active', 'inactive', 'blocked', 'expired', 'cancelled'], default: 'inactive' },
  creditLimit: { type: Number, default: 0 },
  availableCredit: { type: Number, default: 0 },
  billingCycle: { type: Number, default: 1 },
  dueDate: { type: Number, default: 15 },
  outstandingBalance: { type: Number, default: 0 },
  minimumDue: { type: Number, default: 0 },
  pinHash: { type: String, select: false },
  isPinSet: { type: Boolean, default: false },
  isVirtualCard: { type: Boolean, default: false },
  isContactless: { type: Boolean, default: true },
  isInternationalEnabled: { type: Boolean, default: false },
  isOnlineTxnEnabled: { type: Boolean, default: true },
  transactionLimits: {
    dailyLimit: { type: Number, default: 50000 },
    perTransactionLimit: { type: Number, default: 25000 },
    internationalLimit: { type: Number, default: 10000 }
  },
  rewards: {
    points: { type: Number, default: 0 },
    cashback: { type: Number, default: 0 }
  },
  activatedAt: Date,
  blockedAt: Date,
  blockReason: String
}, { timestamps: true });

// Generate card details before save
CardSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate card ID
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 9000 + 1000).toString();
    this.cardId = `CD${timestamp}${random}`;
    // Generate card number (16 digits)
    const prefix = this.cardNetwork === 'visa' ? '4' : this.cardNetwork === 'mastercard' ? '5' : '6';
    let cardNum = prefix;
    for (let i = 0; i < 15; i++) cardNum += Math.floor(Math.random() * 10);
    this.cardNumber = cardNum;
    this.maskedCardNumber = `****-****-****-${cardNum.slice(-4)}`;
    // Set expiry (3 years from now)
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 3);
    this.expiryMonth = expiry.getMonth() + 1;
    this.expiryYear = expiry.getFullYear();
    // Generate CVV
    this.cvv = Math.floor(Math.random() * 900 + 100).toString();
  }
  next();
});

module.exports = mongoose.model('Card', CardSchema);
