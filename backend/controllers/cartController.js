import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc   Get my cart
// @route  GET /api/cart
// @access Private
export const getMyCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
};

// @desc   Add or update cart item
// @route  POST /api/cart
// @access Private
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ status: 404, message: "Product not found" });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ status: 400, message: `Only ${product.stock} items left in stock` });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: []
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    if (quantity > product.stock) {
      return res.status(400).json({ status: 400, message: `Cannot add ${quantity}. Only ${product.stock} left.` });
    }

    existingItem.quantity = quantity;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      image: product.image,
      price: product.price,
      quantity
    });
  }

  await cart.save();
  res.json(cart);
};


// @desc   Remove item from cart
// @route  DELETE /api/cart/:productId
// @access Private
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ status: 404, message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};

// @desc   Clear cart
// @route  DELETE /api/cart
// @access Private
export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ status: 404, message: "Cart not found" });
  }

  cart.items = [];
  await cart.save();

  res.json({ message: "Cart cleared" });
};


// @desc   Merge guest cart into user cart after login
// @route  POST /api/cart/merge
// @access Private
export const mergeCart = async (req, res) => {
  const guestItems = req.body.items; // array of {productId, quantity}

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  for (const g of guestItems) {
    const product = await Product.findById(g.productId);
    if (!product) continue;

    const existing = cart.items.find(
      (item) => item.product.toString() === g.productId
    );

    let qty = Math.min(g.quantity, product.stock); // enforce stock

    if (existing) {
      existing.quantity = qty;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        price: product.price,
        quantity: qty
      });
    }
  }

  await cart.save();
  res.json(cart);
};
