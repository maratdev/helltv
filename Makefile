# Makefile для HellTV Docker

.PHONY: help build up down dev logs migrate clean

# Показать справку
help:
	@echo "Доступные команды:"
	@echo "  build     - Собрать Docker образы"
	@echo "  up        - Запустить продакшн окружение"
	@echo "  down      - Остановить все контейнеры"
	@echo "  dev       - Запустить режим разработки"
	@echo "  logs      - Показать логи приложения"
	@echo "  migrate   - Запустить миграции базы данных"
	@echo "  clean     - Очистить все контейнеры и volumes"

# Сборка образов
build:
	docker compose build

# Запуск продакшн
up:
	docker compose up -d --build

# Остановка
down:
	docker compose down

# Режим разработки
dev:
	docker compose -f docker-compose.dev.yml up --build -d

# Логи
logs:
	docker compose logs -f app

# Миграции
migrate:
	./scripts/docker-migrate.sh

# Очистка
clean:
	docker compose down -v
	docker system prune -f
