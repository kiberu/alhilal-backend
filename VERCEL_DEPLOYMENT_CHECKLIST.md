# Vercel Deployment - Quick Checklist

## ✅ Pre-Deployment Checklist

### Backend (Railway) - Must be Live First
- [x] Backend deployed at `https://api.alhilaltravels.com`
- [ ] Backend health check passes: `https://api.alhilaltravels.com/health/`
- [ ] API documentation accessible: `https://api.alhilaltravels.com/api/docs/`
- [ ] CORS configured to allow frontend domain
- [ ] All environment variables set on Railway

### Environment Variables Prepared
- [ ] `NEXT_PUBLIC_API_URL` = `https://api.alhilaltravels.com/api/v1/`
- [ ] `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` = `https://admin.alhilaltravels.com`
- [ ] Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET, UPLOAD_PRESET)

### Domain Configuration
- [ ] Domain purchased: `alhilaltravels.com`
- [ ] DNS access available
- [ ] Subdomain planned: `admin.alhilaltravels.com`

## 🚀 Deployment Steps

### Step 1: Connect to Vercel
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import your Git repository
- [ ] Select the repository containing your code

### Step 2: Configure Project
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **admin_dashboard**
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```bash
NEXT_PUBLIC_API_URL=https://api.alhilaltravels.com/api/v1/
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://admin.alhilaltravels.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<your-api-key>
NEXT_PUBLIC_CLOUDINARY_API_SECRET=<your-api-secret>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<your-preset>
NODE_ENV=production
```

**Important**: Set environment variables for all environments (Production, Preview, Development)

### Step 4: Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Note the deployment URL (e.g., `admin-dashboard-xyz.vercel.app`)

### Step 5: Configure Custom Domain
- [ ] Go to Project Settings → Domains
- [ ] Add domain: `admin.alhilaltravels.com`
- [ ] Add DNS record at your domain provider:
  ```
  Type:  CNAME
  Name:  admin
  Value: cname.vercel-dns.com
  ```
- [ ] Wait for DNS propagation (1-5 minutes)
- [ ] Vercel auto-issues SSL certificate

### Step 6: Update Backend CORS
In Railway, update environment variables:
```bash
ALLOWED_HOSTS=api.alhilaltravels.com,admin.alhilaltravels.com
CORS_ALLOWED_ORIGINS=https://admin.alhilaltravels.com
```
- [ ] Restart backend service on Railway

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Site loads at `https://admin.alhilaltravels.com`
- [ ] Login page displays correctly
- [ ] Can login with staff credentials
- [ ] Dashboard loads successfully
- [ ] Navigation works (all menu items)

### API Integration
- [ ] Dashboard statistics load
- [ ] Trip list displays
- [ ] Can create/edit/delete data
- [ ] File uploads work (Cloudinary)
- [ ] Images display correctly

### Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Security
- [ ] HTTPS enforced (green padlock)
- [ ] No mixed content warnings
- [ ] Login redirects work
- [ ] Session persists correctly

## 🔧 Common Issues & Solutions

### Build Fails
**Error**: Dependencies not installed
```bash
# Solution: Ensure package.json is in admin_dashboard/
# Check Vercel build logs for specific errors
```

### API Not Loading
**Error**: CORS errors in browser console
```bash
# Solution: Update Railway CORS_ALLOWED_ORIGINS
# Add: https://admin.alhilaltravels.com
```

### Images Not Loading
**Error**: Cloudinary 401/403 errors
```bash
# Solution: Verify all Cloudinary env vars are set
# Check upload preset permissions in Cloudinary dashboard
```

### Login Doesn't Work
**Error**: "Invalid session" or "CSRF error"
```bash
# Solution: 
# 1. Verify NEXTAUTH_SECRET is set
# 2. Check NEXTAUTH_URL matches your domain
# 3. Clear browser cookies and try again
```

## 📊 Monitoring

### Check Deployment Status
- Vercel Dashboard → Deployments
- View build logs
- Check runtime logs

### Performance
- Vercel Analytics (enable in Settings)
- Check response times
- Monitor error rates

### Alerts
- Set up Vercel notifications (Slack/Email)
- Enable error tracking (optional: Sentry)

## 🔄 Updates & Rollbacks

### Deploy New Changes
1. Push code to your Git repository
2. Vercel automatically builds and deploys
3. Changes live in 30-60 seconds

### Rollback Bad Deployment
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production
4. Confirm rollback

## 📝 Important URLs

- **Frontend**: https://admin.alhilaltravels.com
- **Backend API**: https://api.alhilaltravels.com
- **API Docs**: https://api.alhilaltravels.com/api/docs/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Site accessible at custom domain
- ✅ SSL certificate active (HTTPS)
- ✅ Login works with backend
- ✅ Dashboard loads data from API
- ✅ All features functional
- ✅ No console errors
- ✅ Mobile responsive

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Review browser console (F12)
3. Verify all environment variables
4. Test backend API directly
5. Check Railway backend logs

---

**Generated**: November 2025  
**Platform**: Vercel + Railway  
**Stack**: Next.js 15 + Django 5

