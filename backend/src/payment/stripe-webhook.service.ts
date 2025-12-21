import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { RabbitmqService } from '../email/rabbitmq.service';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
    private rabbitmqService: RabbitmqService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Payment succeeded
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;

      const order = await this.orderModel.findById(orderId);

      if (!order) {
        return {
          status: 'error',
          message: 'Order not found',
        };
      }

      // Prevent double marking
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();

        // Reduce stock
        for (const item of order.orderItems) {
          const product = await this.productModel.findById(item.product);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          }
        }

        await order.save();
      }

      // Send message to RabbitMQ queue
      const channel = this.rabbitmqService.getChannel();

      if (channel) {
        channel.sendToQueue(
          'emailQueue',
          Buffer.from(
            JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              orderId,
              userId: order.user.toString(),
            }),
          ),
        );

        console.log('📨 Email job sent to RabbitMQ');
      } else {
        console.log('❌ RabbitMQ channel not initialized yet!');
      }
    }

    return { received: true };
  }
}
