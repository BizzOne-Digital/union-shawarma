const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getMyOrders, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', createOrder);
router.get('/my', protect, getMyOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
