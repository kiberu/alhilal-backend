# Setup Guide - Alhilal Pilgrimage Management System

Complete installation and configuration guide for development and production environments.

## 📋 Prerequisites

### Required Software

- **Docker** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **Git** 2.30+
- **Python** 3.11+ (for local development)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## 🚀 Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd alhilal
```

### 2. Create Environment File

```bash
# Copy template
cp env.template backend/.env

# Or create manually
cat > backend/.env << 'EOF'
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/alhilal

# Redis
REDIS_URL=redis://redis:6379/0

# Cloudinary (get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Security
FIELD_ENCRYPTION_KEY=your-32-char-fernet-key-here

# OTP Settings
OTP_EXPIRY_SECONDS=600
OTP_MAX_ATTEMPTS=5

# CORS (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
EOF
```

### 3. Generate Encryption Key

```bash
# Inside Docker (after starting services)
docker-compose exec backend python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Or using make command
make generate-keys

# Copy the output and update FIELD_ENCRYPTION_KEY in backend/.env
```

### 4. Start Services

```bash
# Start all services (db, redis, backend, nginx)
make dev-up

# Or using docker-compose directly
docker-compose up -d

# Check logs
make logs
# or
docker-compose logs -f
```

### 5. Run Database Migrations

```bash
# Create database tables
make migrate

# Or directly
docker-compose exec backend python manage.py migrate
```

### 6. Create Superuser

```bash
# Interactive prompt
make superuser

# Or directly
docker-compose exec backend python manage.py createsuperuser
```

**Enter:**
- Phone: `+256700000000` (or any valid phone with country code)
- Name: `Admin User`
- Password: (choose a secure password)

### 7. Access the System

- **Admin Dashboard**: http://localhost/admin/
- **API Documentation**: http://localhost/api/v1/docs/
- **Health Check**: http://localhost/health/

### 8. Load Test Data (Optional)

```bash
# Django shell
make shell

# Then run:
from django.contrib.auth import get_user_model
from apps.accounts.models import PilgrimProfile
from apps.trips.models import Trip, TripPackage
from datetime import date, timedelta

# Create test pilgrim
Account = get_user_model()
user = Account.objects.create_user(
    phone="+256712345678",
    name="Test Pilgrim",
    role="PILGRIM"
)
PilgrimProfile.objects.create(
    user=user,
    dob=date(1990, 1, 1),
    nationality="UG"
)

# Create test trip
trip = Trip.objects.create(
    code="UMRAH2025",
    name="Umrah 2025 - May",
    cities=["Makkah", "Madinah"],
    start_date=date.today() + timedelta(days=30),
    end_date=date.today() + timedelta(days=45)
)

# Create package
package = TripPackage.objects.create(
    trip=trip,
    name="Gold Package",
    price_minor_units=5000000,
    currency="UGX",
    capacity=50
)

print("Test data created!")
```

## 🏭 Production Setup

### 1. Prepare Production Environment

```bash
# Copy production compose file
cp docker-compose.prod.yml docker-compose.yml

# Create production .env
cat > backend/.env << 'EOF'
# Django Settings
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (use managed service recommended)
DATABASE_URL=postgresql://user:password@db-host:5432/alhilal_prod

# Redis (use managed service recommended)
REDIS_URL=redis://redis-host:6379/0

# Cloudinary (production account)
CLOUDINARY_CLOUD_NAME=prod-cloud-name
CLOUDINARY_API_KEY=prod-api-key
CLOUDINARY_API_SECRET=prod-api-secret

# Security
FIELD_ENCRYPTION_KEY=<generate-new-fernet-key>
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# OTP Settings
OTP_EXPIRY_SECONDS=600
OTP_MAX_ATTEMPTS=5

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
EOF
```

### 2. Generate Production Keys

```bash
# Secret key
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Encryption key
docker-compose run --rm backend python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 3. Configure SSL/TLS

Edit `nginx/default.prod.conf` with your domain and SSL certificate paths:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

### 4. Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 5. Setup Backups

