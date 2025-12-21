import { IsNotEmpty, IsMongoId, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID to add to cart', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity', example: 3 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class MergeCartDto {
  @ApiProperty({ 
    description: 'Cart items to merge', 
    example: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number' }
      }
    }
  })
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
