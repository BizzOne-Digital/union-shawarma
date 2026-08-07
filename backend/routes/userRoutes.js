const express = require('express');
const router = express.Router();
const { getAllUsers, getPromoSubscribers, getUserStats, toggleFavourite } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllUsers);
router.get('/promo-subscribers', protect, adminOnly, getPromoSubscribers);
router.get('/stats', protect, adminOnly, getUserStats);
router.post('/favourites', protect, toggleFavourite);

module.exports = router;
