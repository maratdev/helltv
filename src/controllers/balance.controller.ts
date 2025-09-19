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
import { BalanceService } from '../services/balance.service';
import { BalanceInfo, BalanceOperationDto } from '../../libs/shared/src';

@ApiTags('balance')
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @ApiOperation({
    summary: 'Списание средств',
    description: 'Покупка предметов. Списывает сумму с баланса.',
  })
  @ApiBody({
    type: BalanceOperationDto,
    description: 'Данные операции',
    examples: {
      purchase: {
        summary: 'Покупка',
        value: {
          userId: 1,
          amount: 100,
          description: 'Меч света',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Успешно',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number', example: 500 },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка данных' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Post('debit')
  @HttpCode(HttpStatus.OK)
  async debit(@Body() operation: BalanceOperationDto): Promise<BalanceInfo> {
    return this.balanceService.debit(operation);
  }

  @ApiOperation({
    summary: 'Пополнение баланса',
    description: 'Пополняет баланс на указанную сумму.',
  })
  @ApiBody({
    type: BalanceOperationDto,
    description: 'Данные операции',
    examples: {
      deposit: {
        summary: 'Пополнение',
        value: {
          userId: 1,
          amount: 500,
          description: 'Банковская карта',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Успешно',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number', example: 1000 },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ошибка данных' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Post('credit')
  @HttpCode(HttpStatus.OK)
  async credit(@Body() operation: BalanceOperationDto): Promise<BalanceInfo> {
    return this.balanceService.credit(operation);
  }

  @ApiOperation({
    summary: 'Получение баланса',
    description: 'Возвращает баланс пользователя.',
  })
  @ApiParam({
    name: 'userId',
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
        balance: { type: 'number', example: 750 },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':userId')
  async getBalance(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BalanceInfo> {
    return this.balanceService.getBalance(userId);
  }

  @ApiOperation({
    summary: 'Пересчет баланса',
    description: 'Пересчитывает баланс по истории транзакций.',
  })
  @ApiParam({
    name: 'userId',
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
        balance: { type: 'number', example: 750 },
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':userId/recalculate')
  @HttpCode(HttpStatus.OK)
  async recalculateBalance(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BalanceInfo> {
    const updatedUser = await this.balanceService.recalculateBalance(userId);
    return { balance: updatedUser.balance, userId };
  }
}
