import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { RabbitmqService } from './email/rabbitmq.service';
import { EmailService } from './email/email.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const rabbitmqService = app.get(RabbitmqService);
  const emailService = app.get(EmailService);
  const orderModel = app.get<Model<OrderDocument>>('OrderModel');

  console.log('🐰 Worker started, listening for email jobs');

  const channel = rabbitmqService.getChannel();

  if (!channel) {
    console.error('❌ RabbitMQ channel not available');
    return;
  }

  channel.consume('emailQueue', async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      console.log('📩 Received job:', data);

      if (data.type === 'PAYMENT_SUCCESS') {
        const order = await orderModel.findById(data.orderId).populate('user');

        if (!order) {
          throw new Error('Order not found');
        }

        const user = order.user as any;
        await emailService.sendEmail(
          user.email,
          'Your Payment Was Successful 🎉',
          emailService.paymentSuccessTemplate(order),
        );

        console.log('📧 Email sent to:', user.email);
      }

      channel.ack(msg);
    } catch (err) {
      console.error('❌ Email worker error:', err.message);
      channel.nack(msg);
    }
  });
}

bootstrap();
