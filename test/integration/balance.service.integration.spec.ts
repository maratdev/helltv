import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppModule } from '../../src/app.module';
import { BalanceService } from '../../src/services/balance.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BalanceOperationDto } from '../../libs/shared/src';

describe('BalanceService Integration', () => {
  let app: INestApplication;
  let balanceService: BalanceService;
  let prisma: PrismaService;
  let cacheManager: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    balanceService = app.get<BalanceService>(BalanceService);
    prisma = app.get<PrismaService>(PrismaService);
    cacheManager = app.get(CACHE_MANAGER);
  });

  beforeEach(async () => {
    await (prisma as any)
      .$executeRaw`TRUNCATE TABLE "transaction", "user" RESTART IDENTITY CASCADE`;

    try {
      if (cacheManager.reset) {
        await cacheManager.reset();
      }
      if (cacheManager.flushAll) {
        await cacheManager.flushAll();
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  });

  afterEach(async () => {
    try {
      if (cacheManager.reset) {
        await cacheManager.reset();
      }
    } catch (error) {
      console.warn('Cache cleanup after test failed:', error);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('recalculateBalance', () => {
    it('should recalculate balance from transactions', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 1000 },
      });

      await (prisma as any).transaction.createMany({
        data: [
          {
            userId: user.id,
            action: 'credit',
            amount: 500,
          },
          {
            userId: user.id,
            action: 'debit',
            amount: 200,
          },
          {
            userId: user.id,
            action: 'credit',
            amount: 100,
          },
        ],
      });

      const result = await balanceService.recalculateBalance(user.id);

      expect(result.balance).toBe(1400);
      expect(result.id).toBe(user.id);

      const updatedUser = await (prisma as any).user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.balance).toBe(1400);
    });
  });

  describe('debit operation', () => {
    it('should create user, perform debit and save transaction to database', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 1000 },
      });

      const operation: BalanceOperationDto = {
        userId: user.id,
        amount: 150,
      };

      const result = await balanceService.debit(operation);

      expect(result.balance).toBe(850);
      expect(result.userId).toBe(user.id);

      const transaction = await (prisma as any).transaction.findFirst({
        where: { userId: user.id },
      });

      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(150);
      expect(transaction?.action).toBe('debit');

      const updatedUser = await (prisma as any).user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.balance).toBe(850);
    });
  });

  describe('credit operation', () => {
    it('should create user, perform credit and save transaction to database', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 500 },
      });

      const operation: BalanceOperationDto = {
        userId: user.id,
        amount: 300,
      };

      const result = await balanceService.credit(operation);

      expect(result.balance).toBe(800);
      expect(result.userId).toBe(user.id);

      const transaction = await (prisma as any).transaction.findFirst({
        where: { userId: user.id },
      });

      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(300);
      expect(transaction?.action).toBe('credit');
    });
  });

  describe('getBalance', () => {
    it('should return user balance from database', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 750 },
      });

      const result = await balanceService.getBalance(user.id);

      expect(result.balance).toBe(750);
      expect(result.userId).toBe(user.id);
    });
  });
});
