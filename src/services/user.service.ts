import { Inject, Injectable } from '@nestjs/common';
import type {
  TransactionRepository,
  User,
  UserRepository,
  TransactionAction,
} from '../../libs/shared/src';
import { CreateUserDto } from '../../libs/shared/src';
import { BaseService } from './base.service';
import { BalanceService } from './balance.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @Inject('UserRepository') userRepository: UserRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly balanceService: BalanceService,
  ) {
    super(userRepository);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create({ balance: 0 });

    if (createUserDto.balance && createUserDto.balance > 0) {
      await this.transactionRepository.create({
        userId: user.id,
        action: 'credit' as TransactionAction,
        amount: createUserDto.balance,
      });

      return await this.balanceService.recalculateBalance(user.id);
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    return this.validateUserExists(id);
  }
}
