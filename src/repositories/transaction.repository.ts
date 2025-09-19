import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import {
  Transaction,
  TransactionRepository,
  TransactionAction,
  cacheConfig,
} from '../../libs/shared/src';
import { BaseRepository } from './base.repository';

@Injectable()
export class TransactionRepositoryImpl
  extends BaseRepository
  implements TransactionRepository
{
  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super(prisma);
  }

  async create(data: Partial<Transaction>): Promise<Transaction> {
    if (!data.userId || !data.action || data.amount === undefined) {
      throw new Error(
        'Missing required fields: userId, action, and amount are required',
      );
    }

    const transaction = await this.executeWithErrorHandling<Transaction>(
      'create transaction',
      async () => {
        const result = await this.prisma.transaction.create({
          data: {
            userId: data.userId!,
            action: data.action!,
            amount: data.amount!,
          },
        });
        return { ...result, action: result.action as TransactionAction };
      },
      { userId: data.userId, action: data.action, amount: data.amount },
    );

    // Инвалидируем кеш при создании транзакции
    await this.cacheManager.del(
      `${cacheConfig?.keyPrefix?.balance || 'balance:'}${data.userId}`,
    );
    await this.cacheManager.del(
      `${cacheConfig?.keyPrefix?.transactions || 'transactions:'}${data.userId}`,
    );

    return transaction;
  }

  async findByUserId(userId: number): Promise<Transaction[]> {
    const cacheKey = `${cacheConfig?.keyPrefix?.transactions || 'transactions:'}${userId}`;

    // Проверяем кеш
    const cached = await this.cacheManager.get<Transaction[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const transactions = await this.executeWithErrorHandling<Transaction[]>(
      'find transactions by user id',
      async () => {
        const result = await this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { ts: 'desc' },
        });
        return result.map((item) => ({
          ...item,
          action: item.action as TransactionAction,
        }));
      },
      { userId },
    );

    // Кешируем с настройкой из конфига
    await this.cacheManager.set(
      cacheKey,
      transactions,
      cacheConfig?.ttl?.transactions || 300000,
    );

    return transactions;
  }

  async getTransactionHistory(
    userId: number,
    limit = 50,
    offset = 0,
  ): Promise<Transaction[]> {
    return this.executeWithErrorHandling<Transaction[]>(
      'get transaction history',
      async () => {
        const result = await this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { ts: 'desc' },
          take: limit,
          skip: offset,
        });
        return result.map((item) => ({
          ...item,
          action: item.action as TransactionAction,
        }));
      },
      { userId, limit, offset },
    );
  }

  async findById(id: number): Promise<Transaction | null> {
    return this.executeWithErrorHandling<Transaction | null>(
      'find transaction by id',
      async () => {
        const result = await this.prisma.transaction.findUnique({
          where: { id },
        });
        return result
          ? { ...result, action: result.action as TransactionAction }
          : null;
      },
      { id },
    );
  }
}
