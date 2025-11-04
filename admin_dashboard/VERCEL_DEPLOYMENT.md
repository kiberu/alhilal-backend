# Alhilal Admin Dashboard - Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Alhilal Admin Dashboard to Vercel.

## Prerequisites

- [x] Vercel account (create at [vercel.com](https://vercel.com))
- [x] GitHub/GitLab/Bitbucket repository with your code
- [x] Backend API deployed and accessible (e.g., `https://api.alhilaltravels.com`)
- [x] Cloudinary account for file uploads

## Quick Start

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy from Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin_dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

4. Click "Deploy"

## Environment Variables Setup

### Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.alhilaltravels.com/api/v1/

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://admin.alhilaltravels.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Application
NODE_ENV=production
```

### How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - **Value**: Variable value
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Copy the output and add it to Vercel
```

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `admin.alhilaltravels.com`
4. Click **Add**

### 2. Configure DNS

Add these DNS records in your domain provider (where you host `alhilaltravels.com`):

**For subdomain (`admin.alhilaltravels.com`):**
```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com
TTL:   3600 (or Auto)
```

**Alternatively, use A record:**
```
Type:  A
Name:  admin
Value: 76.76.21.21
TTL:   3600
```

### 3. Verify Domain

- Wait 1-5 minutes for DNS propagation
- Vercel will automatically verify and issue SSL certificate
- Your site will be live at `https://admin.alhilaltravels.com`

## Deployment Configuration

The project includes these configuration files:

### `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.alhilaltravels.com/api/v1/:path*"
    }
  ],
  "headers": [...]
}
```

### `next.config.ts`
- Optimized for Vercel deployment
- Includes image optimization for Cloudinary
- Security headers configured
- API rewrites for proxy (optional)

## CI/CD Pipeline

Vercel automatically deploys:

### Production Deployments
- **Trigger**: Push to `main` or `master` branch
- **URL**: Your custom domain (e.g., `admin.alhilaltravels.com`)
- **Environment**: Uses Production environment variables

### Preview Deployments
- **Trigger**: Push to any branch or Pull Request
- **URL**: Auto-generated preview URL (e.g., `admin-dashboard-abc123.vercel.app`)
- **Environment**: Uses Preview environment variables
- **Purpose**: Test changes before merging to production

### How It Works

1. Push code to GitHub
2. Vercel automatically:
   - Detects the push
   - Runs `npm install`
   - Runs `npm run build`
   - Deploys to Vercel's global CDN
3. You receive deployment notification (email/Slack)
4. Changes are live within 30-60 seconds

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Visit `https://admin.alhilaltravels.com`
- [ ] Check if homepage loads correctly
- [ ] Verify images from Cloudinary display properly
- [ ] Test login functionality

### 2. Test API Connection

- [ ] Try logging in with staff credentials
- [ ] Navigate to dashboard
- [ ] Check if data loads from backend API
- [ ] Verify CORS is configured correctly on backend

### 3. Monitor Performance

- [ ] Check Vercel Analytics dashboard
- [ ] Review build logs for warnings
- [ ] Test site on mobile devices
- [ ] Verify SSL certificate is active

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Type errors"**
- Temporarily disabled in `next.config.ts`
- Fix TypeScript errors and remove `ignoreBuildErrors: true` later

### Runtime Errors

**API Connection Failed**
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check backend CORS settings include your Vercel domain
- Ensure Railway backend is running

**Authentication Issues**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure cookies are allowed in browser

**Image Upload Errors**
- Verify Cloudinary environment variables
- Check Cloudinary upload preset permissions
- Review browser console for errors

### CORS Issues

If you get CORS errors, update your Django backend `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`:

**In Railway (Backend):**
```bash
ALLOWED_HOSTS=api.alhilaltravels.com,admin.alhilaltravels.com
CORS_ALLOWED_ORIGINS=https://admin.alhilaltravels.com
```

## Performance Optimization

### 1. Enable Caching

Vercel automatically caches:
- Static assets (images, CSS, JS)
- API routes
- Pages with static generation

### 2. Image Optimization

Images from Cloudinary are automatically optimized by Vercel's Image Optimization API.

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

## Monitoring & Analytics

### Vercel Analytics

1. Go to **Project Settings** → **Analytics**
2. Enable **Web Analytics**
3. View real-time performance metrics

### Error Tracking (Optional)

Integrate Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Rollback Deployment

If a deployment has issues:

1. Go to **Deployments** in Vercel Dashboard
2. Find the previous working deployment
3. Click **...** (three dots) → **Promote to Production**
4. Confirm rollback

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

For issues:
1. Check Vercel build logs
2. Review browser console errors
3. Verify all environment variables are set
4. Contact support at support@alhilaltravels.com

---

**Last Updated**: November 2025
**Deployment Platform**: Vercel
**Framework**: Next.js 15.5
**Node Version**: 22.x

