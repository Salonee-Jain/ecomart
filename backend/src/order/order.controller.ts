import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user._id, createOrderDto);
  }

  @Get('my')
  async getMyOrders(@Request() req) {
    return this.orderService.getMyOrders(req.user._id);
  }

  @Get('analytics')
  @UseGuards(AdminGuard)
  async getOrderAnalytics() {
    return this.orderService.getOrderAnalytics();
  }

  @Get(':id')
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user._id, id, req.user.isAdmin);
  }

  @Get()
  @UseGuards(AdminGuard)
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Put(':id/pay')
  async markOrderPaid(@Request() req, @Param('id') id: string) {
    return this.orderService.markOrderPaid(req.user._id, id, req.user.isAdmin);
  }

  @Put(':id/cancel')
  async cancelOrder(@Request() req, @Param('id') id: string) {
    return this.orderService.cancelOrder(req.user._id, id, req.user.isAdmin);
  }

  @Put(':id/deliver')
  @UseGuards(AdminGuard)
  async markOrderDelivered(@Param('id') id: string) {
    return this.orderService.markOrderDelivered(id);
  }
}
