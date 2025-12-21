import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { RabbitmqService } from './rabbitmq.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), AuthModule],
  controllers: [EmailController],
  providers: [EmailService, RabbitmqService],
  exports: [EmailService, RabbitmqService],
})
export class EmailModule {}
