const axios = require('axios');
const { getCloverBaseUrl } = require('../config/clover');
const Order = require('../models/Order');
const { sendOrderNotification } = require('../utils/sendEmail');

// @desc Create a Clover Hosted Checkout session and return the redirect URL
// @route POST /api/payments/clover/checkout
const createCloverCheckout = async (req, res) => {
  const { orderId, items, totalAmount, successUrl, cancelUrl } = req.body;

  if (!orderId) return res.status(400).json({ message: 'orderId is required' });
  if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });
  if (!totalAmount || totalAmount <= 0) return res.status(400).json({ message: 'Invalid amount' });

  if (!process.env.CLOVER_API_TOKEN || !process.env.CLOVER_MERCHANT_ID) {
    console.error('[clover] Missing CLOVER_API_TOKEN or CLOVER_MERCHANT_ID env vars');
    return res.status(500).json({ message: 'Online payment is not configured yet' });
  }

  const lineItems = items.map((i) => ({
    name: i.name,
    unitQty: i.quantity,
    price: Math.round(i.price * 100), // Clover expects cents
  }));

  // Reconcile with totalAmount (which includes tax) by adding the remainder as its own line item
  const itemsSubtotalCents = lineItems.reduce((sum, li) => sum + li.price * li.unitQty, 0);
  const totalCents = Math.round(totalAmount * 100);
  const taxCents = totalCents - itemsSubtotalCents;
  if (taxCents > 0) {
    lineItems.push({ name: 'Tax', unitQty: 1, price: taxCents });
  }

  try {
    const { data } = await axios.post(
      `${getCloverBaseUrl()}/invoicingcheckoutservice/v1/checkouts`,
      {
        customer: {},
        shoppingCart: { lineItems },
        redirectUrls: {
          success: successUrl,
          failure: cancelUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          'X-Clover-Merchant-Id': process.env.CLOVER_MERCHANT_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    await Order.findByIdAndUpdate(orderId, {
      cloverCheckoutSessionId: data.checkoutSessionId,
      paymentMethod: 'clover',
    });

    console.log(`[clover] Created checkout session ${data.checkoutSessionId} for order ${orderId}`);
    res.json({ href: data.href, checkoutSessionId: data.checkoutSessionId });
  } catch (err) {
    console.error('[clover] Checkout creation FAILED:', err.response?.data || err.message);
    res.status(500).json({ message: 'Could not start payment. Please try again or pay at pickup.' });
  }
};

// @desc Verify a Clover checkout session against Clover's own records (never trust the redirect alone)
// @route POST /api/payments/clover/confirm
const confirmCloverPayment = async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: 'orderId is required' });

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!order.cloverCheckoutSessionId) return res.status(400).json({ message: 'No Clover checkout session on this order' });

  try {
    const { data } = await axios.get(
      `${getCloverBaseUrl()}/invoicingcheckoutservice/v1/checkouts/${order.cloverCheckoutSessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOVER_API_TOKEN}`,
          'X-Clover-Merchant-Id': process.env.CLOVER_MERCHANT_ID,
        },
      }
    );

    const wasAlreadyPaid = order.paymentStatus === 'paid';
    const isPaid = data.state === 'PAID' || data.status === 'PAID';
    order.paymentStatus = isPaid ? 'paid' : 'failed';
    if (isPaid && order.status === 'pending') order.status = 'confirmed';
    await order.save();

    console.log(`[clover] Order ${orderId} payment ${isPaid ? 'CONFIRMED' : 'NOT confirmed'} (session ${order.cloverCheckoutSessionId})`);

    if (isPaid && !wasAlreadyPaid) {
      try {
        await sendOrderNotification(order);
      } catch (err) {
        console.error(`[order] Email notification failed for order ${orderId}:`, err.message);
      }
    }

    res.json({ paymentStatus: order.paymentStatus, order });
  } catch (err) {
    console.error(`[clover] Failed to verify checkout ${order.cloverCheckoutSessionId}:`, err.response?.data || err.message);
    res.status(500).json({ message: 'Could not verify payment status' });
  }
};

module.exports = { createCloverCheckout, confirmCloverPayment };
