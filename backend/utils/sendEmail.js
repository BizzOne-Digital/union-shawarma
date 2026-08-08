const nodemailer = require('nodemailer');

// Email notifications are optional — only fire if SMTP env vars are configured.
const smtpConfigured = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const sendCateringNotification = async (request) => {
  const to = process.env.CATERING_NOTIFY_EMAIL;
  if (!smtpConfigured() || !to) {
    console.log('[email] SKIPPED catering notification — SMTP_HOST/SMTP_USER/SMTP_PASS/CATERING_NOTIFY_EMAIL not fully configured. Request saved to DB only.');
    return;
  }

  const html = `
    <h2>New Catering Inquiry</h2>
    <p><strong>Name:</strong> ${request.name}</p>
    <p><strong>Email:</strong> ${request.email}</p>
    <p><strong>Phone:</strong> ${request.phone}</p>
    <p><strong>Location:</strong> ${request.location}</p>
    <p><strong>Event Date:</strong> ${request.eventDate || 'Not specified'}</p>
    <p><strong>Guest Count:</strong> ${request.guestCount || 'Not specified'}</p>
    <p><strong>Message:</strong> ${request.message || '—'}</p>
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"The Union Shawarma Website" <${process.env.SMTP_USER}>`,
      to,
      subject: `New Catering Inquiry from ${request.name}`,
      html,
    });
    console.log(`[email] SENT catering notification to ${to} (messageId: ${info.messageId})`);
  } catch (err) {
    console.error(`[email] FAILED to send catering notification to ${to}:`, err.message);
    throw err;
  }
};

const sendOrderNotification = async (order) => {
  const to = process.env.ORDER_NOTIFY_EMAIL || process.env.CATERING_NOTIFY_EMAIL;
  if (!smtpConfigured() || !to) {
    console.log('[email] SKIPPED order notification — SMTP_HOST/SMTP_USER/SMTP_PASS/ORDER_NOTIFY_EMAIL not fully configured. Order saved to DB only.');
    return;
  }

  const itemsHtml = order.items
    .map((i) => `<li>${i.quantity}x ${i.name} — $${i.price.toFixed(2)}${i.customizations ? ` (${Object.values(i.customizations).flat().join(', ')})` : ''}</li>`)
    .join('');

  const html = `
    <h2>New Order Received</h2>
    <p><strong>Order Type:</strong> ${order.orderType}</p>
    <p><strong>Customer:</strong> ${order.guestName || 'Registered customer'}</p>
    <p><strong>Email:</strong> ${order.guestEmail || '—'}</p>
    <p><strong>Phone:</strong> ${order.guestPhone || '—'}</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
    <p><strong>Special Instructions:</strong> ${order.specialInstructions || '—'}</p>
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"The Union Shawarma Website" <${process.env.SMTP_USER}>`,
      to,
      subject: `New Order — $${order.totalAmount.toFixed(2)}`,
      html,
    });
    console.log(`[email] SENT order notification to ${to} (messageId: ${info.messageId})`);
  } catch (err) {
    console.error(`[email] FAILED to send order notification to ${to}:`, err.message);
    throw err;
  }
};

module.exports = { sendCateringNotification, sendOrderNotification };
