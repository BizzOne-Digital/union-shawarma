const User = require('../models/User');

const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: 'customer' };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await User.countDocuments(filter);
  res.json({ users, total, pages: Math.ceil(total / limit) });
};

const getPromoSubscribers = async (req, res) => {
  const users = await User.find({ promoOptIn: true, role: 'customer' }).select('name email phone');
  res.json({ count: users.length, users });
};

const getUserStats = async (req, res) => {
  const [totalUsers, promoUsers, newThisMonth] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ promoOptIn: true, role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: new Date(new Date().setDate(1)) } }),
  ]);
  res.json({ totalUsers, promoUsers, newThisMonth });
};

const toggleFavourite = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { menuItemId } = req.body;
  const idx = user.favourites.indexOf(menuItemId);
  if (idx > -1) {
    user.favourites.splice(idx, 1);
  } else {
    user.favourites.push(menuItemId);
  }
  await user.save();
  res.json({ favourites: user.favourites });
};

module.exports = { getAllUsers, getPromoSubscribers, getUserStats, toggleFavourite };
