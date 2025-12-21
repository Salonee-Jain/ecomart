import { IsNotEmpty, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID to create payment for', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;
}

export class ConfirmPaymentIntentDto {
  @ApiPropertyOptional({ description: 'Payment method (for testing)', example: 'pm_card_visa' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
