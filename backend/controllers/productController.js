import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock, ecoFriendly, sustainabilityRating } = req.body;

  const product = new Product({
    name,
    description,
    price,
    image,
    category,
    stock,
    ecoFriendly,
    sustainabilityRating,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, image, category, stock, ecoFriendly, sustainabilityRating } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.ecoFriendly = ecoFriendly !== undefined ? ecoFriendly : product.ecoFriendly;
    product.sustainabilityRating = sustainabilityRating || product.sustainabilityRating;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
