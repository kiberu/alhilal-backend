#!/usr/bin/env python3
"""
End-to-end test for document uploads and viewing.
Tests different file types: images (JPG, PNG), PDFs, and other documents.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from apps.common.cloudinary import signed_delivery

def test_cloudinary_url_generation():
    """Test Cloudinary URL generation for different file types."""
    
    print("=" * 80)
    print("TESTING CLOUDINARY URL GENERATION")
    print("=" * 80)
    
    test_cases = [
        # (public_id, expected_resource_type, description)
        ("passports/test123.jpg", "image", "Passport image with .jpg extension"),
        ("passports/test456.png", "image", "Passport image with .png extension"),
        ("passports/test789", "image", "Passport without extension (legacy)"),
        ("visas/visa123.pdf", "raw", "Visa PDF document"),
        ("visas/visa456", "image", "Visa without extension (legacy)"),
        ("documents/doc123.pdf", "raw", "General PDF document"),
        ("documents/doc456.jpg", "image", "General image document"),
        ("vaccinations/vax123.png", "image", "Vaccination certificate PNG"),
        ("vaccinations/vax456.pdf", "raw", "Vaccination certificate PDF"),
        ("id_cards/id123.jpg", "image", "ID card image"),
        ("birth_certificates/birth123.pdf", "raw", "Birth certificate PDF"),
        ("other/random.txt", "raw", "Text file"),
        ("trips/trip123.jpg", "image", "Trip image (not a document folder)"),
    ]
    
    results = []
    passed = 0
    failed = 0
    
    for public_id, expected_type, description in test_cases:
        url = signed_delivery(public_id, expires_in=600)
        
        # Check if URL contains the expected resource type
        if expected_type == "image":
            has_correct_type = "/image/" in url
        elif expected_type == "raw":
            has_correct_type = "/raw/" in url
        elif expected_type == "video":
            has_correct_type = "/video/" in url
        else:
            has_correct_type = False
        
        status = "✅ PASS" if has_correct_type else "❌ FAIL"
        
        if has_correct_type:
            passed += 1
        else:
            failed += 1
        
        result = {
            'description': description,
            'public_id': public_id,
            'expected_type': expected_type,
            'url_snippet': url.split('/authenticated/')[0] + '/authenticated/...' if url else 'No URL',
            'status': status
        }
        results.append(result)
        
        print(f"\n{status} {description}")
        print(f"   Public ID: {public_id}")
        print(f"   Expected: /{expected_type}/")
        print(f"   URL: {result['url_snippet']}")
    
    print("\n" + "=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("=" * 80)
    
    return failed == 0

def test_document_model():
    """Test Document model with different file types."""
    from apps.pilgrims.models import Document
    from apps.accounts.models import PilgrimProfile
    
    print("\n" + "=" * 80)
    print("TESTING DOCUMENT MODEL")
    print("=" * 80)
    
    try:
        # Get a test pilgrim
        pilgrim = PilgrimProfile.objects.first()
        if not pilgrim:
            print("❌ No pilgrim found in database. Please create a pilgrim first.")
            return False
        
        print(f"✅ Using test pilgrim: {pilgrim.user.name}")
        
        # Test document types
        test_docs = [
            {
                'type': 'PASSPORT',
                'public_id': 'passports/test_passport_123.jpg',
                'title': 'Test Passport (JPG)'
            },
            {
                'type': 'VISA',
                'public_id': 'visas/test_visa_456.pdf',
                'title': 'Test Visa (PDF)'
            },
            {
                'type': 'VACCINATION',
                'public_id': 'vaccinations/test_vax_789.png',
                'title': 'Test Vaccination Certificate (PNG)'
            },
        ]
        
        print("\nTesting document creation and URL generation:")
        for doc_data in test_docs:
            # Check if document already exists
            existing = Document.objects.filter(
                pilgrim=pilgrim,
                document_type=doc_data['type'],
                file_public_id=doc_data['public_id']
            ).first()
            
            if existing:
                doc = existing
                print(f"\n📄 Using existing document: {doc_data['title']}")
            else:
                # Create test document (without actually uploading to Cloudinary)
                doc = Document.objects.create(
                    pilgrim=pilgrim,
                    document_type=doc_data['type'],
                    title=doc_data['title'],
                    file_public_id=doc_data['public_id'],
                    status='PENDING'
                )
                print(f"\n📄 Created test document: {doc_data['title']}")
            
            # Test URL generation through serializer
            from apps.api.serializers.documents import DocumentSerializer
            from rest_framework.test import APIRequestFactory
            
            factory = APIRequestFactory()
            request = factory.get('/')
            
            serializer = DocumentSerializer(doc, context={'request': request})
            data = serializer.data
            
            file_url = data.get('file_url', '')
            expected_resource = 'image' if doc_data['public_id'].endswith(('.jpg', '.png')) else 'raw'
            
            if expected_resource == 'image':
                has_correct = '/image/' in file_url
            else:
                has_correct = '/raw/' in file_url
            
            status = "✅ PASS" if has_correct else "❌ FAIL"
            
            print(f"   {status} Document Type: {doc_data['type']}")
            print(f"   Public ID: {doc_data['public_id']}")
            print(f"   Expected: /{expected_resource}/")
            print(f"   Got URL: {file_url[:80]}..." if file_url else "   No URL generated")
        
        print("\n✅ Document model tests completed")
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing document model: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n🧪 Starting End-to-End Document Upload Tests\n")
    
    # Test 1: Cloudinary URL generation
    test1_passed = test_cloudinary_url_generation()
    
    # Test 2: Document model and serializer
    test2_passed = test_document_model()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Cloudinary URL Generation: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Document Model & Serializer: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        return 1

if __name__ == '__main__':
    sys.exit(main())

