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

// @desc   Get all payments (Admin)
// @route  GET /api/payment/all
// @access Admin
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      count: payments.length,
      payments
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to fetch payments: ${error.message}`);
  }
};

// @desc   Confirm payment intent (Testing/Simulation)
// @route  POST /api/payment/confirm/:paymentIntentId
// @access Private
export const confirmPaymentIntent = async (req, res) => {
  const { paymentIntentId } = req.params;
  const { paymentMethod } = req.body;

  try {
    // Default to test card if no payment method provided
    const pm = paymentMethod || 'pm_card_visa';

    // Confirm the payment intent
    const confirmedIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      { payment_method: pm }
    );

    // Update payment status in database
    await Payment.findOneAndUpdate(
      { paymentIntentId: paymentIntentId },
      { 
        status: confirmedIntent.status,
        paymentMethod: confirmedIntent.payment_method
      }
    );

    res.json({
      success: true,
      message: "Payment intent confirmed successfully",
      paymentIntent: {
        id: confirmedIntent.id,
        status: confirmedIntent.status,
        amount: confirmedIntent.amount / 100,
        currency: confirmedIntent.currency
      }
    });
  } catch (error) {
    return errorResponse(res, 400, `Failed to confirm payment: ${error.message}`);
  }
};
