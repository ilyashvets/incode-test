import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Role } from 'shared/enum';

export class SetRoleRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
