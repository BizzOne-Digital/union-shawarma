const express = require('express');
const router = express.Router();
const { createCloverCheckout, confirmCloverPayment } = require('../controllers/paymentController');

router.post('/clover/checkout', createCloverCheckout);
router.post('/clover/confirm', confirmCloverPayment);

module.exports = router;
