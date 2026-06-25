const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @route PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const fields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'notificationPreferences'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route PUT /api/users/profile-picture
exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });
    const user = await User.findByIdAndUpdate(req.user.id, { profilePicture: req.file.path }, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route POST /api/users/kyc
exports.submitKYC = async (req, res, next) => {
  try {
    const { documentType, documentNumber } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a document' });

    const user = await User.findById(req.user.id);
    user.kycDocuments.push({ type: documentType, documentNumber, documentUrl: req.file.path });
    user.kycStatus = 'submitted';
    await user.save();

    res.status(200).json({ success: true, data: user, message: 'KYC documents submitted for review' });
  } catch (err) { next(err); }
};

// @route DELETE /api/users/account
exports.deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) { next(err); }
};
