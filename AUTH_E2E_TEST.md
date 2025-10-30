# Authentication End-to-End Test Guide

## Overview
This document provides comprehensive testing instructions for the Auth.js (NextAuth.js v5) authentication system in the Alhilal Admin Dashboard.

## Authentication Stack
- **Framework**: Auth.js (NextAuth.js) v5
- **Strategy**: JWT with Credentials Provider
- **Backend**: Django REST Framework with JWT
- **Session**: Server-side with JWT tokens
- **Middleware**: Route protection with Auth.js middleware

## Prerequisites
1. Ensure backend is running: `docker-compose up backend`
2. Ensure frontend is running: `docker-compose up frontend`
3. Have test staff credentials ready (from seed data)

## Test Credentials
From the seed data (`make seed`):
- **Admin User**:
  - Phone: `+256700000001`
  - Password: `admin123`
  - Role: ADMIN

- **Agent User**:
  - Phone: `+256700000002`
  - Password: `agent123`
  - Role: AGENT

## Test Cases

### 1. Login Flow - Success Path
**Test**: Admin user can successfully log in

**Steps**:
1. Navigate to `http://localhost:3001/login`
2. Enter phone: `+256700000001`
3. Enter password: `admin123`
4. Click "Sign In"

**Expected Results**:
- ✅ No validation errors
- ✅ Loading state shows during authentication
- ✅ Redirect to dashboard (`/`)
- ✅ User info displayed in header
- ✅ Session persists on page refresh
- ✅ Access token available in session

**How to Verify**:
```javascript
// Open browser console and run:
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
console.log(session);
// Should show: { user, accessToken, refreshToken }
```

---

### 2. Login Flow - Invalid Credentials
**Test**: User receives appropriate error for invalid credentials

**Steps**:
1. Navigate to `http://localhost:3001/login`
2. Enter phone: `+256700000001`
3. Enter password: `wrongpassword`
4. Click "Sign In"

**Expected Results**:
- ✅ Error message displayed: "Invalid phone number or password"
- ✅ User stays on login page
- ✅ Form fields remain populated (except password)
- ✅ No redirect occurs

---

### 3. Login Flow - Non-Staff User
**Test**: Non-staff users cannot access admin dashboard

**Steps**:
1. Create a pilgrim user (role: PILGRIM) in Django admin
2. Try to log in with pilgrim credentials

**Expected Results**:
- ✅ Error message: "Access denied. Only staff members can login."
- ✅ Login fails
- ✅ No session created

---

### 4. Route Protection - Unauthenticated Access
**Test**: Unauthenticated users are redirected to login

**Steps**:
1. Ensure you're logged out (clear cookies or incognito mode)
2. Navigate to `http://localhost:3001/`
3. Try to access `http://localhost:3001/trips`
4. Try to access `http://localhost:3001/bookings`

**Expected Results**:
- ✅ Immediately redirected to `/login`
- ✅ No flash of dashboard content
- ✅ Original URL is preserved (can be added as return URL)

---

### 5. Route Protection - Authenticated Access
**Test**: Authenticated users can access protected routes

**Steps**:
1. Log in as admin user
2. Navigate to various dashboard routes:
   - `/` (Dashboard)
   - `/trips`
   - `/bookings`
   - `/pilgrims`
   - `/documents/passports`
   - `/documents/visas`
   - `/duas`

**Expected Results**:
- ✅ All routes accessible
- ✅ No redirects to login
- ✅ Content loads properly
- ✅ API calls include authentication token

---

### 6. Session Persistence
**Test**: User session persists across page refreshes

**Steps**:
1. Log in as admin user
2. Navigate to any dashboard page
3. Refresh the browser (F5 or Cmd+R)
4. Close the tab and reopen `http://localhost:3001/`

**Expected Results**:
- ✅ User remains logged in after refresh
- ✅ User remains logged in after reopening tab
- ✅ Session data persists (access token, user info)
- ✅ No re-authentication required within session lifetime (7 days)

---

### 7. Logout Flow
**Test**: User can successfully log out

**Steps**:
1. Log in as admin user
2. Navigate to dashboard
3. Click profile menu (or logout button)
4. Click "Logout"

**Expected Results**:
- ✅ Session is cleared
- ✅ Redirected to `/login`
- ✅ Attempting to access protected routes redirects to login
- ✅ Browser back button doesn't allow access to dashboard

---

### 8. API Authentication
**Test**: API calls include proper authentication headers

**Steps**:
1. Log in as admin user
2. Navigate to `/trips` (triggers API call)
3. Open browser DevTools → Network tab
4. Look for API calls to `http://backend:8000/api/v1/`

**Expected Results**:
- ✅ API calls include `Authorization: Bearer <token>` header
- ✅ Token matches session.accessToken
- ✅ API returns 200 (not 401 Unauthorized)
- ✅ Data loads successfully

**How to Verify**:
```javascript
// In browser console:
import { useAuth } from '@/hooks/useAuth';
const { accessToken } = useAuth();
console.log('Access Token:', accessToken);
// Should show a valid JWT token
```

---

### 9. Admin-Only Routes
**Test**: Only admins can access admin-specific features

