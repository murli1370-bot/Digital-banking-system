const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, updateKycStatus, toggleUserStatus,
  getAllLoans, reviewLoan, disburseLoan, getAllTransactions
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/kyc', updateKycStatus);
router.put('/users/:id/status', toggleUserStatus);
router.get('/loans', getAllLoans);
router.put('/loans/:id/review', reviewLoan);
router.put('/loans/:id/disburse', disburseLoan);
router.get('/transactions', getAllTransactions);

module.exports = router;
