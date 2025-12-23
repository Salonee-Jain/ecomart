import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { Cart, CartSchema } from '../schemas/cart.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Cart.name, schema: CartSchema },
            { name: Payment.name, schema: PaymentSchema },
        ]),
    ],
    controllers: [DatabaseController],
    providers: [DatabaseService],
    exports: [DatabaseService],
})
export class DatabaseModule { }
