import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BaseRepository as IBaseRepository } from '../../libs/shared/src';

@Injectable()
export abstract class BaseRepository implements IBaseRepository {
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(protected readonly prisma: PrismaService) {}

  /**
   * Обрабатывает ошибки Prisma и логирует их
   * @param operation - название операции
   * @param error - ошибка
   * @param context - дополнительный контекст
   */
  protected handleError(
    operation: string,
    error: unknown,
    context?: Record<string, any>,
  ): never {
    const errorMessage = `Failed to ${operation}`;
    const errorContext = context ? ` Context: ${JSON.stringify(context)}` : '';

    this.logger.error(
      `${errorMessage}${errorContext}`,
      error instanceof Error ? error.stack : String(error),
    );

    // Можно добавить специфичную обработку разных типов ошибок Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        throw new Error(`Duplicate entry: ${errorMessage}`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Record not found: ${errorMessage}`);
      }
    }

    throw new Error(errorMessage);
  }

  /**
   * Выполняет операцию с обработкой ошибок
   * @param operation - название операции
   * @param fn - функция для выполнения
   * @param context - дополнительный контекст
   */
  protected async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(operation, error, context);
    }
  }

  /**
   * Создает новую запись
   * @param data - данные для создания
   * @returns Promise<unknown> - созданная запись
   */
  abstract create(data: unknown): Promise<unknown>;

  /**
   * Находит запись по ID
   * @param id - ID записи
   * @returns Promise<unknown | null> - найденная запись или null
   */
  abstract findById(id: number): Promise<unknown>;
}
