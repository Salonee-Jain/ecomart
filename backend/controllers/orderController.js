import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { errorResponse } from "../utils/errorResponse.js";

// @desc   Create new order
// @route  POST /api/orders
// @access Private
export const createOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return errorResponse(res, 400, "No order items");
  }

  // 🔥 Validate stock for each item
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return errorResponse(res, 404, `Product not found: ${item.name}`);
    }

    if (product.stock < item.quantity) {
      return errorResponse(res, 400, `Not enough stock for ${item.name}. Only ${product.stock} available.`);
    }
  }
  let itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  let taxPrice = Number((0.1 * itemsPrice).toFixed(2)); // 10% GST

  let shippingPrice = itemsPrice > 100 ? 0 : 10;

  let totalPrice = itemsPrice + taxPrice + shippingPrice;


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
    return errorResponse(res, 404, "Order not found");
  }
  if (req.user.isAdmin) {
    return res.json(order);
  }
  if (order.user._id.toString() === req.user._id.toString()) {
    return res.json(order);
  }

  return errorResponse(res, 403, "Not authorized to view this order");
};


// @desc   Get all orders (ADMIN)
// @route  GET /api/orders
// @access Admin
export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
};

export const markOrderPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return errorResponse(res, 404, "Order not found");
  }

  // Only owner or admin
  if (
    !req.user.isAdmin &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, "Not authorized");
  }

  // If already paid — prevent double stock reduction
  if (order.isPaid) {
    return errorResponse(res, 400, "Order already paid");
  }

  // Mark order as paid
  order.isPaid = true;
  order.paidAt = Date.now();

  // 🔥 Reduce Stock for Each Order Item
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (!product) continue;

    if (product.stock < item.quantity) {
      return errorResponse(res, 400, `Not enough stock for ${item.name}`);
    }

    product.stock = product.stock - item.quantity;
    await product.save();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};



// @desc   Cancel order + restock items
// @route  PUT /api/orders/:id/cancel
// @access Private (user or admin)
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return errorResponse(res, 404, "Order not found");
  }

  // Only owner or admin
  if (
    !req.user.isAdmin &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return errorResponse(res, 403, "Not authorized to cancel this order");
  }

  // Can't cancel delivered orders
  if (order.isDelivered) {
    return errorResponse(res, 400, "Delivered orders cannot be cancelled");
  }

  // Restock products only if order was paid
  if (order.isPaid) {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  order.isCancelled = true;
  order.cancelledAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};


// @desc   Mark order as delivered
// @route  PUT /api/orders/:id/deliver
// @access Admin
export const markOrderDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return errorResponse(res, 404, "Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
};
