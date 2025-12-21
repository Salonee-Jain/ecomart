import User from "../models/User.js";
import { errorResponse } from "../utils/errorResponse.js";

// ADMIN: get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({count: users.length, users});
};

// ADMIN: get user by ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ status: 404, message: "User not found" });
  }

  res.json(user);
};
