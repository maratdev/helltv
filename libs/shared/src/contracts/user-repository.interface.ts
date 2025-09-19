import { User } from '../types';

export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: number): Promise<User | null>;
  updateBalance(id: number, balance: number): Promise<User>;
}
