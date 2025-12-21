import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { CreatePaymentIntentDto, ConfirmPaymentIntentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
  }

  async createPaymentIntent(userId: string, createPaymentIntentDto: CreatePaymentIntentDto, isAdmin: boolean) {
    const { orderId } = createPaymentIntentDto;

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // User can only pay for their own order
    if (!isAdmin && order.user.toString() !== userId) {
      throw new ForbiddenException('Not authorized');
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
      },
    });

    // Save payment record to database
    const payment = await this.paymentModel.create({
      order: orderId,
      user: userId,
      paymentIntentId: paymentIntent.id,
      amount: order.totalPrice,
      currency: 'aud',
      status: 'pending',
      metadata: {
        orderId,
        userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      stripePaymentIntentId: paymentIntent.id,
    };
  }

  async getPaymentById(userId: string, paymentId: string, isAdmin: boolean) {
    const payment = await this.paymentModel
      .findById(paymentId)
      .populate('order')
      .populate('user', 'name email');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only allow user or admin to view payment
    if (!isAdmin && payment.user._id.toString() !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return payment;
  }

  async getAllPayments() {
    try {
      const payments = await this.paymentModel
        .find()
        .populate('user', 'name email')
        .populate('order')
        .sort({ createdAt: -1 });

      return {
        count: payments.length,
        payments,
      };
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, confirmPaymentIntentDto: ConfirmPaymentIntentDto) {
    const { paymentMethod } = confirmPaymentIntentDto;

    try {
      const pm = paymentMethod || 'pm_card_visa';

      const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: pm,
      });

      await this.paymentModel.findOneAndUpdate(
        { paymentIntentId: paymentIntentId },
        {
          status: confirmedIntent.status,
          paymentMethod: confirmedIntent.payment_method as string,
        },
      );

      return {
        success: true,
        message: 'Payment intent confirmed successfully',
        paymentIntent: {
          id: confirmedIntent.id,
          status: confirmedIntent.status,
          amount: confirmedIntent.amount / 100,
          currency: confirmedIntent.currency,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to confirm payment: ${error.message}`);
    }
  }
}
