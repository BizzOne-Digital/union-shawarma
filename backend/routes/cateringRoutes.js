const express = require('express');
const router = express.Router();
const { createCateringRequest, getCateringRequests, updateCateringStatus } = require('../controllers/cateringController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', createCateringRequest);
router.get('/', protect, adminOnly, getCateringRequests);
router.put('/:id/status', protect, adminOnly, updateCateringStatus);

module.exports = router;
