import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto, MergeCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async getMyCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    let cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await this.cartModel.create({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(`Cannot add ${quantity}. Only ${product.stock - existingItem.quantity} more items available.`);
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        price: product.price,
        quantity,
      } as any);
    }

    await cart.save();
    return cart;
  }

  async updateCartItem(userId: string, productId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items left in stock`);
    }

    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (!existingItem) {
      throw new NotFoundException('Item not found in cart');
    }

    existingItem.quantity = quantity;
    await cart.save();
    return cart;
  }

  async removeFromCart(userId: string, productId: string) {
    // Retry logic to handle version conflicts
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const cart = await this.cartModel.findOne({ user: userId });
        if (!cart) {
          throw new NotFoundException('Cart not found');
        }

        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        await cart.save();
        return cart;
      } catch (error) {
        lastError = error;

        // If it's a version error, retry
        if (error.name === 'VersionError' || error.message?.includes('version')) {
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
          continue;
        }

        // If it's not a version error, throw immediately
        throw error;
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  }

  async clearCart(userId: string) {
    // Retry logic to handle version conflicts
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const cart = await this.cartModel.findOne({ user: userId });
        if (!cart) {
          throw new NotFoundException('Cart not found');
        }

        cart.items = [];
        await cart.save();

        return { message: 'Cart cleared' };
      } catch (error) {
        lastError = error;

        // If it's a version error, retry
        if (error.name === 'VersionError' || error.message?.includes('version')) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
          continue;
        }

        // If it's not a version error, throw immediately
        throw error;
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  }

  async mergeCart(userId: string, mergeCartDto: MergeCartDto) {
    const guestItems = mergeCartDto.items;

    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }

    for (const g of guestItems) {
      const product = await this.productModel.findById(g.productId);
      if (!product) continue;

      const existing = cart.items.find((item) => item.product.toString() === g.productId);

      if (existing) {
        const newQty = Math.min(existing.quantity + g.quantity, product.stock);
        existing.quantity = newQty;
      } else {
        const qty = Math.min(g.quantity, product.stock);
        cart.items.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          image: product.image,
          price: product.price,
          quantity: qty,
        } as any);
      }
    }

    await cart.save();
    return cart;
  }
}
