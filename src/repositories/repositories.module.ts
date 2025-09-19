import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepositoryImpl } from './user.repository';
import { TransactionRepositoryImpl } from './transaction.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
    {
      provide: 'TransactionRepository',
      useClass: TransactionRepositoryImpl,
    },
  ],
  exports: ['UserRepository', 'TransactionRepository'],
})
export class RepositoriesModule {}
