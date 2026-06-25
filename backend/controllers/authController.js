const crypto = require('crypto');
const User = require('../models/User');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { sendWelcomeEmail, sendVerifyEmail, sendPasswordResetEmail } = require('../utils/email');
const logger = require('../utils/logger');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  user.password = undefined;
  res.status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, data: user });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, dateOfBirth, address, adminKey } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const role = adminKey === process.env.ADMIN_REGISTRATION_KEY ? 'admin' : 'user';
    const user = await User.create({ firstName, lastName, email, phone, password, dateOfBirth, address, role });

    // Auto-create savings account for new users
    if (role === 'user') {
      await Account.create({ user: user._id, accountType: 'savings', isPrimary: true, balance: 0 });
    }

    // Send welcome email (don't block registration if email fails)
    try { await sendWelcomeEmail(user); } catch (e) { logger.warn('Welcome email failed: ' + e.message); }

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to DigitalBank!',
      message: `Hi ${firstName}! Your account has been created. Complete KYC to unlock all features.`,
      type: 'account'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.isLocked) return res.status(423).json({ success: false, message: 'Account locked. Try again after 30 minutes.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account has been deactivated. Contact support.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    await User.findByIdAndUpdate(user._id, { loginAttempts: 0, $unset: { lockUntil: 1 }, lastLogin: new Date(), lastLoginIp: req.ip });
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendPasswordResetEmail(user, resetUrl);
      res.status(200).json({ success: true, message: 'Password reset email sent.' });
    } catch (e) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new Error('Email could not be sent'));
    }
  } catch (err) { next(err); }
};

// @route PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// @route PUT /api/auth/updatepassword
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};
