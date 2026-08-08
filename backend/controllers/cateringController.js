const CateringRequest = require('../models/CateringRequest');
const { sendCateringNotification } = require('../utils/sendEmail');

// @desc Submit a catering inquiry
// @route POST /api/catering
const createCateringRequest = async (req, res) => {
  const { name, email, phone, location, eventDate, guestCount, message } = req.body;

  if (!name || !email || !phone || !location) {
    return res.status(400).json({ message: 'Name, email, phone, and location are required' });
  }

  const request = await CateringRequest.create({ name, email, phone, location, eventDate, guestCount, message });

  try {
    await sendCateringNotification(request);
  } catch (err) {
    console.error('Failed to send catering notification email:', err.message);
  }

  res.status(201).json(request);
};

// @desc Get all catering requests (admin)
// @route GET /api/catering
const getCateringRequests = async (req, res) => {
  const requests = await CateringRequest.find().sort({ createdAt: -1 });
  res.json(requests);
};

// @desc Update catering request status (admin)
// @route PUT /api/catering/:id/status
const updateCateringStatus = async (req, res) => {
  const request = await CateringRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  request.status = req.body.status || request.status;
  await request.save();
  res.json(request);
};

module.exports = { createCateringRequest, getCateringRequests, updateCateringStatus };
