const Coupon = require('../models/Coupon');

// Buy-1-get-1-50%-off: for every 2 units of the SAME item in the cart, one unit is half price
const computeBogoDiscount = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const pairs = Math.floor((item.quantity || 0) / 2);
    return sum + pairs * (item.price || 0) * 0.5;
  }, 0);
};

const computeDiscount = (coupon, subtotal, items) => {
  if (coupon.discountType === 'percent') return Math.min(subtotal, (subtotal * coupon.discountValue) / 100);
  if (coupon.discountType === 'bogo50') return Math.min(subtotal, computeBogoDiscount(items));
  return Math.min(subtotal, coupon.discountValue);
};

// @desc Validate a coupon code and return the discount for a given subtotal
// @route POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  const { code, subtotal, items } = req.body;
  if (!code) return res.status(400).json({ message: 'Coupon code is required' });

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
  if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active' });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: 'This coupon has expired' });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'This coupon has reached its usage limit' });
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({ message: `Minimum order of $${coupon.minOrderAmount.toFixed(2)} required for this coupon` });
  }
  if (coupon.discountType === 'bogo50' && computeBogoDiscount(items) <= 0) {
    return res.status(400).json({ message: 'Add 2 or more of the same item to use this coupon' });
  }

  const discount = computeDiscount(coupon, subtotal, items);
  res.json({ code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discount });
};

// @desc Create a coupon (admin)
// @route POST /api/coupons
const createCoupon = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, isActive, expiresAt, usageLimit } = req.body;
  const coupon = await Coupon.create({
    code, discountType, discountValue, minOrderAmount, isActive, expiresAt: expiresAt || undefined, usageLimit: usageLimit || undefined,
  });
  res.status(201).json(coupon);
};

// @desc Get all coupons (admin)
// @route GET /api/coupons
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

// @desc Update a coupon (admin)
// @route PUT /api/coupons/:id
const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

  const fields = ['code', 'discountType', 'discountValue', 'minOrderAmount', 'isActive', 'expiresAt', 'usageLimit'];
  fields.forEach((f) => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });

  const updated = await coupon.save();
  res.json(updated);
};

// @desc Delete a coupon (admin)
// @route DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  await coupon.deleteOne();
  res.json({ message: 'Coupon removed' });
};

module.exports = { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon };
