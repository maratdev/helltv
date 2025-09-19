import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type {
  TransactionRepository,
  UserRepository,
} from '../../libs/shared/src';
import {
  BalanceInfo,
  BalanceOperationDto,
  cacheConfig,
  User,
  Transaction,
  TransactionAction,
} from '../../libs/shared/src';
import { BaseService } from './base.service';

const TRANSACTION_ACTIONS = {
  CREDIT: 'credit' as TransactionAction,
  DEBIT: 'debit' as TransactionAction,
} as const;

@Injectable()
export class BalanceService extends BaseService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @Inject('UserRepository') userRepository: UserRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super(userRepository);
  }

  /**
   * Списание средств с баланса пользователя
   * @param operation - данные операции списания
   * @returns Promise<BalanceInfo> - информация о балансе после операции
   */
  async debit(operation: BalanceOperationDto): Promise<BalanceInfo> {
    this.logger.log(
      `Processing debit operation for user ${operation.userId}, amount: ${operation.amount}`,
    );

    return this.processBalanceOperation(operation, TRANSACTION_ACTIONS.DEBIT);
  }

  /**
   * Пополнение баланса пользователя
   * @param operation - данные операции пополнения
   * @returns Promise<BalanceInfo> - информация о балансе после операции
   */
  async credit(operation: BalanceOperationDto): Promise<BalanceInfo> {
    this.logger.log(
      `Processing credit operation for user ${operation.userId}, amount: ${operation.amount}`,
    );

    return this.processBalanceOperation(operation, TRANSACTION_ACTIONS.CREDIT);
  }

  /**
   * Получение текущего баланса пользователя
   * @param userId - ID пользователя
   * @returns Promise<BalanceInfo> - информация о балансе
   */
  async getBalance(userId: number): Promise<BalanceInfo> {
    this.logger.log(`Getting balance for user ${userId}`);

    const user = await this.validateUserExists(userId);
    return { balance: user.balance, userId };
  }

  /**
   * Общий метод для обработки операций с балансом
   * @param operation - данные операции
   * @param action - тип операции (credit/debit)
   * @returns Promise<BalanceInfo> - информация о балансе после операции
   */
  private async processBalanceOperation(
    operation: BalanceOperationDto,
    action: TransactionAction,
  ): Promise<BalanceInfo> {
    const { userId, amount } = operation;

    this.validateAmount(amount);
    const user = await this.validateUserExists(userId);

    if (action === TRANSACTION_ACTIONS.DEBIT) {
      this.validateSufficientFunds(user, amount);
    }

    await this.transactionRepository.create({
      userId,
      action,
      amount,
    });

    await this.invalidateUserCache(userId);

    const updatedUser = await this.recalculateBalance(userId);

    this.logger.log(
      `Balance operation completed for user ${userId}. New balance: ${updatedUser.balance}`,
    );

    return { balance: updatedUser.balance, userId };
  }

  /**
   * Обновление баланса пользователя в базе данных
   * @param userId - ID пользователя
   * @param newBalance - новый баланс
   * @returns Promise<User> - обновленный пользователь
   */
  private async updateUserBalance(
    userId: number,
    newBalance: number,
  ): Promise<User> {
    this.logger.debug(`Updating balance for user ${userId} to ${newBalance}`);
    return this.userRepository.updateBalance(userId, newBalance);
  }

  /**
   * Инвалидация кеша пользователя
   * @param userId - ID пользователя
   */
  private async invalidateUserCache(userId: number): Promise<void> {
    const cacheKey = this.getCacheKey(userId);
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Cache invalidated for user ${userId}`);
  }

  /**
   * Генерация ключа кеша для пользователя
   * @param userId - ID пользователя
   * @returns string - ключ кеша
   */
  private getCacheKey(userId: number): string {
    return `${cacheConfig?.keyPrefix?.balance || 'balance:'}${userId}`;
  }

  /**
   * Пересчет баланса пользователя на основе всех транзакций
   * @param userId - ID пользователя
   * @returns Promise<User> - пользователь с актуальным балансом
   */
  async recalculateBalance(userId: number): Promise<User> {
    const cacheKey = this.getCacheKey(userId);

    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      this.logger.debug(`Balance cache hit for user ${userId}`);
      return cached;
    }

    this.logger.debug(`Recalculating balance for user ${userId}`);

    const transactions = await this.transactionRepository.findByUserId(userId);

    const balance = this.calculateBalanceFromTransactions(transactions);

    const updatedUser = await this.updateUserBalance(userId, balance);

    await this.cacheManager.set(
      cacheKey,
      updatedUser,
      cacheConfig?.ttl?.balance || 30000,
    );

    this.logger.log(
      `Balance recalculated for user ${userId}. New balance: ${balance}`,
    );
    return updatedUser;
  }

  /**
   * Вычисление баланса на основе транзакций
   * @param transactions - массив транзакций
   * @returns number - вычисленный баланс
   */
  private calculateBalanceFromTransactions(
    transactions: Transaction[],
  ): number {
    if (transactions.length === 0) {
      return 0;
    }

    return transactions.reduce((balance, transaction) => {
      if (transaction.action === TRANSACTION_ACTIONS.CREDIT) {
        return balance + transaction.amount;
      } else if (transaction.action === TRANSACTION_ACTIONS.DEBIT) {
        return balance - transaction.amount;
      }
      return balance;
    }, 0);
  }
}
