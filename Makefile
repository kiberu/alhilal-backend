.PHONY: help dev-up dev-down logs migrate makemigrations collectstatic superuser shell seed test format lint clean

help:
	@echo "Alhilal Project - Available Commands"
	@echo "====================================="
	@echo "dev-up           - Start development environment"
	@echo "dev-down         - Stop development environment"
	@echo "logs             - View logs from all services"
	@echo "migrate          - Run database migrations"
	@echo "makemigrations   - Create new migrations"
	@echo "collectstatic    - Collect static files"
	@echo "superuser        - Create Django superuser"
	@echo "shell            - Access Django shell"
	@echo "seed             - Seed database with sample data"
	@echo "test             - Run tests"
	@echo "format           - Format code with black"
	@echo "lint             - Run linters"
	@echo "clean            - Clean up containers and volumes"

dev-up:
	docker-compose up -d
	@echo "Development environment started!"
	@echo "Admin: http://localhost/admin/"
	@echo "API Docs: http://localhost/api/v1/docs/"

dev-down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

superuser:
	docker-compose exec backend python manage.py createsuperuser

shell:
	docker-compose exec backend python manage.py shell

seed:
	docker-compose exec backend python manage.py seed_data

test:
	docker-compose exec backend pytest

format:
	docker-compose exec backend black apps/
	docker-compose exec backend isort apps/

lint:
	docker-compose exec backend flake8 apps/
	docker-compose exec backend black --check apps/
	docker-compose exec backend isort --check apps/

clean:
	docker-compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "Cleaned up!"

# Production commands
prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-migrate:
	docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

prod-collectstatic:
	docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

