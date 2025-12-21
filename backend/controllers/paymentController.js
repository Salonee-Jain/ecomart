import stripe from "../config/stripe.js";
import Order from "../models/Order.js";

// @desc   Create Stripe payment intent
// @route  POST /api/payment/create-intent
// @access Private
export const createPaymentIntent = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ status: 404, message: "Order not found" });
  }

  // User can only pay for their own order (admin bypass optional)
  if (
    !req.user.isAdmin &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ status: 403, message: "Not authorized" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // cents
    currency: "aud",
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString()
    }
  });

  res.json({
    clientSecret: paymentIntent.client_secret
  });
};
