const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed', 'bogo50'], required: true },
    discountValue: { type: Number, min: 0, required: function () { return this.discountType !== 'bogo50'; } }, // unused for bogo50
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    usageLimit: { type: Number }, // total number of times this coupon can be used, undefined = unlimited
    usedCount: { type: Number, default: 0 },
    // For bogo50: which menu items this applies to. Empty = applies to any item in the cart.
    applicableItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
