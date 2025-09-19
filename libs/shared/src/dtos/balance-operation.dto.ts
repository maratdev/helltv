import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BalanceOperationDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Сумма',
    example: 100,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Описание',
    example: 'Меч света',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
