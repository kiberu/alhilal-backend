# Upload Components Refactor Summary

## Overview
Refactored upload components to use better implementations from the Synergy codebase, with proper drag-and-drop functionality and improved UX.

## Changes Made

### 1. New PhotoUpload Component
**File:** `admin_dashboard/components/shared/PhotoUpload.tsx`

- Created a dedicated image upload component based on Synergy's `photo-upload.tsx`
- **Features:**
  - Full drag-and-drop support with visual feedback
  - Image preview with avatar display
  - Automatic upload to Cloudinary on file selection
  - File validation (type and size)
  - Loading states and error handling
  - Change and Remove buttons
  - Integrated with `useAuth` for token management
  - Toast notifications for success/error

### 2. Updated DocumentUpload Component
**File:** `admin_dashboard/components/shared/DocumentUpload.tsx`

- Added missing drag-and-drop functionality
- **New Features:**
  - `handleDrop` - Handles file drop events
  - `handleDragOver` - Shows drag active state with visual feedback
  - `handleDragLeave` - Resets drag state
  - `dragActive` state for visual feedback
  - Refactored file processing into `validateAndProcessFile` for reuse
  - Visual feedback when dragging (primary border color and background)

### 3. Updated Trip Pages
**Files:**
- `admin_dashboard/app/dashboard/trips/new/page.tsx`
- `admin_dashboard/app/dashboard/trips/[id]/edit/page.tsx`

**Changes:**
- Replaced text input for cover image URL with interactive `PhotoUpload` component
- Added import for `PhotoUpload` from shared components
- Updated form field to use the new component with:
  - Proper label and placeholder
  - 5MB max file size
  - Upload to `trips/covers` folder
  - Optional field (not required)

### 4. Backend Cloudinary Upload Enhancement
**File:** `backend/apps/common/cloudinary.py`

**Changes to `upload_file` function:**
- Added `is_public` parameter (default: False)
- Automatic public/private determination based on folder:
  - **Public folders:** `trips`, `content`, `public` - Files are publicly accessible
  - **Private folders:** `passports`, `visas`, `documents` - Files require authentication
- Uses `type='upload'` for public files and `type='authenticated'` for private files
- This ensures trip cover images are publicly viewable while keeping sensitive documents private

### 5. Component Exports
**File:** `admin_dashboard/components/shared/index.ts`

Added exports for new components:
```typescript
export { PhotoUpload } from "./PhotoUpload"
export type { UploadedPhoto } from "./PhotoUpload"
```

## Technical Details

### PhotoUpload Props
```typescript
interface PhotoUploadProps {
  label: string
  value?: string                      // Current image URL
  onChange: (url: string) => void     // Called with uploaded URL
  onUploadSuccess?: (photo: UploadedPhoto) => void
  onUploadError?: (error: string) => void
  placeholder?: string
  accept?: string                     // File types (default: "image/*")
  maxSize?: number                    // Max size in MB (default: 5)
  folder?: string                     // Cloudinary folder (default: "trips")
  className?: string
  required?: boolean
}
```

### DocumentUpload Enhancements
- Drag-and-drop now fully functional
- Visual feedback during drag operations
- Better user experience with highlighted drop zone
- Maintains backward compatibility with existing usage

## Benefits

1. **Improved UX:**
   - Drag-and-drop is now functional across all upload components
   - Visual feedback when dragging files
   - Clear loading states and error messages
   - Image preview for better user confidence

2. **Better Code Organization:**
   - Reusable PhotoUpload component for all image uploads
   - Consistent upload behavior across the application
   - Proper separation of concerns

3. **Security:**
   - Public/private file handling based on folder structure
   - Trip images are public (for website display)
   - Sensitive documents remain private (passports, visas)

4. **Cloudinary Integration:**
   - Automatic upload on file selection
   - Proper folder organization
   - Resource type handling (image, raw, video)

## Testing Recommendations

1. **PhotoUpload Component:**
   - Test drag-and-drop functionality
   - Test file size validation
   - Test file type validation
   - Test upload success/error scenarios
   - Test image preview display

2. **DocumentUpload Component:**
   - Test drag-and-drop (previously not working)
   - Test with images and PDFs
   - Verify backward compatibility

3. **Trip Pages:**
   - Test creating new trip with cover image
   - Test editing trip and changing cover image
   - Verify image displays correctly after upload

4. **Backend:**
   - Verify Cloudinary credentials are set in environment
   - Test public access to trip images
   - Test private access to documents still requires authentication

## Environment Variables Setup

⚠️ **IMPORTANT**: You must configure Cloudinary credentials before uploads will work!

### Quick Setup

Run the interactive setup script:
```bash
./setup_cloudinary.sh
```

Or manually edit `backend/.env` and update:
```bash
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name  # NOT the placeholder!
CLOUDINARY_API_KEY=your_actual_api_key        # Get from cloudinary.com
CLOUDINARY_API_SECRET=your_actual_api_secret  # Keep this secret!
```

### Get Credentials

1. Go to https://cloudinary.com
2. Sign up (free) or log in
3. Copy credentials from Dashboard

### Verify Setup

```bash
docker-compose exec backend python test_cloudinary.py
```

See `CLOUDINARY_SETUP.md` for detailed instructions.

## Migration Notes

- Existing document uploads using `DocumentUpload` component will continue to work
- Trip pages now use `PhotoUpload` instead of text input for cover images
- No database migrations required
- No breaking changes to existing functionality

