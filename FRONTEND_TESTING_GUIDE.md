# Frontend Testing Guide

## Overview
This guide provides comprehensive testing procedures for the Al-Hilal Admin Dashboard to ensure functionality and coherence with the backend API.

## Prerequisites

1. **Backend is running** - Check with:
   ```bash
   docker-compose ps
   # Both backend and db should show "Up" status
   ```

2. **Environment variables are set** - Check `admin_dashboard/.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **Test user exists** - Create a staff user in Django admin:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## Manual Testing Checklist

### 1. Authentication Flow
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter valid staff credentials
- [ ] Verify successful login and redirect to dashboard
- [ ] Check that user profile appears in header
- [ ] Test logout functionality

### 2. Dashboard Page (`/dashboard`)
**Test Data Loading:**
- [ ] Dashboard stats load successfully
- [ ] Activity feed displays recent actions
- [ ] No console errors appear
- [ ] Loading skeletons show while data loads

**Expected Stats:**
```typescript
{
  trips: { total: number, active: number },
  bookings: { active: number, eoi: number },
  pilgrims: { total: number },
  visas: { pending: number, approved: number }
}
```

**Test Cases:**
```bash
# Test with curl (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/dashboard/stats

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/dashboard/activity
```

### 3. Trips Management (`/dashboard/trips`)
- [ ] List all trips with pagination
- [ ] Search trips by name/code
- [ ] Filter trips by visibility
- [ ] Create new trip
- [ ] Edit existing trip
- [ ] Duplicate trip
- [ ] Delete trip
- [ ] View trip details

**API Endpoints to Test:**
```bash
# List trips
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/trips?page=1&size=10"

# Get single trip
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/trips/{trip_id}"

# Create trip
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "UMR2025",
    "name": "Umrah 2025",
    "cities": ["Makkah", "Madinah"],
    "startDate": "2025-03-01",
    "endDate": "2025-03-15",
    "visibility": "PUBLIC"
  }' \
  http://localhost:8000/api/v1/trips

# Duplicate trip
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/trips/{trip_id}/duplicate"
```

### 4. Bookings Management (`/dashboard/bookings`)
- [ ] List all bookings
- [ ] Filter by status (EOI, BOOKED, CONFIRMED, CANCELLED)
- [ ] Filter by payment status
- [ ] Search bookings
- [ ] View booking details
- [ ] Update booking status
- [ ] Bulk convert EOI to BOOKED
- [ ] Bulk cancel bookings
- [ ] Bulk assign rooms

**API Endpoints to Test:**
```bash
# List bookings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/bookings?status=EOI"

# Update booking
curl -X PATCH -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "BOOKED", "paymentStatus": "PAID"}' \
  "http://localhost:8000/api/v1/bookings/{booking_id}"

# Bulk convert EOI
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["id1", "id2"]}' \
  "http://localhost:8000/api/v1/bookings/bulk/convert-eoi"
```

### 5. Pilgrims Management (`/dashboard/pilgrims`)
- [ ] List all pilgrims
- [ ] Search pilgrims by name/phone/email
- [ ] Filter by nationality
- [ ] Filter by gender
- [ ] View pilgrim profile
- [ ] Update pilgrim information
- [ ] View pilgrim bookings
- [ ] View pilgrim documents

**API Endpoints to Test:**
```bash
# List pilgrims
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/pilgrims?nationality=US"

# Get pilgrim bookings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/pilgrims/{pilgrim_id}/bookings"

# Get pilgrim documents
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/pilgrims/{pilgrim_id}/documents"
```

### 6. Duas Management (`/dashboard/duas`)
- [ ] List all duas
- [ ] Create new dua
- [ ] Edit dua
- [ ] Delete dua
- [ ] Reorder duas

## Automated Testing Setup

### Install Testing Dependencies

```bash
cd admin_dashboard
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### Create Test Configuration

Create `admin_dashboard/jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `admin_dashboard/jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

### Example Unit Tests

Create `admin_dashboard/lib/api/__tests__/client.test.ts`:
```typescript
import { ApiClient } from '../client'

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('http://localhost:8000/api/v1/')
  })

  it('should build URLs correctly', () => {
    // Test implementation
  })

  it('should handle authentication', () => {
    // Test implementation
  })
})
```

