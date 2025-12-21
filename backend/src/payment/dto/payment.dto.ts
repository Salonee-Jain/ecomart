import { IsNotEmpty, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;
}

export class ConfirmPaymentIntentDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
