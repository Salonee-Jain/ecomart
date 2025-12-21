import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { CreatePaymentIntentDto, ConfirmPaymentIntentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) { }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create payment intent for an order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createPaymentIntent(@Request() req, @Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(
      req.user._id,
      createPaymentIntentDto,
      req.user.isAdmin,
    );
  }
  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Request() req, @Param('id') id: string) {
    return this.paymentService.getPaymentById(req.user._id, id, req.user.isAdmin);
  }

  @Post('confirm/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm payment intent (testing only)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async confirmPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() confirmPaymentIntentDto: ConfirmPaymentIntentDto,
  ) {
    return this.paymentService.confirmPaymentIntent(paymentIntentId, confirmPaymentIntentDto);
  }

  @Put(':id/mark-succeeded')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark payment as succeeded (Admin only - for testing)' })
  @ApiResponse({ status: 200, description: 'Payment marked as succeeded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async markPaymentSucceeded(@Param('id') id: string) {
    return this.paymentService.markPaymentSucceeded(id);
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.stripeWebhookService.handleWebhook(req.rawBody, signature);
  }
}
