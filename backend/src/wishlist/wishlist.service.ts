import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from '../schemas/wishlist.schema';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class WishlistService {
    constructor(
        @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async getWishlist(userId: string) {
        let wishlist = await this.wishlistModel
            .findOne({ user: userId })
            .populate('products');

        if (!wishlist) {
            wishlist = await this.wishlistModel.create({
                user: userId,
                products: [],
            });
        }

        return wishlist;
    }

    async addToWishlist(userId: string, productId: string) {
        // Check if product exists
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        let wishlist = await this.wishlistModel.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await this.wishlistModel.create({
                user: userId,
                products: [productId],
            });
        } else {
            // Check if product already in wishlist
            if (wishlist.products.some((id) => id.toString() === productId)) {
                throw new BadRequestException('Product already in wishlist');
            }

            wishlist.products.push(productId as any);
            await wishlist.save();
        }

        return this.getWishlist(userId);
    }

    async removeFromWishlist(userId: string, productId: string) {
        const wishlist = await this.wishlistModel.findOne({ user: userId });

        if (!wishlist) {
            throw new NotFoundException('Wishlist not found');
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        ) as any;

        await wishlist.save();
        return this.getWishlist(userId);
    }

    async clearWishlist(userId: string) {
        const wishlist = await this.wishlistModel.findOne({ user: userId });

        if (!wishlist) {
            throw new NotFoundException('Wishlist not found');
        }

        wishlist.products = [];
        await wishlist.save();

        return { message: 'Wishlist cleared' };
    }
}
