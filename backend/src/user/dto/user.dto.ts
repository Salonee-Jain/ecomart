import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsBoolean()
  isAdmin: boolean;
}
