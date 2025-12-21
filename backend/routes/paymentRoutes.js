import express from "express";
import { createPaymentIntent, handleWebhook, getPaymentById } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/webhook", express.raw({ type: 'application/json' }), handleWebhook);
router.get("/:id", protect, getPaymentById);

export default router;
