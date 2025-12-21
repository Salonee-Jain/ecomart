import express from "express";
import { createPaymentIntent, getPaymentById, confirmPaymentIntent, getAllPayments } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm/:paymentIntentId", protect, confirmPaymentIntent);
router.get("/:id", protect, getPaymentById);
router.get("/", protect, admin, getAllPayments);

export default router;
