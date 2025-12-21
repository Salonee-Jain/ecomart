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
    return errorResponse(res, 404, "User not found");
  }

  res.json(user);
};

// @desc   Update user role (Admin)
// @route  PUT /api/users/:id/role
// @access Admin
export const updateUserRole = async (req, res) => {
  const { isAdmin } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, "Cannot modify your own admin status");
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({
      success: true,
      message: `User ${isAdmin ? 'promoted to' : 'removed from'} admin`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to update user role: ${error.message}`);
  }
};

// @desc   Delete user (Admin)
// @route  DELETE /api/users/:id
// @access Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, "Cannot delete your own account");
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to delete user: ${error.message}`);
  }
};
