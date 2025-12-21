import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({ description: 'User full name', example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'User email address', example: 'jane@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'New password (min 6 characters)', example: 'newpassword123' })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}