Create `admin_dashboard/lib/api/__tests__/services.test.ts`:
```typescript
import { DashboardService } from '../services/dashboard'

describe('DashboardService', () => {
  it('should fetch dashboard stats', async () => {
    // Mock API response
    const mockStats = {
      trips: { total: 10, active: 5 },
      bookings: { active: 20, eoi: 5 },
      pilgrims: { total: 100 },
      visas: { pending: 15, approved: 80 }
    }

    // Test implementation with mocked fetch
  })
})
```

### Run Tests

```bash
cd admin_dashboard
npm test
```

## Integration Testing with Playwright

### Install Playwright

```bash
cd admin_dashboard
npm install --save-dev @playwright/test
npx playwright install
```

### Create E2E Test

Create `admin_dashboard/e2e/dashboard.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login')
    await page.fill('input[name="phone"]', '+1234567890')
    await page.fill('input[name="password"]', 'your-password')
    await page.click('button[type="submit"]')
    await page.waitForURL('http://localhost:3000/dashboard')
  })

  test('should load dashboard stats', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Wait for stats to load
    await page.waitForSelector('[data-testid="stats-trips"]')
    
    // Check that stats are visible
    const tripsTotal = await page.textContent('[data-testid="stats-trips"]')
    expect(tripsTotal).toBeTruthy()
  })

  test('should display activity feed', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Wait for activity to load
    await page.waitForSelector('[data-testid="activity-item"]', { timeout: 10000 })
    
    // Check that at least one activity item is visible
    const activityItems = await page.locator('[data-testid="activity-item"]').count()
    expect(activityItems).toBeGreaterThan(0)
  })
})
```

### Run E2E Tests

```bash
cd admin_dashboard
npx playwright test
```

## Common Issues and Solutions

### Issue 1: "Dashboard error: {}"

**Cause:** Empty error object usually means authentication failure or CORS issue

**Solutions:**
1. Check that user is logged in and token is valid
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Verify backend CORS settings allow frontend origin

### Issue 2: "Failed to fetch"

**Cause:** Network error, backend not running, or wrong URL

**Solutions:**
1. Verify backend is running: `docker-compose ps`
2. Test backend directly: `curl http://localhost:8000/api/v1/health`
3. Check API_BASE_URL configuration
4. Verify no firewall blocking requests

### Issue 3: Type mismatches

**Cause:** Frontend types don't match backend response

**Solutions:**
1. Update TypeScript interfaces in `types/models.ts`
2. Check backend serializers return camelCase
3. Verify field names match between frontend and backend

### Issue 4: Authentication loop

**Cause:** NextAuth session not properly configured

**Solutions:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches your domain
3. Clear cookies and localStorage
4. Check backend `/auth/staff/login` endpoint works

## Best Practices

1. **Always test with fresh data** - Reset database between major test runs
2. **Test error scenarios** - Not just happy paths
3. **Check browser console** - For client-side errors
4. **Monitor network tab** - Verify API calls and responses
5. **Test on different browsers** - Chrome, Firefox, Safari
6. **Test responsive design** - Mobile, tablet, desktop views
7. **Verify accessibility** - Use screen readers, keyboard navigation

## Continuous Integration

Add to `.github/workflows/test.yml`:
```yaml
name: Test Frontend

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd admin_dashboard && npm ci
      - name: Run tests
        run: cd admin_dashboard && npm test
      - name: Run E2E tests
        run: |
          cd admin_dashboard
          npx playwright install --with-deps
          npx playwright test
```

## Quick Test Script

Create `admin_dashboard/scripts/quick-test.sh`:
```bash
#!/bin/bash

echo "=== Al-Hilal Frontend Quick Test ==="

# 1. Check backend health
echo "\n1. Checking backend health..."
HEALTH=$(curl -s http://localhost:8000/health/ | jq -r '.status' 2>/dev/null || echo "failed")
if [ "$HEALTH" = "healthy" ]; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# 2. Test dashboard stats endpoint (requires token)
echo "\n2. Testing dashboard stats (with auth)..."
# You'll need to replace YOUR_TOKEN with actual token
# TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/staff/login/ \
#   -H "Content-Type: application/json" \
#   -d '{"phone":"+1234567890","password":"your-password"}' | jq -r '.accessToken')

# 3. Run unit tests
echo "\n3. Running unit tests..."
npm test --passWithNoTests

# 4. Build check
echo "\n4. Checking if project builds..."
npm run build

echo "\n=== Tests Complete ==="
```

Make it executable:
```bash
chmod +x admin_dashboard/scripts/quick-test.sh
```

Run it:
```bash
cd admin_dashboard && ./scripts/quick-test.sh
```

