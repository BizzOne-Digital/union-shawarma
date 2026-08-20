const Settings = require('../models/Settings');
const { cloudinary } = require('../config/cloudinary');

const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      siteName: 'The Union Shawarma',
      contactInfo: { phone: '+1 289-389-3315', email: 'theunionshawarma@gmail.com' },
      businessHours: [
        { day: 'Monday', open: '11:30 AM', close: '9:00 PM' },
        { day: 'Tuesday', open: '11:30 AM', close: '9:00 PM' },
        { day: 'Wednesday', open: '11:30 AM', close: '9:00 PM' },
        { day: 'Thursday', open: '11:30 AM', close: '9:00 PM' },
        { day: 'Friday', open: '11:30 AM', close: '12:00 AM' },
        { day: 'Saturday', open: '1:00 PM', close: '12:00 AM' },
        { day: 'Sunday', open: '1:00 PM', close: '9:00 PM' },
      ],
      specialOffer: { title: 'Chicken Shawarma Wrap', price: '$7.99', description: 'Online order exclusive', isActive: true },
      socialLinks: { instagram: '@Theunionshawarma' },
    });
  }
  res.json(settings);
};

const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  const stringFields = ['siteName', 'heroTitle', 'heroSubtitle', 'seoTitle', 'seoDescription'];
  const jsonFields = ['contactInfo', 'businessHours', 'socialLinks', 'deliveryPartners', 'specialOffer'];

  stringFields.forEach(f => { if (req.body[f] !== undefined) settings[f] = req.body[f]; });
  jsonFields.forEach(f => {
    if (req.body[f] !== undefined) {
      try {
        settings[f] = JSON.parse(req.body[f]);
      } catch (err) {
        console.error(`[settings] Failed to parse "${f}":`, err.message);
      }
    }
  });

  if (req.file) {
    if (settings.logoPublicId) await cloudinary.uploader.destroy(settings.logoPublicId);
    settings.logo = req.file.path;
    settings.logoPublicId = req.file.filename;
  }

  const updated = await settings.save();
  res.json(updated);
};

module.exports = { getSettings, updateSettings };
