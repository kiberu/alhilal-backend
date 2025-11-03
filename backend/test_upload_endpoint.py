"""
Test script for upload endpoint with actual file upload.
Run with: docker-compose exec backend python test_upload_endpoint.py
"""
import os
import django
import sys
from io import BytesIO
from PIL import Image

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alhilal.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import InMemoryUploadedFile
from apps.common.cloudinary import upload_file
import cloudinary

Account = get_user_model()

def create_test_image():
    """Create a simple test image."""
    img = Image.new('RGB', (100, 100), color='red')
    img_io = BytesIO()
    img.save(img_io, format='JPEG')
    img_io.seek(0)
    return img_io

def test_upload():
    """Test file upload to Cloudinary."""
    print("\n" + "="*60)
    print("CLOUDINARY UPLOAD TEST")
    print("="*60 + "\n")
    
    # Check config first
    print("1. Verifying Configuration:")
    print("-" * 40)
    cloud_name = cloudinary.config().cloud_name
    api_key = cloudinary.config().api_key
    
    print(f"   Cloud Name: {cloud_name}")
    print(f"   API Key: {api_key}")
    
    if not cloud_name or cloud_name == 'your-cloud-name':
        print("\n❌ ERROR: Cloudinary not configured!")
        print("   Please run: python test_cloudinary.py")
        return False
    
    print("   ✅ Configuration looks good\n")
    
    # Test 1: Public Image Upload (trips folder)
    print("2. Testing Public Image Upload (trips/covers):")
    print("-" * 40)
    try:
        test_img = create_test_image()
        result = upload_file(
            test_img,
            folder='trips/covers',
            resource_type='image'
        )
        print(f"   ✅ Upload successful!")
        print(f"   Public ID: {result['public_id']}")
        print(f"   URL: {result['secure_url']}")
        print(f"   Size: {result['bytes']} bytes")
        print(f"   Format: {result['format']}")
        
        # Verify it's public
        if '/upload/' in result['secure_url']:
            print("   ✅ File is PUBLIC (accessible without authentication)")
        elif '/authenticated/' in result['secure_url']:
            print("   ⚠️  File is PRIVATE (this should be public for trips!)")
        
        public_upload_success = True
    except Exception as e:
        print(f"   ❌ Upload failed: {str(e)}")
        public_upload_success = False
    
    print()
    
    # Test 2: Private Document Upload (documents folder)
    print("3. Testing Private Document Upload (documents):")
    print("-" * 40)
    try:
        test_img = create_test_image()
        result = upload_file(
            test_img,
            folder='documents/test',
            resource_type='image'
        )
        print(f"   ✅ Upload successful!")
        print(f"   Public ID: {result['public_id']}")
        print(f"   URL: {result['secure_url']}")
        
        # Verify it's private
        if '/authenticated/' in result['secure_url']:
            print("   ✅ File is PRIVATE (requires authentication)")
        elif '/upload/' in result['secure_url']:
            print("   ⚠️  File is PUBLIC (this should be private for documents!)")
        
        private_upload_success = True
    except Exception as e:
        print(f"   ❌ Upload failed: {str(e)}")
        private_upload_success = False
    
    print()
    
    # Test 3: Via Django View (simulated)
    print("4. Testing Upload View (API Endpoint):")
    print("-" * 40)
    try:
        from django.test import RequestFactory
        from apps.common.views import upload_document
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        # Create a test user
        user = Account.objects.filter(is_staff=True).first()
        if not user:
            print("   ⚠️  No staff user found, creating one...")
            user = Account.objects.create_user(
                phone='1234567890',
                name='Test Staff',
                is_staff=True
            )
        
        # Create request
        factory = RequestFactory()
        test_img = create_test_image()
        file = SimpleUploadedFile(
            "test.jpg",
            test_img.read(),
            content_type="image/jpeg"
        )
        
        request = factory.post('/api/v1/common/upload', {
            'folder': 'trips/covers',
            'resource_type': 'image'
        })
        request.FILES['file'] = file
        request.user = user
        
        response = upload_document(request)
        
        if response.status_code == 200:
            data = response.data
            print(f"   ✅ API upload successful!")
            print(f"   Public ID: {data.get('publicId')}")
            print(f"   URL: {data.get('secureUrl')}")
        else:
            print(f"   ❌ API upload failed: {response.data}")
            
        view_upload_success = response.status_code == 200
    except Exception as e:
        print(f"   ❌ API test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        view_upload_success = False
    
    print()
    
    # Summary
    print("="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    all_passed = public_upload_success and private_upload_success and view_upload_success
    
    print(f"\n   Public Upload:  {'✅ PASSED' if public_upload_success else '❌ FAILED'}")
    print(f"   Private Upload: {'✅ PASSED' if private_upload_success else '❌ FAILED'}")
    print(f"   API Endpoint:   {'✅ PASSED' if view_upload_success else '❌ FAILED'}")
    
    if all_passed:
        print("\n✅ All upload tests passed!")
        print("\n📝 Next Steps:")
        print("   1. Test from the frontend (drag & drop a file)")
        print("   2. Check that trip images are publicly accessible")
        print("   3. Verify document uploads require authentication")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
    
    print("\n" + "="*60 + "\n")
    return all_passed

if __name__ == '__main__':
    success = test_upload()
    sys.exit(0 if success else 1)

