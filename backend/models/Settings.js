const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'The Union Shawarma' },
    logo: { type: String },
    logoPublicId: { type: String },
    heroTitle: { type: String, default: 'Proudly Canadian. Authentically Delicious.' },
    heroSubtitle: { type: String },
    specialOffer: {
      title: String,
      price: String,
      description: String,
      isActive: { type: Boolean, default: true },
    },
    contactInfo: {
      phone: String,
      email: String,
      address: String,
    },
    businessHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    socialLinks: {
      instagram: String,
      facebook: String,
      tiktok: String,
      twitter: String,
    },
    deliveryPartners: {
      uberEats: String,
      doordash: String,
      skipTheDishes: String,
    },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
