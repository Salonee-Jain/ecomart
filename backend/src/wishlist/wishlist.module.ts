import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { Wishlist, WishlistSchema } from '../schemas/wishlist.schema';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Wishlist.name, schema: WishlistSchema },
            { name: Product.name, schema: ProductSchema },
        ]),
    ],
    controllers: [WishlistController],
    providers: [WishlistService],
})
export class WishlistModule { }
