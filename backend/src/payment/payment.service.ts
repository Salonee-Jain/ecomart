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

      // Map payments to include all necessary fields for admin
      const paymentsWithDetails = payments.map(payment => {
        const order = payment.order as any;
        const user = payment.user as any;
        const paymentObj = payment.toObject();

        return {
          _id: payment._id,
          orderId: order?._id?.toString() || null,

          // Payment Details
          paymentIntentId: payment.paymentIntentId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod || 'stripe',

          // Customer Information
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },

          // Order Information
          order: {
            _id: order?._id,
            totalPrice: order?.totalPrice || payment.amount,
            isPaid: order?.isPaid || false,
            isDelivered: order?.isDelivered || false,
            isCancelled: order?.isCancelled || false,
            paymentMethod: order?.paymentMethod || 'stripe',
            itemsCount: order?.orderItems?.length || 0,
          },

          // Timestamps
          createdAt: paymentObj.createdAt,
          updatedAt: paymentObj.updatedAt,
          paidAt: order?.paidAt || null,

          // Metadata
          metadata: payment.metadata,
        };
      });

      return {
        count: paymentsWithDetails.length,
        payments: paymentsWithDetails,
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

  async markPaymentSucceeded(paymentId: string) {
    try {
      const payment = await this.paymentModel.findById(paymentId).populate('order');

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment status
      payment.status = 'succeeded';
      await payment.save();

      // Mark associated order as paid
      const order = await this.orderModel.findById(payment.order);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
      }

      return {
        success: true,
        message: 'Payment marked as succeeded',
        payment: {
          id: payment._id,
          status: payment.status,
          orderId: payment.order,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update payment: ${error.message}`);
    }
  }
}
