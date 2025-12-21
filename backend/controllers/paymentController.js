import stripe from "../config/stripe.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { errorResponse } from "../utils/errorResponse.js";

// @desc   Create Stripe payment intent
// @route  POST /api/payment/create-intent
// @access Private
export const createPaymentIntent = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return errorResponse(res, 404, "Order not found");
  }

  // User can only pay for their own order (admin bypass optional)
  if (
    !req.user.isAdmin &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, "Not authorized");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), 
    currency: 'aud',
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never'
    },

    metadata: {
      orderId,
      userId: req.user._id.toString()
    }
  });

  // Save payment record to database
  const payment = await Payment.create({
    order: orderId,
    user: req.user._id,
    paymentIntentId: paymentIntent.id,
    amount: order.totalPrice,
    currency: 'aud',
    status: 'pending',
    metadata: {
      orderId,
      userId: req.user._id.toString()
    }
  });

  res.json({

    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
    stripePaymentIntentId: paymentIntent.id
  });
};

// @desc   Handle Stripe webhook events
// @route  POST /api/payment/webhook
// @access Public (Stripe)
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { 
          status: 'succeeded',
          paymentMethod: paymentIntent.payment_method
        }
      );
      
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      
      await Payment.findOneAndUpdate(
        { paymentIntentId: failedIntent.id },
        { status: 'failed' }
      );
      
      break;

    case 'payment_intent.canceled':
      const canceledIntent = event.data.object;
      
      await Payment.findOneAndUpdate(
        { paymentIntentId: canceledIntent.id },
        { status: 'canceled' }
      );
      
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc   Get payment by ID
// @route  GET /api/payment/:id
// @access Private
export const getPaymentById = async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order')
    .populate('user', 'name email');

  if (!payment) {
    return errorResponse(res, 404, "Payment not found");
  }

  // Only allow user or admin to view payment
  if (
    !req.user.isAdmin &&
    payment.user._id.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, "Not authorized");
  }

  res.json(payment);
};
