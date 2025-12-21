import express from "express";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeCart
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);
router.delete("/", protect, clearCart);
router.post("/merge", protect, mergeCart);


export default router;
