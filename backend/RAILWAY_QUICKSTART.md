# Railway Deployment - Quick Start

## What's Been Configured

✅ **Configuration Files Created (at repository root):**
- `Procfile` - Tells Railway how to run your app
- `railway.json` - Railway-specific deployment config
- `nixpacks.toml` - Build configuration
- Note: These files reference the `backend/` directory

✅ **Backend Configuration:**
- `backend/runtime.txt` - Python version specification
- `backend/.railwayignore` - Files to exclude from deployment

✅ **Django Settings Updated:**
- Added `DATABASE_URL` support (Railway auto-provides this)
- Added WhiteNoise for static file serving
- Configured for production deployment

✅ **Dependencies Updated:**
- Added `whitenoise==6.6.0` to requirements.txt

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Railway deployment"
git push origin main
```

### 2. Deploy to Railway

**Option A: Web Interface**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `alhilal` repository
4. Railway auto-detects Django and deploys!

**Option B: Railway CLI**
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Add PostgreSQL Database
1. In Railway project: Click "+ New"
2. Select "Database" → "PostgreSQL"
3. Done! `DATABASE_URL` is auto-configured

### 4. Add Redis (for Celery tasks)
1. Click "+ New" again
2. Select "Database" → "Redis"
3. `REDIS_URL` is auto-configured

### 5. Set Environment Variables

**Required variables to add manually:**

```env
SECRET_KEY=<generate-strong-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
FIELD_ENCRYPTION_KEY=<32-char-random-string>
```

**Generate secrets:**
```bash
# SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# FIELD_ENCRYPTION_KEY
python -c "import secrets; print(secrets.token_urlsafe(32)[:32])"
```

### 6. Create Superuser

```bash
railway run python manage.py createsuperuser
```

## That's It! 🎉

Your API will be available at: `https://your-app.railway.app`

- API Docs: `https://your-app.railway.app/api/schema/swagger-ui/`
- Admin Panel: `https://your-app.railway.app/admin/`

## Costs

- **Starter Plan**: $5/month (includes $5 usage credit)
- **PostgreSQL**: ~$5/month
- **Redis**: ~$5/month
- **Total**: ~$10-15/month

## Need Help?

See `RAILWAY_DEPLOYMENT.md` for detailed documentation.

## Key Features Configured

✅ Automatic migrations on deploy
✅ Static files served via WhiteNoise
✅ Media files via Cloudinary
✅ PostgreSQL database
✅ Redis for Celery
✅ HTTPS enabled by default
✅ Auto-deploy on git push
✅ Environment variable management
✅ Daily database backups

