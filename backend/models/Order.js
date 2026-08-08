const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  customizations: { type: mongoose.Schema.Types.Mixed }, // { "Base Sauce": ["Hummus"], "Toppings": ["Lettuce", "Onion"] }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: String,
    guestEmail: String,
    guestPhone: String,
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    orderType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    specialInstructions: String,
    estimatedTime: Number, // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
