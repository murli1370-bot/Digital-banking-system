const express = require('express');
const router = express.Router();
const {
  transferFunds, deposit, withdraw, payBill, getTransactions, getTransaction, getSpendingAnalytics
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { transferValidation, handleValidation } = require('../middleware/validators');

router.use(protect);
router.post('/transfer', transferValidation, handleValidation, transferFunds);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/bill-payment', payBill);
router.get('/analytics/spending', getSpendingAnalytics);
router.get('/', getTransactions);
router.get('/:id', getTransaction);

module.exports = router;
