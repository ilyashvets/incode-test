import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChangeBossRequestDto {
  @IsNumber()
  @IsNotEmpty()
  bossId: number;

  @IsNumber()
  @IsNotEmpty()
  subordinateId: number;
}
