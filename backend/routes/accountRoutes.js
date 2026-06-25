const express = require('express');
const router = express.Router();
const {
  getAccounts, getAccount, createAccount, getStatement, freezeAccount, getAccountSummary
} = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getAccountSummary);
router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').get(getAccount);
router.get('/:id/statement', getStatement);
router.put('/:id/freeze', freezeAccount);

module.exports = router;
