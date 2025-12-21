import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);

export default router;
