"""
Test script to verify Cloudinary configuration.
Run with: docker-compose exec backend python test_cloudinary.py
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alhilal.settings')
django.setup()

from django.conf import settings
import cloudinary

def test_cloudinary_config():
    """Test Cloudinary configuration and credentials."""
    print("\n" + "="*60)
    print("CLOUDINARY CONFIGURATION TEST")
    print("="*60 + "\n")
    
    # Check environment variables
    print("1. Environment Variables:")
    print("-" * 40)
    cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME', 'NOT SET')
    api_key = os.environ.get('CLOUDINARY_API_KEY', 'NOT SET')
    api_secret = os.environ.get('CLOUDINARY_API_SECRET', 'NOT SET')
    
    print(f"   CLOUDINARY_CLOUD_NAME: {cloud_name}")
    print(f"   CLOUDINARY_API_KEY: {api_key}")
    print(f"   CLOUDINARY_API_SECRET: {'*' * 10 if api_secret != 'NOT SET' else 'NOT SET'}")
    
    # Check Django settings
    print("\n2. Django CLOUDINARY_STORAGE Settings:")
    print("-" * 40)
    print(f"   CLOUD_NAME: {settings.CLOUDINARY_STORAGE.get('CLOUD_NAME', 'NOT SET')}")
    print(f"   API_KEY: {settings.CLOUDINARY_STORAGE.get('API_KEY', 'NOT SET')}")
    print(f"   API_SECRET: {'*' * 10 if settings.CLOUDINARY_STORAGE.get('API_SECRET') else 'NOT SET'}")
    
    # Check Cloudinary SDK config
    print("\n3. Cloudinary SDK Configuration:")
    print("-" * 40)
    print(f"   cloud_name: {cloudinary.config().cloud_name}")
    print(f"   api_key: {cloudinary.config().api_key}")
    print(f"   api_secret: {'*' * 10 if cloudinary.config().api_secret else 'NOT SET'}")
    
    # Validate configuration
    print("\n4. Validation:")
    print("-" * 40)
    errors = []
    warnings = []
    
    if cloud_name == 'NOT SET' or cloud_name == 'your-cloud-name':
        errors.append("❌ CLOUDINARY_CLOUD_NAME is not set or using placeholder")
    else:
        print("   ✅ CLOUDINARY_CLOUD_NAME is set")
    
    if api_key == 'NOT SET' or api_key == 'your-api-key':
        errors.append("❌ CLOUDINARY_API_KEY is not set or using placeholder")
    else:
        print("   ✅ CLOUDINARY_API_KEY is set")
    
    if api_secret == 'NOT SET' or api_secret == 'your-api-secret':
        errors.append("❌ CLOUDINARY_API_SECRET is not set or using placeholder")
    else:
        print("   ✅ CLOUDINARY_API_SECRET is set")
    
    # Test Cloudinary connection
    print("\n5. Connection Test:")
    print("-" * 40)
    
    if errors:
        print("   ⚠️  Skipping connection test due to configuration errors")
    else:
        try:
            # Try to ping Cloudinary API
            result = cloudinary.api.ping()
            if result.get('status') == 'ok':
                print("   ✅ Successfully connected to Cloudinary!")
            else:
                warnings.append("⚠️  Connected but received unexpected response")
        except Exception as e:
            errors.append(f"❌ Connection failed: {str(e)}")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    if errors:
        print("\n❌ ERRORS FOUND:")
        for error in errors:
            print(f"   {error}")
        print("\n📋 TO FIX:")
        print("   1. Make sure backend/.env file exists")
        print("   2. Copy env.template to backend/.env if it doesn't exist:")
        print("      cp env.template backend/.env")
        print("   3. Update Cloudinary credentials in backend/.env:")
        print("      CLOUDINARY_CLOUD_NAME=your_actual_cloud_name")
        print("      CLOUDINARY_API_KEY=your_actual_api_key")
        print("      CLOUDINARY_API_SECRET=your_actual_api_secret")
        print("   4. Restart backend: docker-compose restart backend")
        return False
    
    if warnings:
        print("\n⚠️  WARNINGS:")
        for warning in warnings:
            print(f"   {warning}")
    
    if not errors and not warnings:
        print("\n✅ All checks passed! Cloudinary is properly configured.")
    
    print("\n" + "="*60 + "\n")
    return len(errors) == 0

if __name__ == '__main__':
    success = test_cloudinary_config()
    sys.exit(0 if success else 1)

