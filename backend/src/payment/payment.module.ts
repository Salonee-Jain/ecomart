import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthModule,
    EmailModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeWebhookService],
  exports: [PaymentService],
})
export class PaymentModule {}
