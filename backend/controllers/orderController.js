const Order = require('../models/Order');
const { sendOrderNotification } = require('../utils/sendEmail');

const createOrder = async (req, res) => {
  const { items, totalAmount, orderType, specialInstructions, guestName, guestEmail, guestPhone } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'No order items' });

  const order = await Order.create({
    user: req.user ? req.user._id : undefined,
    guestName, guestEmail, guestPhone,
    items, totalAmount, orderType, specialInstructions,
  });
  console.log(`[order] Created order ${order._id} — $${totalAmount} (${orderType}) — sending email notification...`);

  try {
    await sendOrderNotification(order);
  } catch (err) {
    console.error(`[order] Email notification failed for order ${order._id}:`, err.message);
  }

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.menuItem', 'name image');
  res.json(orders);
};

const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name email')
    .populate('items.menuItem', 'name image');
  const total = await Order.countDocuments(filter);
  res.json({ orders, total, pages: Math.ceil(total / limit) });
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status || order.status;
  order.estimatedTime = req.body.estimatedTime || order.estimatedTime;
  const updated = await order.save();
  res.json(updated);
};

const getOrderStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, revenue, pendingOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    totalOrders,
    todayOrders,
    totalRevenue: revenue[0]?.total || 0,
    pendingOrders,
  });
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderStats };
