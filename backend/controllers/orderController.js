import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc   Create new order
// @route  POST /api/orders
// @access Private
export const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // 🔥 Validate stock for each item
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(
        `Not enough stock for ${item.name}. Only ${product.stock} available.`
      );
    }
  }

  // All stock valid: Create the order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
};


// @desc   Get logged-in user's orders
// @route  GET /api/orders/my
// @access Private
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc   Get order by ID
// @route  GET /api/orders/:id
// @access Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (req.user.isAdmin) {
    return res.json(order);
  }
  if (order.user._id.toString() === req.user._id.toString()) {
    return res.json(order);
  }

  res.status(403);
  throw new Error("Not authorized to view this order");
};


// @desc   Get all orders (ADMIN)
// @route  GET /api/orders
// @access Admin
export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
};


// @desc   Mark order as paid
// @route  PUT /api/orders/:id/pay
// @access Private
import Product from "../models/Product.js";

export const markOrderPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only owner or admin
  if (
    !req.user.isAdmin &&
    order.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // If already paid — prevent double stock reduction
  if (order.isPaid) {
    return res.status(400).json({ message: "Order already paid" });
  }

  // Mark order as paid
  order.isPaid = true;
  order.paidAt = Date.now();

  // 🔥 Reduce Stock for Each Order Item
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (!product) continue;

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${item.name}`);
    }

    product.stock = product.stock - item.quantity;
    await product.save();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};

