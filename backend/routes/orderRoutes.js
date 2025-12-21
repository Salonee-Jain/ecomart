import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  markOrderPaid,
  cancelOrder,
  markOrderDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);


router.put("/:id/pay", protect, markOrderPaid);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/deliver", protect, admin, markOrderDelivered);




export default router;
