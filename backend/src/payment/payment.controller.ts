import { Controller, Get, Post, Body, Param, UseGuards, Request, RawBodyRequest, Req, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { CreatePaymentIntentDto, ConfirmPaymentIntentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Request() req, @Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(
      req.user._id,
      createPaymentIntentDto,
      req.user.isAdmin,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(@Request() req, @Param('id') id: string) {
    return this.paymentService.getPaymentById(req.user._id, id, req.user.isAdmin);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Post('confirm/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  async confirmPaymentIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() confirmPaymentIntentDto: ConfirmPaymentIntentDto,
  ) {
    return this.paymentService.confirmPaymentIntent(paymentIntentId, confirmPaymentIntentDto);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    return this.stripeWebhookService.handleWebhook(req.rawBody, signature);
  }
}
