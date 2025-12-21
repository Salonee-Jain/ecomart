import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
    @ApiProperty({ description: 'Rating (1-5)', example: 5, minimum: 1, maximum: 5 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ description: 'Review comment', example: 'Great product, highly recommended!' })
    @IsNotEmpty()
    @IsString()
    comment: string;
}
