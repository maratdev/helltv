#!/bin/bash

# Скрипт для настройки тестовой базы данных

echo "Настройка тестовой базы данных..."

# Проверяем, запущен ли PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "PostgreSQL не запущен. Запустите базу данных сначала:"
    echo "docker compose -f docker-compose.dev.yml up postgres -d"
    exit 1
fi

# Создаем тестовую базу данных если она не существует
echo "Создание тестовой базы данных..."
createdb -h localhost -p 5432 -U helltv_user helltv_test 2>/dev/null || echo "База данных helltv_test уже существует"

# Применяем миграции к тестовой базе данных
echo "Применение миграций к тестовой базе данных..."
export DATABASE_URL="postgresql://helltv_user:helltv_password@localhost:5432/helltv_test"
npx prisma migrate deploy

echo "Тестовая база данных готова!"
