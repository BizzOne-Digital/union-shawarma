const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadSettings } = require('../config/cloudinary');

router.get('/', getSettings);
router.put('/', protect, adminOnly, uploadSettings.single('logo'), updateSettings);

module.exports = router;
