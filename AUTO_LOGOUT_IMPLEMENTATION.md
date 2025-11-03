# Automatic Logout on Token Expiry - Implementation Summary

## Overview
Implemented automatic logout functionality that detects when a user's authentication token expires (401 errors) and automatically signs them out, redirecting to the login page.

## Changes Made

### 1. Updated Error Handler (`admin_dashboard/lib/api/middleware/errorHandler.ts`)
**Changes:**
- Added `LogoutCallback` type for the logout function
- Added static `logoutCallback` property to store the callback
- Added `setLogoutCallback()` method to register the logout function
- Updated `handleGlobalError()` to automatically trigger logout on 401 errors
- Shows a user-friendly "Session Expired" toast notification
- Executes logout callback after 500ms delay to avoid blocking

**Key Features:**
- Detects 401 (Unauthorized) responses from API
- Shows toast: "Session Expired - Your session has expired. Please login again."
- Automatically calls signOut from Next-Auth
- Non-blocking implementation with setTimeout

### 2. Created Error Handler Provider (`admin_dashboard/components/providers/ErrorHandlerProvider.tsx`)
**Purpose:**
- Initializes the error handler with the logout callback during app startup
- Uses Next-Auth's `signOut()` function for proper session cleanup

**Implementation:**
```typescript
ApiErrorHandler.setLogoutCallback(async () => {
  await signOut({ 
    redirect: true, 
    callbackUrl: "/login?expired=true" 
  })
})
```

**Features:**
- Runs once during app initialization via `useEffect`
- Redirects to `/login?expired=true` to show expiry message
- Properly cleans up Next-Auth session

### 3. Updated Root Layout (`admin_dashboard/app/layout.tsx`)
**Changes:**
- Imported `ErrorHandlerProvider`
- Wrapped children with `<ErrorHandlerProvider>` inside `<SessionProvider>`

**Component Hierarchy:**
```
<SessionProvider>
  <ErrorHandlerProvider>
    {children}
    <Toaster />
  </ErrorHandlerProvider>
</SessionProvider>
```

### 4. Enhanced Login Page (`admin_dashboard/app/(auth)/login/page.tsx`)
**Changes:**
- Added `useSearchParams` to detect URL parameters
- Added `sessionExpired` state
- Checks for `?expired=true` query parameter
- Shows blue info alert when session expired

**User Experience:**
- Blue info banner: "Your session has expired. Please sign in again to continue."
- Appears when user is redirected after token expiry
- Clear, non-intrusive messaging

## How It Works

### Flow Diagram:
```
1. User makes API request with expired token
   ↓
2. Backend returns 401 Unauthorized
   ↓
3. ApiClient catches the error
   ↓
4. ApiErrorHandler.handleGlobalError() is called
   ↓
5. Detects 401 status code
   ↓
6. Shows "Session Expired" toast notification
   ↓
7. Calls registered logout callback (after 500ms)
   ↓
8. Next-Auth signOut() is executed
   ↓
9. User redirected to /login?expired=true
   ↓
10. Login page shows session expired message
```

### Key Technical Details:

**Error Detection:**
- All API calls go through `ApiClient.makeRequest()`
- Errors are caught and passed to `ApiErrorHandler.handleGlobalError()`
- 401 status code triggers automatic logout

**Logout Execution:**
- Uses Next-Auth's `signOut()` for proper session cleanup
- Clears cookies, local storage, and session state
- Redirects to login page with query parameter

**User Feedback:**
- Toast notification shows immediately (3 second duration)
- Login page shows persistent info banner
- Clear messaging about why they were logged out

## Testing the Feature

### Manual Testing:
1. **Simulate Token Expiry:**
   - Log in to the dashboard
   - Wait for token to expire (or manually invalidate token)
   - Make any API call (navigate, create pilgrim, etc.)
   - Should see toast notification and automatic redirect

2. **Check Login Page:**
   - After redirect, verify blue info banner appears
   - Message should say: "Your session has expired. Please sign in again to continue."

3. **Normal Login:**
   - Login normally after expiry
   - Should redirect to dashboard
   - Banner should not appear

### Edge Cases Handled:
- Multiple simultaneous 401 errors: Only triggers logout once (via Next-Auth)
- Network errors: Not treated as token expiry
- Other 4xx/5xx errors: Handled separately, no logout
- Already logged out: Safe to call signOut() multiple times

## Benefits

1. **Security:** Prevents users from staying "logged in" with expired tokens
2. **User Experience:** Clear feedback about why they need to re-login
3. **Automatic:** No manual intervention required from users
4. **Consistent:** Works across all API calls throughout the application
5. **Non-blocking:** Doesn't interrupt the current operation

## Configuration

No configuration required. The feature is automatically enabled for all authenticated routes.

If you need to customize:
- **Toast duration:** Change `duration: 3000` in `errorHandler.ts`
- **Logout delay:** Change `setTimeout(..., 500)` in `errorHandler.ts`
- **Redirect URL:** Change `callbackUrl: "/login?expired=true"` in `ErrorHandlerProvider.tsx`
- **Message text:** Update toast message and login page alert

## Files Modified

1. `/admin_dashboard/lib/api/middleware/errorHandler.ts` - Error handling logic
2. `/admin_dashboard/components/providers/ErrorHandlerProvider.tsx` - NEW: Provider component
3. `/admin_dashboard/app/layout.tsx` - Added provider to app
4. `/admin_dashboard/app/(auth)/login/page.tsx` - Added expired session message

## Dependencies

- `next-auth/react` - For `signOut()` function
- `sonner` - For toast notifications (already in use)
- No new dependencies added

## Browser Compatibility

Works in all modern browsers that support:
- `setTimeout()` (all browsers)
- Next.js 14+ (your current version)
- Next-Auth v4+ (your current version)

## Notes

- Token expiry is detected by 401 HTTP status codes
- The actual token expiry time is configured on the backend
- This implementation works with both JWT and session-based auth
- Compatible with Next-Auth's refresh token strategy if implemented later

