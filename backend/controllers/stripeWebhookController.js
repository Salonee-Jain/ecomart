import stripe from "../config/stripe.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { errorResponse } from "../utils/errorResponse.js";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return errorResponse(res, 400, `Webhook Error: ${err.message}`);
  }
  // Payment succeeded

  if (process.env.NODE_ENV == "development" && event.type === "payment_intent.created") {
    const intent = event.data.object;

    const orderId = intent.metadata.orderId;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
        code: "ORDER_NOT_FOUND"
      });
    }

    // Prevent double marking
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();

      // Reduce stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);

        if (product) {
          product.stock -= item.quantity;

          if (product.stock < 0) product.stock = 0;

          await product.save();
        }
      }

      await order.save();
    }

    return res.json({ received: true });
  }

  // Ignore other event types
  return res.json({ received: true });
};
