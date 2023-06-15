import { IsNotEmpty, IsNumber } from 'class-validator';

export class SetSubordinateRequestDto {
  @IsNumber()
  @IsNotEmpty()
  bossId: number;

  @IsNumber()
  @IsNotEmpty()
  subordinateId: number;
}
