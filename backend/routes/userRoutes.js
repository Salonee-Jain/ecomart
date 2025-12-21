import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, admin, getUserById);

export default router;
