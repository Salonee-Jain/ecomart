import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});
