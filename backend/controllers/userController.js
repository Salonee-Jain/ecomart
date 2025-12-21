import User from "../models/User.js";

// ADMIN: get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({count: users.length, users});
};

// ADMIN: get user by ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
};
