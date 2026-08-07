const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadMenu } = require('../config/cloudinary');

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', protect, adminOnly, uploadMenu.single('image'), createMenuItem);
router.put('/:id', protect, adminOnly, uploadMenu.single('image'), updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
