import { IsNotEmpty, IsArray, IsObject, IsString, ValidateNested, IsMongoId, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ description: 'Product ID', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  product: string;

  @ApiProperty({ description: 'Product name', example: 'Wireless Mouse' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product SKU', example: 'WM-001' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Product image URL', example: 'https://example.com/images/mouse.jpg' })
  @IsNotEmpty()
  @IsString()
  image: string;
}

class ShippingAddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'City', example: 'Sydney' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal code', example: '2000' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'Australia' })
  @IsNotEmpty()
  @IsString()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Array of order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ description: 'Shipping address', type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ description: 'Payment method', example: 'stripe' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'Is order delivered', example: true })
  @IsNotEmpty()
  isDelivered: boolean;
}
