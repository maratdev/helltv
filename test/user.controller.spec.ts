import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../src/controllers/user.controller';
import { UserService } from '../src/services/user.service';
import { CreateUserDto, User } from '../libs/shared/src';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        balance: 1000,
      };

      const expectedUser: User = {
        id: 1,
        balance: 1000,
        createdAt: new Date('2025-01-19T12:00:00.000Z'),
        updatedAt: new Date('2025-01-19T12:00:00.000Z'),
      };

      mockUserService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const userId = 1;
      const expectedUser: User = {
        id: 1,
        balance: 750,
        createdAt: new Date('2025-01-19T12:00:00.000Z'),
        updatedAt: new Date('2025-01-19T12:00:00.000Z'),
      };

      mockUserService.findById.mockResolvedValue(expectedUser);

      const result = await controller.findById(userId);

      expect(mockUserService.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });
});
