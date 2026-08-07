const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Menu item images storage
const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'union-shawarma/menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

// Gallery images storage
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'union-shawarma/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
  },
});

// Settings / logo storage
const settingsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'union-shawarma/settings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  },
});

const uploadMenu = multer({ storage: menuStorage });
const uploadGallery = multer({ storage: galleryStorage });
const uploadSettings = multer({ storage: settingsStorage });

module.exports = { cloudinary, uploadMenu, uploadGallery, uploadSettings };
