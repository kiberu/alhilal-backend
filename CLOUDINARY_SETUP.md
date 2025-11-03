# Cloudinary Setup Guide

## Issue Found

The test shows that `backend/.env` is using placeholder values:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret
```

This is why uploads are failing with "Invalid api_key your-api-key".

## How to Fix

### Step 1: Get Your Cloudinary Credentials

1. **Sign up or log in to Cloudinary:**
   - Go to https://cloudinary.com
   - Sign up for a free account or log in

2. **Get your credentials from the Dashboard:**
   - After logging in, you'll see your Dashboard
   - Look for the "Account Details" or "API Keys" section
   - You'll find:
     - **Cloud Name**: e.g., `dxyz123abc`
     - **API Key**: e.g., `123456789012345`
     - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123`

### Step 2: Update backend/.env

1. **Open the file:**
   ```bash
   nano backend/.env
   # or
   vim backend/.env
   # or use your preferred editor
   ```

2. **Update these three lines with your actual credentials:**
   ```bash
   CLOUDINARY_CLOUD_NAME=dxyz123abc  # Replace with your cloud name
   CLOUDINARY_API_KEY=123456789012345  # Replace with your API key
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123  # Replace with your API secret
   ```

3. **Save the file**

### Step 3: Restart the Backend

```bash
docker-compose restart backend
```

### Step 4: Verify Configuration

Run the test script to verify everything is working:

```bash
docker-compose exec backend python test_cloudinary.py
```

You should see:
```
✅ All checks passed! Cloudinary is properly configured.
```

### Step 5: Test File Upload

Run the upload test:

```bash
docker-compose exec backend python test_upload_endpoint.py
```

This will test:
- ✅ Public image uploads (for trip covers)
- ✅ Private document uploads (for passports/visas)
- ✅ API endpoint functionality

### Step 6: Test from Frontend

1. Navigate to Create/Edit Trip page
2. Try uploading a cover image using drag & drop
3. The image should upload successfully and display a preview

## Troubleshooting

### Issue: "Invalid api_key" error persists

**Solution:** Make sure you:
1. Saved the `.env` file correctly
2. Used the actual credentials (not the placeholder text)
3. Restarted the backend container
4. No extra spaces or quotes around the values

### Issue: "Resource not found" error

**Solution:** Double-check your Cloud Name - it's case-sensitive

### Issue: "Signature verification failed"

**Solution:** Your API Secret might be incorrect - copy it again from Cloudinary dashboard

## Quick Commands Reference

```bash
# Check configuration
docker-compose exec backend python test_cloudinary.py

# Test uploads
docker-compose exec backend python test_upload_endpoint.py

# Restart backend
docker-compose restart backend

# View backend logs
docker-compose logs -f backend

# Edit .env file
nano backend/.env
```

## What Gets Uploaded Where

### Public Files (no authentication needed):
- **Trip cover images**: `trips/covers/`
- **Content images**: `content/`
- Anyone can view these URLs directly

### Private Files (authentication required):
- **Passports**: `passports/`
- **Visas**: `visas/`
- **Documents**: `documents/`
- These require signed URLs to access

## Example .env File

```bash
# ... other settings ...

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=mycompany123
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=ABCdef123XYZ789-secret_key_here

# ... other settings ...
```

## Security Notes

- ⚠️ **Never commit `.env` files to Git** (already in `.gitignore`)
- ✅ Keep your API Secret secure
- ✅ Rotate credentials if exposed
- ✅ Use environment-specific credentials for production

## Next Steps After Setup

Once Cloudinary is working:

1. ✅ Test trip cover image upload
2. ✅ Test document upload on pilgrim pages
3. ✅ Verify public images are accessible
4. ✅ Verify private documents require authentication
5. ✅ Set up production Cloudinary account for deployment

