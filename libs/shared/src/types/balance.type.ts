import { ApiProperty } from '@nestjs/swagger';

export class BalanceInfo {
  @ApiProperty({
    description: 'Баланс',
    example: 750,
  })
  balance: number;

  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  userId: number;
}

export interface TransactionRequest {
  userId: number;
  amount: number;
  description?: string;
}
