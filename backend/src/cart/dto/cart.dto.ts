import { IsNotEmpty, IsMongoId, IsNumber, IsArray, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class MergeCartDto {
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
