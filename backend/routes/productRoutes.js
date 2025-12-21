import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  bulkCreateProducts,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", protect,getProducts);
router.get("/:id", protect, getProductById);

router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/bulk", protect, admin, bulkCreateProducts);
router.delete("/", protect, admin, bulkDeleteProducts);

export default router;
