import express from "express";
import {
  sendTestEmail,
  sendPaymentSuccessEmail,
  sendOrderEmail
} from "../controllers/emailController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Test email endpoint - any authenticated user
router.post("/test", protect, sendTestEmail);

// Send payment success email for specific order
router.post("/payment-success/:orderId", protect, sendPaymentSuccessEmail);

// Send custom order email - admin only
router.post("/order/:orderId", protect, admin, sendOrderEmail);

export default router;
