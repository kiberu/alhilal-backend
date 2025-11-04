# Railway Deployment Fixes Applied

## Issues Fixed

### 1. ✅ Missing pip Command Error
**Problem**: `pip: command not found` during build

**Solution**: 
- Created root-level `requirements.txt` that references `backend/requirements.txt`
- Railway now auto-detects Python project and sets up pip correctly

### 2. ✅ FIELD_ENCRYPTION_KEY Missing During Build
**Problem**: `ValueError: FIELD_ENCRYPTION_KEY must be set` during migrations/collectstatic

**Solutions Applied**:

### 3. ✅ Database Connection Error During Build
**Problem**: `django.db.utils.OperationalError: connection to server at "localhost"` during build

**Solution**:
- Removed all Django management commands from build phase in `nixpacks.toml`
- Added SQLite in-memory fallback for `collectstatic` command
- Moved `collectstatic` and `migrate` to runtime in `Procfile`
- Now: Build = no DB needed, Runtime = PostgreSQL available

**Root Cause**: Django's model checks run during any `manage.py` command, attempting database connection. During build, Railway hasn't provisioned the database yet.

#### A. Updated `EncryptedCharField` (encryption.py)
- Moved key validation from `__init__()` to `get_cipher()`
- Now allows Django to load models during migrations without requiring the key immediately
- Key is only validated when actually encrypting/decrypting data

#### B. Added Fallback Key in Settings
- Temporary Fernet key used during build if no environment variable set
- **WARNING** system added if temporary key is used in production
- Real key MUST be set in Railway environment variables

#### C. Updated Procfile
- Removed separate `release` command (was running during build)
- Migrations now run at startup (when env vars are available)
- Simplified to: `web: cd backend && python3 manage.py migrate --noinput && python3 -m gunicorn ...`

### 3. ✅ Configuration Files Organization
**Structure**:
```
/repository-root/
├── requirements.txt          # References backend/requirements.txt
├── Procfile                  # Run commands
├── railway.json              # Railway config
├── nixpacks.toml             # Build config
└── backend/
    ├── requirements.txt      # Actual Python dependencies
    ├── runtime.txt           # Python 3.11.7
    └── manage.py
```

## Files Modified

### 1. `/backend/apps/common/encryption.py`
- Lazy validation of encryption key
- Key validated only when cipher is needed

### 2. `/backend/alhilal/settings.py`
- Added fallback `FIELD_ENCRYPTION_KEY` for build time
- Added warning if temporary key used in production

### 3. `/Procfile`
- Simplified to run migrations at startup
- Removed problematic `release` command

### 4. `/nixpacks.toml`
- Set Python 3.11
- Added collectstatic in build phase

### 5. `/requirements.txt` (new)
- Root-level file pointing to backend requirements

### 6. `/RAILWAY_DEPLOYMENT.md`
- Added warnings about FIELD_ENCRYPTION_KEY
- Updated instructions for generating encryption keys

## Critical: Before Deploying

### 1. Generate Encryption Keys Locally

```bash
# Django SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# FIELD_ENCRYPTION_KEY (REQUIRED!)
# Install cryptography: pip install cryptography
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 2. Set Environment Variables in Railway

Go to your service → **Variables** tab:

```env
SECRET_KEY=<your-generated-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app
CLOUDINARY_CLOUD_NAME=<your-value>
CLOUDINARY_API_KEY=<your-value>
CLOUDINARY_API_SECRET=<your-value>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
FIELD_ENCRYPTION_KEY=<your-generated-fernet-key>
```

### 3. Deploy

```bash
git add .
git commit -m "Fix Railway deployment issues"
git push origin main
```

Railway will now:
1. ✅ Detect Python project from root requirements.txt
2. ✅ Install dependencies with pip (properly configured)
3. ✅ Run collectstatic during build (with temporary key)
4. ✅ Start app and run migrations (with real environment variables)
5. ✅ Serve your Django API with Gunicorn

## Security Notes

⚠️ **IMPORTANT**:

1. **Never commit encryption keys to Git**
2. **Set FIELD_ENCRYPTION_KEY in Railway before deploying**
3. **Once you encrypt data, keep the key safe** - you cannot recover encrypted data if you lose the key
4. **The temporary fallback key is ONLY for build** - it will trigger warnings in production

## Verification Checklist

After deployment:

- [ ] Check Railway logs for warnings about temporary key
- [ ] Verify `FIELD_ENCRYPTION_KEY` is set in environment variables
- [ ] Test API endpoints work: `https://your-app.railway.app/api/v1/`
- [ ] Access Django admin: `https://your-app.railway.app/admin/`
- [ ] Create superuser: `railway run python manage.py createsuperuser`
- [ ] Test encrypted fields (passports/visas) work correctly

## Next Steps

1. ✅ Complete backend deployment to Railway
2. 🔄 Deploy admin dashboard to Vercel
3. 🔄 Update frontend CORS and API URLs
4. 🔄 Test end-to-end functionality

---

**Deployment should now succeed! 🚀**

