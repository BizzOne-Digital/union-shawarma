const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String },
    imagePublicId: { type: String },
    tags: [{ type: String }], // e.g. ['popular', 'must-try', 'new', 'spicy']
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isMustTry: { type: Boolean, default: false },
    calories: { type: Number },
    allergens: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
