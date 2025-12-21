import { sendEmail } from "../utils/sendEmail.js";
import { paymentSuccessTemplate } from "../utils/paymentEmailTemplate.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { errorResponse } from "../utils/errorResponse.js";

// @desc   Test email sending
// @route  POST /api/email/test
// @access Private
export const sendTestEmail = async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to) {
    return errorResponse(res, 400, "Email recipient required");
  }

  try {
    await sendEmail(
      to,
      subject || "Test Email from EcoMart",
      html || "<h1>This is a test email</h1><p>If you received this, your email setup is working!</p>"
    );

    res.json({
      success: true,
      message: "Test email sent successfully",
      to
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to send email: ${error.message}`);
  }
};

// @desc   Send payment success email for an order
// @route  POST /api/email/payment-success/:orderId
// @access Private
export const sendPaymentSuccessEmail = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Only allow user or admin to send email
    if (
      !req.user.isAdmin &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "Not authorized");
    }

    const user = order.user;
    const emailHtml = paymentSuccessTemplate(order);

    await sendEmail(
      user.email,
      "Your Payment Was Successful 🎉",
      emailHtml
    );

    res.json({
      success: true,
      message: "Payment success email sent",
      to: user.email,
      orderId: order._id
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to send email: ${error.message}`);
  }
};

// @desc   Send custom email with order data
// @route  POST /api/email/order/:orderId
// @access Private (Admin)
export const sendOrderEmail = async (req, res) => {
  const { orderId } = req.params;
  const { to, subject, template } = req.body;

  try {
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    const recipient = to || order.user.email;
    const emailSubject = subject || `Order Update - ${order._id}`;
    
    let emailHtml;
    if (template === "payment-success") {
      emailHtml = paymentSuccessTemplate(order);
    } else {
      emailHtml = `
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.isPaid ? 'Paid' : 'Pending'}</p>
        <p><strong>Total:</strong> $${order.totalPrice}</p>
      `;
    }

    await sendEmail(recipient, emailSubject, emailHtml);

    res.json({
      success: true,
      message: "Order email sent",
      to: recipient,
      orderId: order._id
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to send email: ${error.message}`);
  }
};
