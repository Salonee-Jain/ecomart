import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'Set user admin status', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isAdmin: boolean;
}
