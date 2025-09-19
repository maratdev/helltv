export type TransactionAction = 'credit' | 'debit';

export interface Transaction {
  id: number;
  userId: number;
  action: TransactionAction;
  amount: number;
  ts: Date;
}
