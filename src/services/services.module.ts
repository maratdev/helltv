import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { BalanceService } from './balance.service';
import { UserService } from './user.service';

@Module({
  imports: [RepositoriesModule],
  providers: [BalanceService, UserService],
  exports: [BalanceService, UserService],
})
export class ServicesModule {}
