const express = require('express');
const router = express.Router();
const { updateProfile, updateProfilePicture, submitKYC, deactivateAccount } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.put('/profile', updateProfile);
router.put('/profile-picture', upload.single('profilePicture'), updateProfilePicture);
router.post('/kyc', upload.single('document'), submitKYC);
router.delete('/account', deactivateAccount);

module.exports = router;