**Steps**:
1. Log in as **agent** user (`+256700000002` / `agent123`)
2. Navigate to:
   - `/staff` (if exists)
   - `/audit` (if exists)
3. Check sidebar for admin-only links

**Expected Results**:
- ✅ Admin-only routes are not visible in sidebar
- ✅ Direct URL access redirects to dashboard
- ✅ Agent user can access:
  - Dashboard, Trips, Bookings, Pilgrims, Duas
- ✅ Agent user cannot access:
  - Staff Management, Audit Log

**Note**: Currently, the sidebar shows admin links conditionally using `isAdmin` check in `Sidebar.tsx`.

---

### 10. Token Expiration Handling
**Test**: System handles expired tokens gracefully

**Steps**:
1. Log in as admin user
2. Wait for access token to expire (default: 60 minutes)
   - Or manually expire token in backend
3. Try to make an API call (navigate to a new page)

**Expected Results**:
- ✅ Refresh token is used to get new access token (if implemented)
- ✅ OR user is redirected to login with clear message
- ✅ No 401 errors visible to user
- ✅ Session state is properly cleared on auth failure

---

### 11. Network Error Handling
**Test**: Authentication handles network errors gracefully

**Steps**:
1. Stop the backend: `docker-compose stop backend`
2. Try to log in
3. Try to access API-dependent pages while logged in

**Expected Results**:
- ✅ Login shows error: "Authentication service is not properly configured" or similar
- ✅ API errors show user-friendly messages
- ✅ No app crashes
- ✅ User can retry after backend is back up

---

### 12. Concurrent Sessions
**Test**: Multiple browser tabs/windows share the same session

**Steps**:
1. Log in in one browser tab
2. Open a new tab to `http://localhost:3001/`
3. Log out from the first tab
4. Check the second tab

**Expected Results**:
- ✅ Both tabs share the same session
- ✅ Logging out in one tab logs out both
- ✅ Session updates propagate across tabs

---

## Known Issues & Limitations

### Current Implementation
1. ✅ **Auth.js v5 (NextAuth.js)** - Properly configured
2. ✅ **JWT Strategy** - Server-side sessions with JWT
3. ✅ **Credentials Provider** - Phone + Password
4. ✅ **Middleware Protection** - Route guards implemented
5. ✅ **Session Provider** - Wraps app in `layout.tsx`
6. ✅ **API Route** - `/api/auth/[...nextauth]`

### Potential Issues to Check
1. **Token Refresh**: Auto-refresh of expired access tokens
   - Currently NOT implemented - needs refresh token handling
   - Recommendation: Add token refresh logic in API client middleware

2. **Remember Me**: Persistent sessions across browser restarts
   - Currently set to 7 days via `session.maxAge`
   - Works as expected with JWT strategy

3. **CSRF Protection**: Auth.js handles this automatically
   - Built-in with Auth.js

4. **Rate Limiting**: Login attempt throttling
   - Should be implemented on backend

## Manual Testing Checklist

```
☐ 1. Admin user can log in
☐ 2. Agent user can log in
☐ 3. Invalid credentials show error
☐ 4. Non-staff users are rejected
☐ 5. Unauthenticated users are redirected to login
☐ 6. Authenticated users can access all routes
☐ 7. Session persists after refresh
☐ 8. Logout clears session and redirects
☐ 9. API calls include auth headers
☐ 10. Admin-only routes are protected
☐ 11. Token expiration is handled
☐ 12. Network errors show friendly messages
☐ 13. Multiple tabs share same session
```

## Automated Testing (Future)
Consider adding these tests:
- **Unit Tests**: Auth service methods
- **Integration Tests**: Login/logout flows
- **E2E Tests**: Full user journeys with Playwright/Cypress

Example E2E test structure:
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('admin can log in and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="phone"]', '+256700000001');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:3001/');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

## Debugging Tips

### Check Session State
```javascript
// In browser console:
import { getSession } from 'next-auth/react';
const session = await getSession();
console.log('Session:', session);
```

### Check Middleware
```javascript
// In browser console:
console.log('Current URL:', window.location.href);
console.log('Cookies:', document.cookie);
```

### Check Backend API
```bash
# Test login endpoint directly
curl -X POST http://localhost/api/v1/auth/staff/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+256700000001", "password": "admin123"}'
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Configuration" | Auth.js can't reach backend | Check `API_URL_INTERNAL` in docker-compose.yml |
| "CredentialsSignin" | Invalid credentials | Verify phone/password are correct |
| "AccessDenied" | User is not staff | Ensure user has is_staff=True in Django |
| 404 on API calls | Missing trailing slash | Check API_ENDPOINTS URLs have trailing slashes |
| Network error | Backend not running | `docker-compose up backend` |

## Success Criteria
All test cases pass ✅:
- Admin can log in and access all features
- Agent can log in with limited access
- Routes are properly protected
- Session persists correctly
- Errors are handled gracefully
- Logout works as expected

## Next Steps After Testing
1. ✅ Verify all auth flows work
2. Add refresh token handling (optional, recommended)
3. Implement rate limiting on backend
4. Add E2E tests with Playwright
5. Monitor auth errors in production
6. Set up proper HTTPS for production

---

**Last Updated**: Current session
**Tested By**: AI Assistant
**Status**: ✅ Ready for Testing

