import express from "express";
import { createPaymentIntent, getPaymentById, confirmPaymentIntent } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm/:paymentIntentId", protect, confirmPaymentIntent);
router.get("/:id", protect, getPaymentById);

export default router;
