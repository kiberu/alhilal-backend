# Alhilal Travel System - Complete Deployment Guide

This comprehensive guide covers deploying both the backend (Django) and frontend (Next.js) for the Alhilal Travel Management System.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Users] ──▶ HTTPS ──▶ [Vercel CDN]                        │
│                           │                                  │
│                           ▼                                  │
│                  admin.alhilaltravels.com                   │
│                  (Next.js Admin Dashboard)                   │
│                           │                                  │
│                           │ API Requests                     │
│                           ▼                                  │
│                  api.alhilaltravels.com                     │
│                  (Django REST API on Railway)               │
│                           │                                  │
│                ┌──────────┼──────────┐                      │
│                ▼          ▼          ▼                       │
│           [PostgreSQL] [Redis]  [Cloudinary]                │
│           (Railway)    (Railway)  (Media Storage)           │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Accounts & Services
- [x] **Railway** account ([railway.app](https://railway.app))
- [x] **Vercel** account ([vercel.com](https://vercel.com))
- [x] **Cloudinary** account ([cloudinary.com](https://cloudinary.com))
- [x] **Domain** registered (e.g., alhilaltravels.com)
- [x] **Git** repository (GitHub/GitLab/Bitbucket)

### Local Development Tools
- [x] Node.js 22+ and npm
- [x] Python 3.11+
- [x] Git
- [x] Code editor (VS Code recommended)

## 🚀 Deployment Order

Deploy in this specific order to ensure proper connectivity:

1. **Backend First** (Railway) - API must be live before frontend
2. **Frontend Second** (Vercel) - Connects to the live backend API

---

## Part 1: Backend Deployment (Railway)

### 📍 Already Completed ✅

Your Django backend is already successfully deployed!

- **URL**: https://api.alhilaltravels.com
- **Platform**: Railway
- **Database**: PostgreSQL (Railway)
- **Cache**: Redis (Railway)
- **Status**: ✅ Live and Running

#### Current Configuration

**Environment Variables Set**:
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=<your-django-secret>
FIELD_ENCRYPTION_KEY=<your-encryption-key>
ALLOWED_HOSTS=api.alhilaltravels.com,alhilal-backend-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://admin.alhilaltravels.com
DEBUG=False
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
```

#### Documentation
- Full guide: `RAILWAY_DEPLOYMENT.md`
- Quick start: `RAILWAY_QUICKSTART.md`
- Fixes applied: `RAILWAY_FIXES_APPLIED.md`

### ⚠️ Important: Update CORS for Frontend

Before deploying frontend, ensure Railway has:

```bash
CORS_ALLOWED_ORIGINS=https://admin.alhilaltravels.com
ALLOWED_HOSTS=api.alhilaltravels.com,admin.alhilaltravels.com
```

Update these in Railway Dashboard → Variables → Edit

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Configuration Files ✅

The following files have been created in `admin_dashboard/`:

- ✅ `vercel.json` - Vercel configuration
- ✅ `next.config.ts` - Optimized for Vercel
- ✅ `.gitignore` - Excludes sensitive files
- ✅ `VERCEL_DEPLOYMENT.md` - Detailed guide

### Step 2: Connect Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit: [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"

2. **Import Git Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select the repository: `alhilal` or your repo name
   - Click "Import"

3. **Configure Project Settings**
   ```
   Framework Preset: Next.js
   Root Directory: admin_dashboard
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   Node.js Version: 22.x (recommended)
   ```

4. **Click "Deploy"** (but don't worry if it fails - we need env vars first)

### Step 3: Configure Environment Variables

Go to: **Project Settings → Environment Variables**

Add each of these variables:

#### Required Variables

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.alhilaltravels.com/api/v1/` | All |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | All |
| `NEXTAUTH_URL` | `https://admin.alhilaltravels.com` | Production |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NODE_ENV` | `production` | Production |

#### Cloudinary Variables (for file uploads)

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | All |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Your Cloudinary API key | All |
| `NEXT_PUBLIC_CLOUDINARY_API_SECRET` | Your Cloudinary API secret | All |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Your upload preset name | All |

**Important**: Check "Production", "Preview", and "Development" for each variable!

### Step 4: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click "..." → "Redeploy"
4. Wait 2-5 minutes for build to complete

### Step 5: Configure Custom Domain

#### Add Domain in Vercel

1. Go to **Project Settings → Domains**
2. Click **"Add Domain"**
3. Enter: `admin.alhilaltravels.com`
4. Click **"Add"**

#### Configure DNS Records

In your domain provider (where you manage `alhilaltravels.com`):

**Option 1: CNAME (Recommended)**
```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com
TTL:   Auto or 3600
```

**Option 2: A Record**
```
Type:  A
Name:  admin  
Value: 76.76.21.21
TTL:   Auto or 3600
```

#### Wait for SSL

- DNS propagation: 1-5 minutes
- SSL certificate: Automatic (Let's Encrypt)
- Your site will be live at: `https://admin.alhilaltravels.com`

### Step 6: Verify Deployment

Visit `https://admin.alhilaltravels.com` and check:

- [ ] Site loads without errors
- [ ] Login page displays
- [ ] Can log in with staff credentials
- [ ] Dashboard loads
- [ ] Data appears from backend API
- [ ] Images upload/display correctly

---

## 🧪 Testing the Full Stack

### 1. Backend API Test

```bash
# Health check
curl https://api.alhilaltravels.com/health/

# API Documentation
open https://api.alhilaltravels.com/api/docs/

# Test login (replace with real credentials)
curl -X POST https://api.alhilaltravels.com/api/v1/auth/staff/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "yourpassword"}'
```

### 2. Frontend Test

- Visit: https://admin.alhilaltravels.com
- Login with staff account
- Navigate through dashboard
- Create/edit a trip
- Upload an image
- Check browser console for errors

### 3. Integration Test

- Frontend → Backend connectivity
- CORS working properly
- File uploads to Cloudinary
- Session persistence
- API error handling

---

## 📊 Monitoring & Maintenance

### Vercel Monitoring

1. **Analytics**
   - Enable in: Settings → Analytics
   - View real-time performance metrics
   - Monitor page load times

2. **Deployment Logs**
   - Check build logs for errors
   - Review runtime logs
   - Set up Slack/Email notifications

### Railway Monitoring

1. **Metrics Dashboard**
   - CPU and memory usage
   - Database connections
   - Response times

2. **Logs**
   - Application logs
   - Error tracking
   - Database queries

### Automated Deployments

**Frontend (Vercel)**:
- Push to `main` → Auto-deploy to production
- Push to any branch → Auto-deploy preview
- Pull requests → Deploy preview

**Backend (Railway)**:
- Push to `main` → Auto-deploy to production
- Zero-downtime deployments
- Automatic health checks

---

## 🔧 Troubleshooting

### Frontend Issues

**Build Fails**
```bash
# Check package.json exists in admin_dashboard/
# Verify all dependencies are listed
# Review Vercel build logs
```

**API Requests Fail (CORS)**
```bash
# Update Railway environment:
CORS_ALLOWED_ORIGINS=https://admin.alhilaltravels.com
ALLOWED_HOSTS=api.alhilaltravels.com,admin.alhilaltravels.com

# Redeploy backend
```

**Images Don't Load**
```bash
# Verify Cloudinary credentials in Vercel
# Check upload preset permissions
# Review browser console errors
```

### Backend Issues

**Database Connection Error**
```bash
# Check DATABASE_URL is set
# Verify PostgreSQL service is running
# Test connection from Railway logs
```

**Static Files Not Loading**
```bash
# Run collectstatic
railway run python manage.py collectstatic --noinput

# Check STATIC_ROOT and STATIC_URL settings
```

---

## 🔐 Security Checklist

- [x] **HTTPS Enforced** (Both frontend and backend)
- [x] **CORS Configured** (Railway allows only frontend domain)
- [x] **Secrets Protected** (Environment variables, not in code)
- [x] **Debug Mode Off** (DEBUG=False in production)
- [x] **CSRF Protection** (Django default enabled)
- [x] **SQL Injection Protected** (Django ORM)
- [x] **XSS Protected** (React default escaping)
- [ ] **Rate Limiting** (Optional: Add Django rate limiting)
- [ ] **2FA for Admin** (Optional: Add django-otp)

---

## 💰 Cost Breakdown

### Monthly Estimates

**Railway (Backend)**:
- Hobby Plan: $5/month (includes $5 credit)
- Pro Plan: $20/month (recommended for production)
- Additional usage: ~$10-30/month (database, bandwidth)
- **Total**: ~$20-50/month

**Vercel (Frontend)**:
- Hobby Plan: FREE (for personal/small projects)
- Pro Plan: $20/month (recommended for production)
- Bandwidth: Usually included
- **Total**: $0-20/month

**Cloudinary (File Storage)**:
- Free Plan: 25GB storage, 25GB bandwidth
- Upgrade if needed: ~$89/month
- **Total**: $0-89/month

**Domain (alhilaltravels.com)**:
- ~$10-15/year
- **Total**: ~$1/month

**Grand Total**: ~$21-161/month

---

## 📚 Documentation Index

### Backend
- **Comprehensive Guide**: `RAILWAY_DEPLOYMENT.md`
- **Quick Reference**: `RAILWAY_QUICKSTART.md`
- **Troubleshooting**: `RAILWAY_FIXES_APPLIED.md`
- **API Documentation**: Live at `/api/docs/`

### Frontend
- **Deployment Guide**: `admin_dashboard/VERCEL_DEPLOYMENT.md`
- **Quick Checklist**: `VERCEL_DEPLOYMENT_CHECKLIST.md`
- **Testing Guide**: `admin_dashboard/TESTING_GUIDE.md`

### Full Stack
- **This Document**: `FULL_DEPLOYMENT_GUIDE.md`
- **API Docs**: `API_DOCUMENTATION.md`
- **Deployment Summary**: `DEPLOYMENT_SUMMARY.md`

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Backend (Railway)**
- API accessible at `https://api.alhilaltravels.com`
- Health endpoint returns 200 OK
- Database connected and migrations applied
- Admin panel accessible at `/admin/`
- API docs available at `/api/docs/`

✅ **Frontend (Vercel)**
- Site accessible at `https://admin.alhilaltravels.com`
- SSL certificate active (green padlock)
- Login functionality works
- Dashboard loads data from API
- All features functional
- No console errors

✅ **Integration**
- Frontend connects to backend successfully
- CORS configured correctly
- File uploads work (Cloudinary)
- Authentication persists
- Real-time updates work

---

## 🆘 Getting Help

### Resources
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Django Docs**: https://docs.djangoproject.com

### Support Channels
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: Create issue in your repository

### Emergency Rollback

**Frontend**:
1. Go to Vercel Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Backend**:
1. Go to Railway Deployments
2. Find previous working deployment
3. Click "Rollback to this deployment"

---

## 🎉 Congratulations!

You now have a fully deployed, production-ready travel management system!

**Your Live URLs**:
- **Admin Dashboard**: https://admin.alhilaltravels.com
- **Backend API**: https://api.alhilaltravels.com
- **API Documentation**: https://api.alhilaltravels.com/api/docs/

**Next Steps**:
1. Create your first admin user (if not done)
2. Configure email settings for notifications
3. Set up monitoring and alerts
4. Train staff on the system
5. Deploy pilgrim mobile app (optional)

---

**Document Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Production Ready  
**Maintained By**: Alhilal Travel System Team

