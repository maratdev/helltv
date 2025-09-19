import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from '../src/controllers/balance.controller';
import { BalanceService } from '../src/services/balance.service';
import { BalanceInfo, BalanceOperationDto } from '../libs/shared/src';

describe('BalanceController', () => {
  let controller: BalanceController;

  const mockBalanceService = {
    debit: jest.fn(),
    credit: jest.fn(),
    getBalance: jest.fn(),
    recalculateBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('debit', () => {
    it('should debit amount from user balance', async () => {
      const operation: BalanceOperationDto = {
        userId: 1,
        amount: 100,
        description: 'Test purchase',
      };

      const expectedResult: BalanceInfo = {
        balance: 400,
        userId: 1,
      };

      mockBalanceService.debit.mockResolvedValue(expectedResult);

      const result = await controller.debit(operation);

      expect(mockBalanceService.debit).toHaveBeenCalledWith(operation);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('credit', () => {
    it('should credit amount to user balance', async () => {
      const operation: BalanceOperationDto = {
        userId: 1,
        amount: 500,
        description: 'Test deposit',
      };

      const expectedResult: BalanceInfo = {
        balance: 1000,
        userId: 1,
      };

      mockBalanceService.credit.mockResolvedValue(expectedResult);

      const result = await controller.credit(operation);

      expect(mockBalanceService.credit).toHaveBeenCalledWith(operation);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      const userId = 1;
      const expectedResult: BalanceInfo = {
        balance: 750,
        userId: 1,
      };

      mockBalanceService.getBalance.mockResolvedValue(expectedResult);

      const result = await controller.getBalance(userId);

      expect(mockBalanceService.getBalance).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('recalculateBalance', () => {
    it('should recalculate user balance', async () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        balance: 800,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBalanceService.recalculateBalance.mockResolvedValue(mockUser);

      const result = await controller.recalculateBalance(userId);

      expect(mockBalanceService.recalculateBalance).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({
        balance: mockUser.balance,
        userId: 1,
      });
    });
  });
});
