# HellTV

Система управления балансом пользователей с поддержкой транзакций.

## Описание

NestJS приложение для управления балансом пользователей с возможностью пополнения и списания средств. Включает в себя систему транзакций, кеширование и интеграцию с PostgreSQL и Redis.

## Технологии

- **Node.js 22** - JavaScript runtime
- **NestJS** - Node.js фреймворк
- **TypeScript** - типизированный JavaScript
- **PostgreSQL 17** - основная база данных
- **Redis 8** - кеширование
- **Prisma** - ORM для работы с базой данных
- **Docker** - контейнеризация

### Доступ к сервисам

- **Приложение**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379


## Установка

```bash
npm install
```

## Запуск

### Локальная разработка

```bash
# Режим разработки
npm run start:dev

# Продакшн режим
npm run start:prod
```

## Docker

### Пошаговая настройка

#### 0. Настройка переменных окружения

```bash
# Скопировать пример конфигурации
cp .env.example .env

# Отредактировать переменные (опционально)
nano .env
```

#### 1. Первый запуск (Разработка)

```bash
# Шаг 1: Запустить контейнеры разработки
make dev

# Шаг 2: В другом терминале запустить миграции
make migrate

# Шаг 3: Проверить логи
make logs
```


#### 2. Проверка работы API

```bash
# Создать пользователя
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"balance": 1000}'

# Получить баланс
curl http://localhost:3000/api/balance/1

# Пополнить баланс
curl -X POST http://localhost:3000/api/balance/credit \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 500}'

# Списать с баланса
curl -X POST http://localhost:3000/api/balance/debit \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 200}'
```

#### 3. Продакшн запуск

```bash
# Запустить продакшн
make up

# Запустить миграции
make migrate

# Проверить логи
make logs
```

#### 4. Остановка

```bash
# Остановить все контейнеры
make down

# Очистить все (включая данные)
make clean
```

### Альтернативные команды

```bash
# Разработка (альтернатива)
docker compose -f docker-compose.dev.yml up -d --build
docker exec helltv_app_dev npx prisma migrate deploy

# Продакшн (альтернатива)
docker compose up -d --build
docker exec helltv_app npx prisma migrate deploy

# Ручные миграции
docker exec -it helltv_app_dev sh
npx prisma migrate deploy
exit
```


## Тестирование

### Запуск тестов

```bash
# Юнит тесты
npm run test:unit

# Интеграционные тесты
npm run test:integration

# Все тесты
npm run test

# Тесты с покрытием
npm run test:cov
```
## Структура проекта

```
src/
├── controllers/     # REST API контроллеры
├── services/        # Бизнес-логика
├── repositories/    # Работа с данными
├── prisma/         # Prisma схема и миграции
└── types/          # TypeScript типы

libs/shared/src/
├── contracts/      # Интерфейсы репозиториев
├── dtos/          # Data Transfer Objects
├── types/         # Общие типы
└── config/        # Конфигурация
```

## CI/CD

Автоматические проверки при push/PR:
- ✅ Линтинг кода
- ✅ Юнит тесты  
- ✅ Интеграционные тесты
- ✅ Сборка приложения

## Лицензия

MIT
