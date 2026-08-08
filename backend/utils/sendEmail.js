const nodemailer = require('nodemailer');

// Email notifications are optional — only fire if SMTP env vars are configured.
const isConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CATERING_NOTIFY_EMAIL;

const sendCateringNotification = async (request) => {
  if (!isConfigured()) {
    console.log('SMTP not configured — skipping catering email notification. Request saved to DB only.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

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

  await transporter.sendMail({
    from: `"The Union Shawarma Website" <${process.env.SMTP_USER}>`,
    to: process.env.CATERING_NOTIFY_EMAIL,
    subject: `New Catering Inquiry from ${request.name}`,
    html,
  });
};

module.exports = { sendCateringNotification };
