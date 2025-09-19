import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto, User } from '../../libs/shared/src';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Создание пользователя',
    description: 'Создает нового пользователя с начальным балансом.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Данные пользователя',
    examples: {
      newUser: {
        summary: 'Новый пользователь',
        value: {
          balance: 1000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        balance: { type: 'number', example: 1000 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка данных' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Получение пользователя',
    description: 'Возвращает пользователя по ID.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID пользователя',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Успешно',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        balance: { type: 'number', example: 1000 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findById(id);
  }
}
