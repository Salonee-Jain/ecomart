import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid order data' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user._id, createOrderDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(@Request() req) {
    return this.orderService.getMyOrders(req.user._id);
  }

  @Get('analytics')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get order analytics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getOrderAnalytics() {
    return this.orderService.getOrderAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user._id, id, req.user.isAdmin);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Mark order as paid' })
  @ApiResponse({ status: 200, description: 'Order marked as paid successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async markOrderPaid(@Request() req, @Param('id') id: string) {
    return this.orderService.markOrderPaid(req.user._id, id, req.user.isAdmin);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Request() req, @Param('id') id: string) {
    return this.orderService.cancelOrder(req.user._id, id, req.user.isAdmin);
  }

  @Put(':id/deliver')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Mark order as delivered (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order marked as delivered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async markOrderDelivered(@Param('id') id: string) {
    return this.orderService.markOrderDelivered(id);
  }
}
