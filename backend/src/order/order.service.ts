import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { orderItems, shippingAddress, paymentMethod } = createOrderDto;

    if (!orderItems || orderItems.length === 0) {
      throw new BadRequestException('No order items');
    }

    // Validate stock for each item
    for (const item of orderItems) {
      const product = await this.productModel.findById(item.product);

      if (!product) {
        throw new NotFoundException(`Product not found: ${item.name}`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${item.name}. Only ${product.stock} available.`,
        );
      }
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = Number((0.1 * itemsPrice).toFixed(2)); // 10% GST
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = new this.orderModel({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const savedOrder = await order.save();

    // Return the order (payment intent will be created separately by frontend)
    return savedOrder;
  }

  async getMyOrders(userId: string) {
    return await this.orderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getOrderById(userId: string, orderId: string, isAdmin: boolean) {
    const order = await this.orderModel.findById(orderId).populate('user', 'name email');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (isAdmin) {
      return order;
    }

    if (order.user._id.toString() === userId) {
      return order;
    }

    throw new ForbiddenException('Not authorized to view this order');
  }

  async getAllOrders() {
    return await this.orderModel.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  }

  async markOrderPaid(userId: string, orderId: string, isAdmin: boolean) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only owner or admin
    if (!isAdmin && order.user.toString() !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // If already paid
    if (order.isPaid) {
      throw new BadRequestException('Order already paid');
    }

    // Mark order as paid
    order.isPaid = true;
    order.paidAt = new Date();

    // Reduce stock for each order item
    for (const item of order.orderItems) {
      const product = await this.productModel.findById(item.product);

      if (!product) continue;

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${item.name}`);
      }

      product.stock = product.stock - item.quantity;
      await product.save();
    }

    return await order.save();
  }

  async getOrderAnalytics() {
    try {
      const totalOrders = await this.orderModel.countDocuments();
      const paidOrders = await this.orderModel.find({ isPaid: true });
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      const pendingOrders = await this.orderModel.countDocuments({
        isPaid: false,
        isCancelled: false,
      });
      const completedOrders = await this.orderModel.countDocuments({ isDelivered: true });
      const cancelledOrders = await this.orderModel.countDocuments({ isCancelled: true });

      const recentOrders = await this.orderModel
        .find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyRevenue = await this.orderModel.aggregate([
        {
          $match: {
            isPaid: true,
            paidAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidAt' },
              month: { $month: '$paidAt' },
            },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]);

      return {
        summary: {
          totalOrders,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
          completedOrders,
          cancelledOrders,
        },
        recentOrders,
        monthlyRevenue,
      };
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  async cancelOrder(userId: string, orderId: string, isAdmin: boolean) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only owner or admin
    if (!isAdmin && order.user.toString() !== userId) {
      throw new ForbiddenException('Not authorized to cancel this order');
    }

    // Can't cancel delivered orders
    if (order.isDelivered) {
      throw new BadRequestException('Delivered orders cannot be cancelled');
    }

    // Restock products only if order was paid
    if (order.isPaid) {
      for (const item of order.orderItems) {
        const product = await this.productModel.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.isCancelled = true;
    order.cancelledAt = new Date();

    return await order.save();
  }

  async markOrderDelivered(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();

    return await order.save();
  }
}
