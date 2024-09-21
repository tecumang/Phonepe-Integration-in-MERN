const express = require('express');
const router = express.Router();
const Payment = require('../models/paymentModel');
const axios = require('axios');
require('dotenv').config();

// Create order (for the PhonePe gateway)
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    throw new Error('Amount is required');
  }
  // Simulate order creation with PhonePe API call
  const data = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    amount: amount * 100, // Convert to paise
    // Additional PhonePe required fields
  };

  try {
    // Make PhonePe API call to initiate the payment
    const response = await axios.post('https://api.phonepe.com/pg/v1/pay', data, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': process.env.PHONEPE_SECRET_KEY // Signature to verify the request
      }
    });

    // Save the payment data to MongoDB
    const payment = new Payment({
      orderId: response.data.orderId,
      paymentId: response.data.paymentId,
      status: response.data.status,
      amount: amount,
    });

    await payment.save();

    res.json(response.data);
  } catch (error) {
    console.error('Error in /create-order route:', error.message);
    console.error(error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
});

// Payment success callback
router.post('/payment-success', async (req, res) => {
  const { orderId, paymentId, status } = req.body;

  try {
    // Update the payment status in MongoDB
    const payment = await Payment.findOne({ orderId });
    if (payment) {
      payment.status = status;
      payment.paymentId = paymentId;
      await payment.save();

      res.json({ message: 'Payment updated successfully' });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating payment' });
  }
});

module.exports = router;
