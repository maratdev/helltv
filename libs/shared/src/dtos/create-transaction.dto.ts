import { IsNumber, IsString, IsEnum, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsEnum(['credit', 'debit'])
  action: 'credit' | 'debit';

  @IsNumber()
  @Min(0.01)
  amount: number;
}
