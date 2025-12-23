import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from './email.service';
import { Order, OrderDocument } from '../schemas/order.schema';
import { SendTestEmailDto, SendOrderEmailDto } from './dto/email.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

@ApiTags('Email')
@ApiBearerAuth('JWT-auth')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  @Post('test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - email recipient required' })
  async sendTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
    const { to, subject, html } = sendTestEmailDto;

    if (!to) {
      throw new BadRequestException('Email recipient required');
    }

    try {
      await this.emailService.sendEmail(
        to,
        subject || 'Test Email from EcoMart',
        html ||
          '<h1>This is a test email</h1><p>If you received this, your email setup is working!</p>',
      );

      return {
        success: true,
        message: 'Test email sent successfully',
        to,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  @Post('payment-success/:orderId')
  async sendPaymentSuccessEmail(@Request() req, @Param('orderId') orderId: string) {
    try {
      const order = await this.orderModel.findById(orderId).populate('user');

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Only allow user or admin to send email
      if (!req.user.isAdmin && order.user._id.toString() !== req.user.id.toString()) {
        throw new ForbiddenException('Not authorized');
      }

      const user = order.user as any;
      const emailHtml = this.emailService.paymentSuccessTemplate(order);

      await this.emailService.sendEmail(user.email, 'Your Payment Was Successful 🎉', emailHtml);

      return {
        success: true,
        message: 'Payment success email sent',
        to: user.email,
        orderId: order._id,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  @Post('order/:orderId')
  @UseGuards(AdminGuard)
  async sendOrderEmail(
    @Param('orderId') orderId: string,
    @Body() sendOrderEmailDto: SendOrderEmailDto,
  ) {
    const { to, subject, template } = sendOrderEmailDto;

    try {
      const order = await this.orderModel.findById(orderId).populate('user');

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const user = order.user as any;
      const recipient = to || user.email;
      const emailSubject = subject || `Order Update - ${order._id}`;

      let emailHtml: string;
      if (template === 'payment-success') {
        emailHtml = this.emailService.paymentSuccessTemplate(order);
      } else {
        emailHtml = `
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.isPaid ? 'Paid' : 'Pending'}</p>
        <p><strong>Total:</strong> $${order.totalPrice}</p>
      `;
      }

      await this.emailService.sendEmail(recipient, emailSubject, emailHtml);

      return {
        success: true,
        message: 'Order email sent',
        to: recipient,
        orderId: order._id,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
