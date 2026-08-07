const express = require('express');
const router = express.Router();
const { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadMenu } = require('../config/cloudinary');

router.get('/', getCategories);
router.get('/all', protect, adminOnly, getAllCategories);
router.post('/', protect, adminOnly, uploadMenu.single('image'), createCategory);
router.put('/:id', protect, adminOnly, uploadMenu.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