```bash
# Database backup script
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U postgres alhilal | gzip > "$BACKUP_DIR/alhilal_$TIMESTAMP.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x scripts/backup-db.sh

# Add to crontab for daily backups
# 0 2 * * * /path/to/alhilal/scripts/backup-db.sh
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEBUG` | Yes | False | Enable debug mode |
| `SECRET_KEY` | Yes | - | Django secret key |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | - | Redis connection string |
| `CLOUDINARY_CLOUD_NAME` | Yes | - | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Yes | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | - | Cloudinary API secret |
| `FIELD_ENCRYPTION_KEY` | Yes | - | Fernet encryption key |
| `OTP_EXPIRY_SECONDS` | No | 600 | OTP code expiry (seconds) |
| `OTP_MAX_ATTEMPTS` | No | 5 | Max OTP verification attempts |
| `ALLOWED_HOSTS` | Yes | localhost | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | No | * | Comma-separated CORS origins |

### Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard → Account Details
3. Copy:
   - Cloud name
   - API Key
   - API Secret
4. Update `backend/.env` with credentials

### Database Configuration

**Development** (included in Docker Compose):
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/alhilal
```

**Production** (recommended managed service):
```
DATABASE_URL=postgresql://username:password@host:5432/database
```

Popular managed services:
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Databases
- Heroku Postgres

### Redis Configuration

**Development** (included in Docker Compose):
```
REDIS_URL=redis://redis:6379/0
```

**Production** (recommended managed service):
```
REDIS_URL=redis://username:password@host:6379/0
```

## 🛠️ Common Commands (Makefile)

```bash
# Development
make dev-up          # Start development environment
make dev-down        # Stop development environment
make dev-restart     # Restart development environment

# Database
make migrate         # Run migrations
make makemigrations  # Create new migrations
make shell          # Django shell
make dbshell        # PostgreSQL shell

# Management
make superuser      # Create superuser
make logs           # View logs
make test           # Run tests

# Cleanup
make clean          # Stop containers and remove volumes
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Execute commands
docker-compose exec backend python manage.py <command>

# Access shell
docker-compose exec backend bash

# Rebuild images
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

## 🔍 Troubleshooting

### Issue: "env file not found"

```bash
# Create .env file
cp env.template backend/.env
# Update with your values
```

### Issue: "Port already in use"

```bash
# Find process using port
lsof -i :80
lsof -i :5432

# Kill process or change port in docker-compose.yml
```

### Issue: "Database connection failed"

```bash
# Check database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Issue: "Migration errors"

```bash
# Reset database (development only)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### Issue: "Cloudinary upload fails"

```bash
# Verify credentials in backend/.env
# Test connection
docker-compose exec backend python manage.py shell
>>> import cloudinary
>>> cloudinary.config()
>>> # Check output has correct values
```

## 📱 SMS/OTP Integration (Production)

For production OTP delivery, integrate with SMS provider:

**Recommended Providers:**
- Twilio
- Africa's Talking
- Vonage (Nexmo)

Update `apps/api/auth/views.py` in `RequestOTPView.post()`:

```python
# Replace this:
logger.info(f"OTP for {phone}: {code}")

# With SMS provider integration:
import africastalking  # or twilio, etc.
africastalking.initialize(username, api_key)
sms = africastalking.SMS
response = sms.send(f"Your Alhilal OTP is: {code}", [phone])
```

## 🔐 Security Checklist (Production)

- [ ] Change `SECRET_KEY` to strong random value
- [ ] Set `DEBUG=False`
- [ ] Generate new `FIELD_ENCRYPTION_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Enable SSL/TLS (HTTPS)
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Use managed database service
- [ ] Use managed Redis service
- [ ] Enable database backups
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure firewall rules
- [ ] Use secrets management (AWS Secrets Manager, etc.)

## 📊 Monitoring & Logging

### Setup Sentry (Error Tracking)

```bash
# Install sentry-sdk
pip install sentry-sdk

# Add to settings.py
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production"
)
```

### Setup Application Logs

```bash
# View logs
docker-compose logs -f backend

# Save logs to file
docker-compose logs backend > logs/backend.log
```

## ✅ Verification

After setup, verify everything works:

1. **Health Check**: Visit http://localhost/health/
2. **Admin Access**: Login at http://localhost/admin/
3. **API Docs**: Check http://localhost/api/v1/docs/
4. **OTP Flow**: Test authentication endpoint
5. **Database**: Create test trip in admin
6. **Tests**: Run `make test`

---

**Setup complete! 🎉** See [FEATURES.md](FEATURES.md) for feature guide.

