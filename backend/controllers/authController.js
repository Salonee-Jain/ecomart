import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { errorResponse } from "../utils/errorResponse.js";
import stripe from "../config/stripe.js";

// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 400, "User already exists");
  }

  const user = await User.create({ name, email, password, isAdmin: req.body.isAdmin ?? false });
  const customer = await stripe.customers.create({
    email,
    name
  });

  user.stripeCustomerId = customer.id;
  await user.save();
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  }
};

// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};


export const logoutUser = async (req, res) => {
  res.json({ message: "User logged out successfully" });
}