import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendTestEmailDto {
  @ApiProperty({ description: 'Email recipient', example: 'test@example.com' })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiPropertyOptional({ description: 'Email subject', example: 'Test Email' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Email HTML content', example: '<h1>Hello</h1>' })
  @IsOptional()
  @IsString()
  html?: string;
}

export class SendOrderEmailDto {
  @ApiPropertyOptional({ description: 'Email recipient', example: 'customer@example.com' })
  @IsOptional()
  @IsEmail()
  to?: string;

  @ApiPropertyOptional({ description: 'Email subject', example: 'Order Confirmation' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Email template name', example: 'order-confirmation' })
  @IsOptional()
  @IsString()
  template?: string;
}
