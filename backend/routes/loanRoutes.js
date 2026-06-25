const express = require('express');
const router = express.Router();
const { applyLoan, getLoans, getLoan, repayLoan, calculateEMI } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/calculate-emi', calculateEMI);
router.post('/apply', applyLoan);
router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/:id/repay', repayLoan);

module.exports = router;
