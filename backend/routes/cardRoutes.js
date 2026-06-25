const express = require('express');
const router = express.Router();
const {
  createCard, getCards, getCard, activateCard, blockCard, setPin, updateLimits
} = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getCards).post(createCard);
router.get('/:id', getCard);
router.put('/:id/activate', activateCard);
router.put('/:id/block', blockCard);
router.put('/:id/set-pin', setPin);
router.put('/:id/limits', updateLimits);

module.exports = router;
