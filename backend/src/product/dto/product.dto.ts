import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  Min, 
  IsNumberString 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Wireless Mouse' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product SKU', example: 'WM-001' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiPropertyOptional({ description: 'Product brand', example: 'Logitech' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Product price', example: 29.99 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product category', example: 'Electronics' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Ergonomic wireless mouse with 2.4GHz connection'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/mouse.jpg'
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiPropertyOptional({ description: 'Stock quantity', example: 100, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'Wireless Mouse' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'WM-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Product brand', example: 'Logitech' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Product price', example: 29.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Product category', example: 'Electronics' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Ergonomic wireless mouse' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/mouse.jpg'
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Stock quantity', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class QueryProductDto {
  @ApiPropertyOptional({ description: 'Search keyword for product name', example: 'mouse' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Filter by category', example: 'Electronics' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter', example: '10' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ description: 'Maximum price filter', example: '100' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: '1', default: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'price_asc',
    enum: ['latest', 'price_asc', 'price_desc', 'stock', 'alpha']
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
