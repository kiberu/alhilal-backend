# Railway Deployment Guide for Alhilal Backend

This guide will walk you through deploying your Django backend to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Git repository pushed to GitHub/GitLab/Bitbucket
3. Cloudinary account configured

## Step 1: Create a New Railway Project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select your repository: `alhilal`
4. Railway will detect your Django app automatically

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Generate a `DATABASE_URL` environment variable
   - Link it to your backend service

## Step 3: Add Redis (for Celery)

1. Click **"+ New"** again
2. Select **"Database"** → **"Redis"**
3. Railway will provide a `REDIS_URL` automatically

## Step 4: Configure Environment Variables

In your backend service, go to **"Variables"** tab and add these:

### Required Variables

```bash
# Django Core
SECRET_KEY=<generate-a-strong-secret-key-here>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app

# Database (Railway auto-provides DATABASE_URL, but keep these as backup)
# DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT are auto-configured

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS (Add your frontend URLs)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app

# Field Encryption (32 characters)
FIELD_ENCRYPTION_KEY=<generate-32-character-random-string>

# OTP Settings
OTP_EXPIRY_SECONDS=600
OTP_MAX_ATTEMPTS=5

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=3600
JWT_REFRESH_TOKEN_LIFETIME=86400

# Rate Limiting
RATELIMIT_ENABLE=True

# Time Zone
TIME_ZONE=Africa/Kampala
```

### Generate Secret Keys

Run these commands locally to generate secure keys:

```bash
# Generate Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate FIELD_ENCRYPTION_KEY (32 chars)
python -c "import secrets; print(secrets.token_urlsafe(32)[:32])"
```

## Step 5: Configure Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Click **"Generate Domain"** for a Railway subdomain
3. Or add your custom domain and configure DNS

## Step 6: Deploy

1. Railway will automatically deploy on every push to your main branch
2. To manually redeploy: Click **"Deploy"** → **"Redeploy"**
3. View logs in the **"Deployments"** tab

## Step 7: Run Database Migrations

Railway automatically runs migrations via the `Procfile` release command, but you can also run them manually:

1. Go to your service
2. Click **"Settings"** → **"Deploy"**
3. Or use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser
```

## Step 8: Create Superuser

```bash
railway run python manage.py createsuperuser
```

Or use Django shell:
```bash
railway run python manage.py shell

# In the shell:
from apps.accounts.models import Account
user = Account.objects.create_superuser(
    email='admin@alhilal.com',
    phone='+256700000000',
    password='your-secure-password',
    first_name='Admin',
    last_name='User',
    role='admin'
)
```

## Step 9: Setup Celery Worker (Optional)

If you need background tasks:

1. In Railway, click **"+ New"** → **"Empty Service"**
2. Name it "Celery Worker"
3. Connect the same GitHub repo
4. Set **Start Command** to:
   ```bash
   celery -A alhilal worker --loglevel=info
   ```
5. Add the same environment variables as the main service

## Important Notes

### Static Files
- WhiteNoise serves static files automatically
- No need for S3 or separate CDN for Django admin assets

### Media Files
- All media files are stored in Cloudinary
- Ensure `CLOUDINARY_*` variables are set correctly

### Database Backups
- Railway provides automatic daily backups
- Access them in Database → Backups tab

### Monitoring
- View logs: Service → Deployments → Click deployment
- Monitor metrics: Service → Metrics tab
- Set up alerts: Service → Settings → Alerts

### Cost Estimation
- **Hobby Plan**: $5/month (includes $5 credit)
- **PostgreSQL**: ~$5/month
- **Redis**: ~$5/month
- **Total**: ~$10-15/month

### Environment Variable Reference

Railway auto-provides these:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Application port (don't set manually)
- `RAILWAY_ENVIRONMENT` - Current environment

## Troubleshooting

### Build Fails
- Check build logs in Deployments tab
- Ensure `requirements.txt` is up to date
- Verify Python version in `runtime.txt`

### Database Connection Error
- Check `DATABASE_URL` is set
- Verify PostgreSQL service is running
- Check firewall/network settings

### Static Files Not Loading
- Run `railway run python manage.py collectstatic`
- Verify WhiteNoise is in MIDDLEWARE
- Check STATIC_ROOT and STATIC_URL settings

### CORS Errors
- Add frontend URLs to `CORS_ALLOWED_ORIGINS`
- Ensure format is `https://domain.com` (no trailing slash)
- Check CORS middleware is enabled

## Useful Railway CLI Commands

```bash
# View logs
railway logs

# Run Django commands
railway run python manage.py <command>

# Open service in browser
railway open

# SSH into service
railway shell

# Check service status
railway status
```

## Next Steps

After successful deployment:

1. ✅ Test API endpoints: `https://your-app.railway.app/api/v1/`
2. ✅ Access Django admin: `https://your-app.railway.app/admin/`
3. ✅ Check API docs: `https://your-app.railway.app/api/schema/swagger-ui/`
4. ✅ Configure your frontend to use the Railway backend URL
5. ✅ Set up CI/CD (Railway auto-deploys from GitHub)
6. ✅ Configure monitoring and alerts

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] `ALLOWED_HOSTS` configured
- [ ] HTTPS enabled (automatic on Railway)
- [ ] CORS properly configured
- [ ] Database backups enabled
- [ ] Environment variables never committed to Git
- [ ] Rate limiting enabled
- [ ] Security headers configured (already in settings.py)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Django Deployment: https://docs.djangoproject.com/en/5.0/howto/deployment/

---

**Your backend is now ready for Railway deployment! 🚀**

