import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { UserRepository, User } from '../../libs/shared/src';

@Injectable()
export abstract class BaseService {
  protected constructor(
    @Inject('UserRepository') protected readonly userRepository: UserRepository,
  ) {}

  /**
   * Проверяет существование пользователя и возвращает его
   * @param userId - ID пользователя
   * @returns Promise<User> - найденный пользователь
   * @throws NotFoundException - если пользователь не найден
   */
  protected async validateUserExists(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Проверяет достаточность средств у пользователя для операции списания
   * @param user - пользователь
   * @param amount - сумма для списания
   * @throws BadRequestException - если недостаточно средств
   */
  protected validateSufficientFunds(user: User, amount: number): void {
    if (user.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }
  }

  /**
   * Проверяет корректность суммы операции
   * @param amount - сумма
   * @throws BadRequestException - если сумма некорректна
   */
  protected validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    if (!Number.isFinite(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }
  }
}
