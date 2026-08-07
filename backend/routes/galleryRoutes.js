const express = require('express');
const router = express.Router();
const { getGallery, getAllGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadGallery } = require('../config/cloudinary');

router.get('/', getGallery);
router.get('/all', protect, adminOnly, getAllGallery);
router.post('/', protect, adminOnly, uploadGallery.single('image'), addGalleryItem);
router.delete('/:id', protect, adminOnly, deleteGalleryItem);

module.exports = router;
