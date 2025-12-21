import express from "express";
import { getAllUsers, getUserById, updateUserRole, deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id/role", protect, admin, updateUserRole);
router.delete("/:id", protect, admin, deleteUser);

export default router;
