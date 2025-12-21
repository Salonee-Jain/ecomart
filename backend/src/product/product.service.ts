import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) { }

  async getProducts(queryDto: QueryProductDto) {
    const pageSize = Number(queryDto.limit) || 10;
    const page = Number(queryDto.page) || 1;

    // Build query object
    const query: any = {};

    // Search by keyword
    if (queryDto.keyword) {
      query.name = {
        $regex: queryDto.keyword,
        $options: 'i',
      };
    }

    // Filter by category
    if (queryDto.category) {
      query.category = queryDto.category;
    }

    // Filter by price range
    if (Number(queryDto.minPrice) || Number(queryDto.maxPrice)) {
      query.price = {};
      if (Number(queryDto.minPrice)) {
        query.price.$gte = Number(queryDto.minPrice);
      }
      if (Number(queryDto.maxPrice)) {
        query.price.$lte = Number(queryDto.maxPrice);
      }
    }

    const count = await this.productModel.countDocuments(query);
    const products = await this.productModel
      .find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    return {
      total: count,
      products,
      page,
      pages: Math.ceil(count / pageSize),
    };
  }

  async getProductById(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
    try {
      const product = new this.productModel(createProductDto);
      return await product.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Product with this SKU already exists');
      }
      throw error;
    }
  }

  async bulkCreateProducts(products: CreateProductDto[]) {
    try {
      const createdProducts = await this.productModel.insertMany(products, {
        ordered: false,
      });
      return {
        count: createdProducts.length,
        products: createdProducts,
      };
    } catch (error) {
      return {
        message: 'Some products may already exist',
        error: error.message,
      };
    }
  }

  async bulkDeleteProducts(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No product IDs provided');
    }

    const result = await this.productModel.deleteMany({ _id: { $in: ids } });
    return {
      message: `${result.deletedCount} products deleted`,
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    return await product.save();
  }

  async deleteProduct(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await product.deleteOne();
    return { message: 'Product removed' };
  }

  async getProductAnalytics() {
    try {
      const totalProducts = await this.productModel.countDocuments();
      const outOfStock = await this.productModel.countDocuments({ stock: 0 });
      const lowStock = await this.productModel.countDocuments({ stock: { $gt: 0, $lt: 10 } });

      const lowStockProducts = await this.productModel
        .find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(10);

      const categoryStats = await this.productModel.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return {
        summary: {
          total: totalProducts,
          outOfStock,
          lowStock,
          inStock: totalProducts - outOfStock,
        },
        lowStockProducts,
        categoryStats,
      };
    } catch (error) {
      throw new Error(`Failed to fetch product analytics: ${error.message}`);
    }
  }

  async getAllCategories() {
    return this.productModel.distinct("category");
  }

  async createReview(productId: string, userId: string, userName: string, reviewData: { rating: number; comment: string }) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review: any) => review.user.toString() === userId
    );

    if (alreadyReviewed) {
      throw new BadRequestException('Product already reviewed');
    }

    const review = {
      user: userId as any,
      name: userName,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date(),
    };

    product.reviews.push(review as any);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return { message: 'Review added', product };
  }

  async updateReview(productId: string, reviewIndex: number, userId: string, reviewData: { rating: number; comment: string }) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.reviews[reviewIndex] || (product.reviews[reviewIndex] as any).user.toString() !== userId) {
      throw new BadRequestException('Review not found or unauthorized');
    }

    (product.reviews[reviewIndex] as any).rating = reviewData.rating;
    (product.reviews[reviewIndex] as any).comment = reviewData.comment;

    product.rating = product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return { message: 'Review updated', product };
  }

  async deleteReview(productId: string, reviewIndex: number, userId: string, isAdmin: boolean) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.reviews[reviewIndex]) {
      throw new NotFoundException('Review not found');
    }

    const review = product.reviews[reviewIndex] as any;
    if (review.user.toString() !== userId && !isAdmin) {
      throw new BadRequestException('Unauthorized to delete this review');
    }

    product.reviews.splice(reviewIndex, 1);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0
      ? product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / product.reviews.length
      : 0;

    await product.save();
    return { message: 'Review removed' };
  }

}
