import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { UserService } from '../../src/services/user.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateUserDto } from '../../libs/shared/src';

describe('UserService Integration', () => {
  let app: INestApplication;
  let userService: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userService = app.get<UserService>(UserService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await (prisma as any)
      .$executeRaw`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create user in database with initial balance', async () => {
      const createUserDto: CreateUserDto = {
        balance: 1000,
      };

      const result = await userService.create(createUserDto);

      expect(result.id).toBeDefined();
      expect(result.balance).toBe(1000);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      const userInDb = await (prisma as any).user.findUnique({
        where: { id: result.id },
      });

      expect(userInDb).toBeDefined();
      expect(userInDb?.balance).toBe(1000);
      expect(userInDb?.id).toBe(result.id);

      const transaction = await (prisma as any).transaction.findFirst({
        where: { userId: result.id },
      });

      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(1000);
      expect(transaction?.action).toBe('credit');
    });

    it('should create user with zero balance by default', async () => {
      const createUserDto: CreateUserDto = {};

      const result = await userService.create(createUserDto);

      expect(result.balance).toBe(0);

      const userInDb = await (prisma as any).user.findUnique({
        where: { id: result.id },
      });

      expect(userInDb?.balance).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find user by id from database', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 750 },
      });

      const result = await userService.findById(user.id);

      expect(result.id).toBe(user.id);
      expect(result.balance).toBe(750);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      await expect(userService.findById(99999)).rejects.toThrow();
    });
  });

  describe('user existence validation', () => {
    it('should work correctly when user exists', async () => {
      const user = await (prisma as any).user.create({
        data: { balance: 500 },
      });

      const foundUser = await userService.findById(user.id);

      expect(foundUser.id).toBe(user.id);
    });

    it('should throw error when user does not exist', async () => {
      await expect(userService.findById(99999)).rejects.toThrow();
    });
  });
});
