import { Transaction } from '../types';

export interface TransactionRepository {
  create(data: Partial<Transaction>): Promise<Transaction>;
  findByUserId(userId: number): Promise<Transaction[]>;
  getTransactionHistory(
    userId: number,
    limit?: number,
    offset?: number,
  ): Promise<Transaction[]>;
}
