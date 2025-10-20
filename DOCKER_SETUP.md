# Docker Setup for Alhilal Project

## Services

### Backend (Django)
- **Port:** 8000 (internal), accessible via Nginx
- **Container:** `alhilal-backend`
- **Image:** Custom (multi-stage: development/production)

###Frontend (Next.js)
- **Port:** 3001 (direct access), 80 via Nginx
- **Container:** `alhilal-frontend`
- **Image:** Custom (multi-stage: development/production)

### Database (PostgreSQL)
- **Port:** 5432
- **Container:** `alhilal-db`
- **Image:** postgres:15-alpine

### Cache/Queue (Redis)
- **Port:** 6379
- **Container:** `alhilal-redis`
- **Image:** redis:7-alpine

### Reverse Proxy (Nginx)
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Container:** `alhilal-nginx`
- **Image:** nginx:1.25-alpine

## Access Points

- **Admin Dashboard (Next.js):** http://localhost:3001/ or http://localhost/
- **Django Admin:** http://localhost/admin/
- **API Documentation:** http://localhost/api/v1/docs/
- **Health Check:** http://localhost/health/
- **Backend API:** http://localhost/api/v1/

## Quick Start

```bash
# Start all services
make dev-up

# View logs
make logs
# Or just frontend logs
make frontend-logs

# Run migrations
make migrate

# Collect static files
make collectstatic

# Seed database
make seed

# Create superuser
make superuser
```

## Development Commands

### Backend
```bash
make shell                  # Django shell
make migrate                # Run migrations
make makemigrations        # Create migrations
make collectstatic         # Collect static files
make seed                   # Seed database
make test                   # Run tests
```

### Frontend
```bash
make shell-frontend         # Access frontend shell
make frontend-logs          # View frontend logs
make frontend-install       # Install npm packages
```

## Environment Variables

### Backend (.env)
Located at: `backend/.env`

See `env.template` for all available options.

### Frontend (.env)
Located at: `web/.env`

```bash
NEXT_PUBLIC_API_URL=http://localhost/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
NODE_ENV=development
```

## Docker Compose Files

- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

## Volumes

- `postgres_data` - PostgreSQL database
- `redis_data` - Redis persistence
- `static_volume` - Django static files
- `media_volume` - Django media files (minimal, using Cloudinary)

## Nginx Routing

### Development (`nginx/default.conf`)

| Path | Service | Description |
|------|---------|-------------|
| `/` | Frontend (Next.js) | Admin Dashboard |
| `/admin/` | Backend (Django) | Django Admin |
| `/api/` | Backend (Django) | REST API |
| `/static/` | Static files | Django static files |
| `/media/` | Static files | Media uploads |
| `/_next/` | Frontend | Next.js assets & HMR |

### Production (`nginx/default.prod.conf`)
- Includes SSL/TLS configuration
- Rate limiting
- Security headers
- Gzip compression

## Troubleshooting

### Frontend not building
```bash
# Rebuild frontend container
docker-compose build frontend --no-cache

# Check logs
make frontend-logs
```

### Port already in use
```bash
# Check what's using the port
lsof -i :3001  # or :80, :8000, etc.

# Stop specific container
docker stop alhilal-frontend

# Or stop all
make dev-down
```

### Packages not installing
```bash
# Remove node_modules volume and rebuild
docker-compose down -v
make dev-up
```

### HMR (Hot Module Replacement) not working
- Check `WATCHPACK_POLLING=true` is set in docker-compose.yml
- Ensure WebSocket proxy is configured in nginx
- Restart nginx: `docker-compose restart nginx`

## Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Performance Notes

### Development
- Frontend uses hot reload (slower builds, faster development)
- Backend uses Django development server
- Volumes mounted for live code changes

### Production
- Frontend uses standalone build (optimized)
- Backend uses Gunicorn (4 workers, 2 threads)
- No volume mounts (code baked into image)
- Static files served with long cache headers

## Health Checks

All services have health checks:
- Backend: HTTP GET /health/
- Database: pg_isready
- Redis: redis-cli ping

Check status:
```bash
docker-compose ps
```

