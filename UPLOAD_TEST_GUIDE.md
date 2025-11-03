# End-to-End Upload Testing Guide

## ✅ Cloudinary Configuration Status

**Backend Test Results:**
- ✅ Cloudinary credentials loaded correctly
- ✅ Public image upload working (trips/covers)
- ✅ Private document upload working (documents)
- ✅ Public/Private access control working correctly

## 🧪 Frontend Upload Tests

### Test 1: Trip Cover Image Upload (PhotoUpload Component)

#### Steps:
1. **Navigate to Trip Creation:**
   - Go to: http://localhost:3000/dashboard
   - Login if not already logged in
   - Click "Trips" → "Create New Trip"

2. **Fill Basic Info:**
   - Trip Code: `TEST-001`
   - Name: `Test Trip`
   - Cities: `Makkah, Madinah`
   - Start Date: Any future date
   - End Date: After start date
   - Visibility: `PUBLIC`

3. **Test Cover Image Upload:**
   
   **Method A - Drag & Drop:**
   - Drag an image file from your desktop
   - Drop it on the "Cover Image" upload area
   - Should show immediate preview
   - Should display upload progress
   - Should show success message
   
   **Method B - Click to Select:**
   - Click the "Cover Image" upload area
   - Select an image from file picker
   - Should upload and show preview

4. **Verify Upload:**
   - ✅ Preview shows immediately
   - ✅ Toast notification: "Photo uploaded successfully"
   - ✅ Avatar preview displays the image
   - ✅ "Change" and "Remove" buttons appear
   - ✅ No error messages in console

5. **Save the Trip:**
   - Click "Create Trip"
   - Should succeed and redirect to trip details

6. **Verify Image Accessibility:**
   - Copy the image URL from the form (or inspect network tab)
   - Open URL in new browser tab (not logged in)
   - ✅ Image should load (public access)

#### Expected Behavior:
- Drag-and-drop should work smoothly
- Visual feedback when dragging over drop zone
- Immediate upload on file selection
- Image preview with avatar display
- File uploaded to: `trips/covers/` folder
- URL format: `https://res.cloudinary.com/dv7cumfsz/image/upload/...`

---

### Test 2: Document Upload on Pilgrim Page (DocumentUpload Component)

#### Steps:
1. **Navigate to Pilgrim:**
   - Go to "Pilgrims" from sidebar
   - Click on any existing pilgrim (or create new one)
   - Go to "Documents" tab

2. **Test Document Upload:**
   
   **Method A - Drag & Drop:**
   - Drag a PDF or image file
   - Drop on document upload area
   - Should show "Drop file here" message while hovering
   - Should upload automatically on drop
   
   **Method B - Click to Upload:**
   - Click the upload area
   - Select a PDF or image
   - Should upload and show preview

3. **Verify Upload:**
   - ✅ Visual feedback during drag (border color changes)
   - ✅ Upload progress indicator
   - ✅ Success toast notification
   - ✅ File preview shows (image thumbnail or PDF icon)
   - ✅ File name and size displayed

#### Expected Behavior:
- Drag-and-drop works with visual feedback
- Border turns blue/primary color when dragging
- "Drop file here" message appears
- Automatic upload on file drop
- File uploaded to: `documents/` folder (private)
- Private files require authentication to access

---

### Test 3: Change/Remove Functionality

#### Steps:
1. **Upload an image** (on trip page)
2. **Click "Change" button:**
   - Should open file picker
   - Select different image
   - Should replace the existing image
   - New preview should show

3. **Click "Remove" button:**
   - Should clear the preview
   - Should reset to empty state
   - Upload area should show again

#### Expected Behavior:
- Change button replaces the image
- Remove button clears everything
- No errors in console

---

### Test 4: File Validation

#### Test File Size Limit:
1. Try uploading a very large file (>5MB for images)
2. ✅ Should show error: "File size must be less than 5MB"
3. ✅ Upload should not proceed

#### Test File Type Validation:
1. Try uploading invalid file type (e.g., .exe, .zip on PhotoUpload)
2. ✅ Should show error: "Please select a valid image file"
3. ✅ Upload should not proceed

---

### Test 5: Error Handling

#### Test Network Error:
1. Stop backend: `docker-compose stop backend`
2. Try uploading a file
3. ✅ Should show error message
4. ✅ Should display toast with appropriate error
5. Start backend: `docker-compose start backend`

#### Test Invalid Credentials:
1. Backend should log any authentication issues
2. Check backend logs: `docker-compose logs -f backend`

---

## 🐛 Troubleshooting

### Issue: "Upload failed: Invalid api_key"

**Solution:** Credentials not loaded
```bash
# Verify credentials are set
docker-compose exec backend python test_cloudinary.py

# If still using placeholders, restart fully:
docker-compose down
docker-compose up -d
```

### Issue: Upload hangs/times out

**Solution:** Check backend logs
```bash
docker-compose logs -f backend
```

### Issue: Image uploads but doesn't show preview

**Solution:** Check browser console for errors
- Open DevTools (F12)
- Check Console tab
- Check Network tab for failed requests

### Issue: Drag-and-drop not working

**Checklist:**
- ✅ Are you dragging over the correct area?
- ✅ Is the file type allowed?
- ✅ Check browser console for JavaScript errors
- ✅ Try clicking to upload instead

### Issue: "Session expired" error

**Solution:** Login again
- Token might have expired
- Logout and login again

---

## 📊 Upload Test Checklist

### PhotoUpload (Trip Cover):
- [ ] Click to upload works
- [ ] Drag & drop works
- [ ] Visual feedback during drag
- [ ] Image preview displays
- [ ] Upload progress shows
- [ ] Success toast appears
- [ ] Change button works
- [ ] Remove button works
- [ ] File size validation works
- [ ] File type validation works
- [ ] Uploaded image is publicly accessible

### DocumentUpload (Pilgrim Docs):
- [ ] Click to upload works
- [ ] Drag & drop works
- [ ] Visual feedback during drag
- [ ] Document preview displays
- [ ] Upload progress shows
- [ ] Success toast appears
- [ ] Works with PDFs
- [ ] Works with images
- [ ] File size validation works
- [ ] Uploaded docs require authentication

---

## 🎯 Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth drag-and-drop experience
- ✅ Clear visual feedback
- ✅ Appropriate error messages
- ✅ Fast upload times (<5 seconds for typical images)
- ✅ Public/private access control working

---

## 📝 Report Issues

If you find any issues during testing:

1. **Check browser console** (F12 → Console tab)
2. **Check backend logs:** `docker-compose logs backend`
3. **Note the exact steps** to reproduce
4. **Include error messages** from console/logs
5. **Test file details** (size, type, name)

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. ✅ Upload functionality is production-ready
2. 🎨 Consider adding:
   - Image cropping/resizing UI
   - Multiple file upload for documents
   - Upload progress bars
   - Thumbnail generation
3. 🔒 Security review:
   - Verify private documents aren't publicly accessible
   - Test with different user roles
   - Check file size limits are enforced server-side

