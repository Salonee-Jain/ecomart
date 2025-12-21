import Product from "../models/Product.js";
import { errorResponse } from "../utils/errorResponse.js";

// @desc   Get all products
// @route  GET /api/products
export const getProducts = async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  // Build query object
  const query = {};

  // Search by keyword
  if (req.query.keyword) {
    query.name = {
      $regex: req.query.keyword,
      $options: "i"
    };
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = Number(req.query.maxPrice);
    }
  }

  const count = await Product.countDocuments(query);

  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    total: count,
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
};


// @desc   Get single product
// @route  GET /api/products/:id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    return errorResponse(res, 404, "Product not found");
  }
};

// @desc   Create product (ADMIN)
// @route  POST /api/products
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, "Product with this SKU already exists");
    }
    return errorResponse(res, 500, error.message);
  }
};


// @desc   Bulk create products (ADMIN)
// @route  POST /api/products/bulk
export const bulkCreateProducts = async (req, res) => {
  try {
    const createdProducts = await Product.insertMany(req.body, {
      ordered: false
    });

    res.status(201).json({
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (error) {
    res.status(207).json({
      message: "Some products may already exist",
      error: error.message
    });
  }
};



export const bulkDeleteProducts = async (req, res) => {
  const ids = req.body.filter(item => item._id).map(item => item._id);

  if (!Array.isArray(ids) || ids.length === 0) {
    return errorResponse(res, 400, "No product IDs provided");
  }

  const result = await Product.deleteMany({ _id: { $in: ids } });

  res.json({
    message: `${result.deletedCount} products deleted`
  });
}



// @desc   Update product (ADMIN)
// @route  PUT /api/products/:id
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    return errorResponse(res, 404, "Product not found");
  }
};

// @desc   Delete product (ADMIN)
// @route  DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    return errorResponse(res, 404, "Product not found");
  }
};

// @desc   Get product analytics (Admin)
// @route  GET /api/products/analytics
// @access Admin
export const getProductAnalytics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 10 } });

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(10);

    // Category breakdown
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      summary: {
        total: totalProducts,
        outOfStock,
        lowStock,
        inStock: totalProducts - outOfStock
      },
      lowStockProducts,
      categoryStats
    });
  } catch (error) {
    return errorResponse(res, 500, `Failed to fetch product analytics: ${error.message}`);
  }
};


