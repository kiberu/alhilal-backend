# Alhilal Backend

Django backend application for the Alhilal pilgrimage management system.

## Project Structure

```
backend/
├── alhilal/              # Django project settings
│   ├── settings.py       # Main settings
│   ├── urls.py           # URL configuration
│   ├── wsgi.py           # WSGI application
│   ├── asgi.py           # ASGI application
│   └── celery.py         # Celery configuration
├── apps/                 # Django applications
│   ├── accounts/         # User management, authentication
│   ├── pilgrims/         # Pilgrim profiles, passports, visas
│   ├── trips/            # Trips, packages, logistics
│   ├── bookings/         # Booking management
│   ├── content/          # Duas, notifications
│   ├── api/              # API endpoints
│   └── common/           # Shared utilities
├── manage.py             # Django management script
├── requirements.txt      # Python dependencies
└── Dockerfile            # Docker configuration
```

## Apps Overview

### accounts
- Custom user model (Account)
- Staff and Pilgrim profiles
- OTP authentication
- Staff 2FA (optional)

### pilgrims
- Passport management (encrypted)
- Visa tracking and status
- Document uploads (Cloudinary)

### trips
- Trip management
- Package variants (Gold/Premium)
- Flight and hotel logistics
- Itineraries
- Trip updates and guides
- Checklists and FAQs

### bookings
- Booking lifecycle (EOI → BOOKED)
- Capacity management
- Special requirements

### content
- Duas database
- Notification logs (MVP stub)

### api
- RESTful API endpoints
- JWT authentication
- Read-only for pilgrims
- Signed Cloudinary URLs

### common
- Health checks
- Custom exception handlers
- Pagination utilities
- Permission classes
- Cloudinary helpers

## Development

### Local Development (without Docker)

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. Create `.env` file and configure

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run development server:
   ```bash
   python manage.py runserver
   ```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=apps --cov-report=html

# Specific app
pytest apps/accounts/

# Specific test file
pytest apps/accounts/tests/test_models.py

# With verbose output
pytest -v
```

### Code Quality

```bash
# Format code
black apps/
isort apps/

# Check formatting
black --check apps/
isort --check apps/

# Lint
flake8 apps/

# Type checking
mypy apps/
```

## Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Show SQL for migration
python manage.py sqlmigrate accounts 0001
```

## Management Commands

```bash
# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Django shell with iPython
python manage.py shell_plus

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check
```

## Environment Variables

See `.env.example` for all required environment variables:

- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `DB_*` - Database configuration
- `CLOUDINARY_*` - Cloudinary configuration
- `REDIS_URL` - Redis connection URL
- `JWT_*` - JWT token lifetimes
- `OTP_*` - OTP configuration
- `FIELD_ENCRYPTION_KEY` - Fernet key for passport encryption

## API Authentication

### Pilgrim Authentication (OTP)

1. Request OTP:
   ```bash
   POST /api/v1/auth/request-otp
   {
     "phone": "+256712345678"
   }
   ```

2. Verify OTP:
   ```bash
   POST /api/v1/auth/verify-otp
   {
     "phone": "+256712345678",
     "code": "123456"
   }
   ```

3. Use JWT token:
   ```bash
   Authorization: Bearer <access_token>
   ```

### Staff Authentication (Django Admin)

Staff use Django Admin with username/password and optional 2FA.

## Cloudinary Integration

All files are stored on Cloudinary with:
- Server-side signed uploads
- Non-public resources
- Signed delivery URLs (short-lived)

Helper functions in `apps/common/cloudinary.py`:
- `signed_delivery(public_id, expires_in=600)` - Generate signed URL

## Celery Tasks

Background tasks are handled by Celery:

```python
# apps/content/tasks.py
from celery import shared_task

@shared_task
def send_notification(notification_id):
    # Task implementation
    pass
```

Run Celery worker:
```bash
celery -A alhilal worker -l info
```

Run Celery beat (scheduler):
```bash
celery -A alhilal beat -l info
```

## Security Notes

1. **Passport Numbers**: Encrypted at field level using Fernet
2. **File Access**: Cloudinary URLs are signed and short-lived
3. **API Access**: Pilgrims can only see their own data
4. **Audit Trail**: django-simple-history tracks changes
5. **Rate Limiting**: Applied to OTP and sensitive endpoints

## Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up proper `ALLOWED_HOSTS`
- [ ] Configure Cloudinary for production
- [ ] Set Redis password
- [ ] Enable HTTPS
- [ ] Configure email backend
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review security settings

## Troubleshooting

### Database Issues
```bash
# Reset database
python manage.py flush

# Drop and recreate migrations
python manage.py migrate --fake <app_name> zero
python manage.py migrate <app_name>
```

### Celery Issues
```bash
# Clear task queue
celery -A alhilal purge

# Inspect active tasks
celery -A alhilal inspect active
```

### Cache Issues
```bash
# Clear cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

