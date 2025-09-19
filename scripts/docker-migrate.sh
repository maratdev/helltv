#!/bin/bash

# Скрипт для запуска миграций Prisma в Docker контейнере

echo "Запуск миграций Prisma..."

# Определяем имена контейнеров в зависимости от окружения
if docker ps --format "table {{.Names}}" | grep -q "helltv_postgres_dev"; then
  POSTGRES_CONTAINER="helltv_postgres_dev"
  APP_CONTAINER="helltv_app_dev"
  echo "Режим разработки"
else
  POSTGRES_CONTAINER="helltv_postgres"
  APP_CONTAINER="helltv_app"
  echo "Продакшн режим"
fi

# Ждем, пока база данных будет готова
echo "Ожидание готовности базы данных..."
until docker exec $POSTGRES_CONTAINER pg_isready -U helltv_user -d helltv; do
  echo "База данных не готова, ждем..."
  sleep 2
done

echo "База данных готова, запускаем миграции..."

# Запускаем миграции
docker exec $APP_CONTAINER npx prisma migrate deploy

echo "Миграции завершены!"
