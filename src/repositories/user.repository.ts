import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User, UserRepository } from '../../libs/shared/src';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepositoryImpl
  extends BaseRepository
  implements UserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Partial<User>): Promise<User> {
    return this.executeWithErrorHandling<User>(
      'create user',
      () =>
        this.prisma.user.create({
          data: {
            balance: data.balance ?? 0,
          },
        }),
      { balance: data.balance },
    );
  }

  async findById(id: number): Promise<User | null> {
    return this.executeWithErrorHandling<User | null>(
      'find user by id',
      () =>
        this.prisma.user.findUnique({
          where: { id },
        }),
      { id },
    );
  }

  async updateBalance(id: number, balance: number): Promise<User> {
    return this.executeWithErrorHandling<User>(
      'update user balance',
      () =>
        this.prisma.user.update({
          where: { id },
          data: { balance },
        }),
      { id, balance },
    );
  }
}
