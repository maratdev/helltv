import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Настройка переменных окружения для тестов
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://helltv_user:helltv_password@localhost:5432/helltv_test';

let prisma: PrismaClient;
let isSetupComplete = false;

beforeAll(async () => {
  if (isSetupComplete) return;

  console.log('Настройка тестовой базы данных...');

  try {
    // Применяем миграции к тестовой базе данных
    console.log('Применение миграций Prisma...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    // Создаем экземпляр Prisma для проверки подключения
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Проверяем подключение к БД
    await prisma.$connect();
    console.log('Тестовая база данных готова!');
    isSetupComplete = true;
  } catch (error) {
    console.error('Ошибка настройки тестовой базы данных:', error);
    console.log(
      'Убедитесь, что PostgreSQL запущен и доступен по адресу localhost:5432',
    );
    console.log(
      'Для запуска используйте: docker compose -f docker-compose.dev.yml up postgres -d',
    );
    throw error;
  }
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});
