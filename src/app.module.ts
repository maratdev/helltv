import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { ServicesModule } from './services/services.module';
import { AppController } from './app.controller';
import { BalanceController } from './controllers/balance.controller';
import { UserController } from './controllers/user.controller';
import serverConfig from '../libs/shared/src/config/server.config';
import { redisConfig, cacheConfig } from '../libs/shared/src';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig],
    }),
    CacheModule.register({
      store: redisStore,
      ...redisConfig,
      ttl: cacheConfig?.ttl?.default || 300000,
      isGlobal: true,
    }),
    PrismaModule,
    RepositoriesModule,
    ServicesModule,
  ],
  controllers: [AppController, BalanceController, UserController],
})
export class AppModule {}
