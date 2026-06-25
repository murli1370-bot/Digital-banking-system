const bcrypt = require('bcryptjs');
const Card = require('../models/Card');
const Account = require('../models/Account');
const Notification = require('../models/Notification');

// @route POST /api/cards
exports.createCard = async (req, res, next) => {
  try {
    const { accountId, cardType, cardNetwork, isVirtualCard } = req.body;
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const cardData = {
      user: req.user.id, account: account._id, cardType, cardNetwork: cardNetwork || 'visa',
      cardholderName: `${req.user.firstName} ${req.user.lastName}`.toUpperCase(),
      isVirtualCard: !!isVirtualCard
    };
    if (cardType === 'credit') {
      cardData.creditLimit = 50000;
      cardData.availableCredit = 50000;
    }

    const card = await Card.create(cardData);

    await Notification.create({
      user: req.user.id, title: 'New Card Issued',
      message: `Your ${cardType} card ending in ${card.maskedCardNumber.slice(-4)} has been issued.`,
      type: 'card'
    });

    res.status(201).json({ success: true, data: card });
  } catch (err) { next(err); }
};

// @route GET /api/cards
exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user.id }).populate('account', 'accountNumber accountType');
    res.status(200).json({ success: true, count: cards.length, data: cards });
  } catch (err) { next(err); }
};

// @route GET /api/cards/:id
exports.getCard = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id }).populate('account', 'accountNumber accountType');
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.status(200).json({ success: true, data: card });
  } catch (err) { next(err); }
};

// @route PUT /api/cards/:id/activate
exports.activateCard = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    card.status = 'active';
    card.activatedAt = new Date();
    await card.save();
    res.status(200).json({ success: true, data: card, message: 'Card activated successfully' });
  } catch (err) { next(err); }
};

// @route PUT /api/cards/:id/block
exports.blockCard = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    card.status = 'blocked';
    card.blockedAt = new Date();
    card.blockReason = reason || 'User requested block';
    await card.save();

    await Notification.create({
      user: req.user.id, title: 'Card Blocked', priority: 'high',
      message: `Your card ending in ${card.maskedCardNumber.slice(-4)} has been blocked.`,
      type: 'security'
    });

    res.status(200).json({ success: true, data: card, message: 'Card blocked successfully' });
  } catch (err) { next(err); }
};

// @route PUT /api/cards/:id/set-pin
exports.setPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: 'PIN must be 4 digits' });

    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    const salt = await bcrypt.genSalt(10);
    card.pinHash = await bcrypt.hash(pin, salt);
    card.isPinSet = true;
    await card.save();

    res.status(200).json({ success: true, message: 'PIN set successfully' });
  } catch (err) { next(err); }
};

// @route PUT /api/cards/:id/limits
exports.updateLimits = async (req, res, next) => {
  try {
    const { dailyLimit, perTransactionLimit, isOnlineTxnEnabled, isInternationalEnabled, isContactless } = req.body;
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    if (dailyLimit !== undefined) card.transactionLimits.dailyLimit = dailyLimit;
    if (perTransactionLimit !== undefined) card.transactionLimits.perTransactionLimit = perTransactionLimit;
    if (isOnlineTxnEnabled !== undefined) card.isOnlineTxnEnabled = isOnlineTxnEnabled;
    if (isInternationalEnabled !== undefined) card.isInternationalEnabled = isInternationalEnabled;
    if (isContactless !== undefined) card.isContactless = isContactless;

    await card.save();
    res.status(200).json({ success: true, data: card, message: 'Card settings updated' });
  } catch (err) { next(err); }
};
