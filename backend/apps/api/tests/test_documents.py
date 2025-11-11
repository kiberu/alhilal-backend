"""
Unit tests for Document API endpoints.
"""
import pytest
from datetime import date, timedelta
from rest_framework import status
from apps.pilgrims.models import Document


@pytest.mark.django_db
class TestDocumentViewSet:
    """Tests for admin document management endpoints."""
    
    def test_create_document_success(self, api_client, staff_user, pilgrim):
        """Test creating a document successfully."""
        api_client.force_authenticate(user=staff_user)
        data = {
            'pilgrim': str(pilgrim.id),
            'document_type': 'PASSPORT',
            'title': 'Passport - Uganda',
            'document_number': 'A12345678',
            'issuing_country': 'UG',
            'file_public_id': 'documents/passport_123',
            'issue_date': '2020-01-01',
            'expiry_date': '2030-01-01'
        }
        
        response = api_client.post('/api/v1/documents', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Document.objects.count() == 1
        doc = Document.objects.first()
        assert doc.document_type == 'PASSPORT'
        assert doc.title == 'Passport - Uganda'
        assert doc.status == 'PENDING'
        assert doc.uploaded_by == staff_user
    
    def test_create_document_with_trip(self, api_client, staff_user, pilgrim, trip):
        """Test creating a visa document linked to a trip."""
        api_client.force_authenticate(user=staff_user)
        data = {
            'pilgrim': str(pilgrim.id),
            'trip': str(trip.id),
            'document_type': 'VISA',
            'title': f'Visa - {trip.name}',
            'document_number': 'V987654321',
            'file_public_id': 'documents/visa_456',
            'expiry_date': '2025-12-31'
        }
        
        response = api_client.post('/api/v1/documents', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        doc = Document.objects.first()
        assert doc.trip == trip
        assert doc.document_type == 'VISA'
    
    def test_create_document_unauthorized(self, api_client):
        """Test creating document without authentication."""
        data = {
            'document_type': 'PASSPORT',
            'title': 'Test',
            'file_public_id': 'test'
        }
        
        response = api_client.post('/api/v1/documents', data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_document_non_staff(self, api_client, pilgrim_user, pilgrim):
        """Test creating document as non-staff user."""
        api_client.force_authenticate(user=pilgrim_user)
        data = {
            'pilgrim': str(pilgrim.id),
            'document_type': 'PASSPORT',
            'title': 'Test',
            'file_public_id': 'test'
        }
        
        response = api_client.post('/api/v1/documents', data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_list_documents(self, api_client, staff_user, pilgrim):
        """Test listing all documents."""
        # Create documents
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Passport 1',
            file_public_id='doc1'
        )
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='VISA',
            title='Visa 1',
            file_public_id='doc2'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get('/api/v1/documents')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2
        assert len(response.data['results']) == 2
    
    def test_filter_documents_by_type(self, api_client, staff_user, pilgrim):
        """Test filtering documents by type."""
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Passport',
            file_public_id='doc1'
        )
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='VISA',
            title='Visa',
            file_public_id='doc2'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get('/api/v1/documents', {'document_type': 'PASSPORT'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['document_type'] == 'PASSPORT'
    
    def test_retrieve_document(self, api_client, staff_user, pilgrim):
        """Test retrieving a single document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Passport - Uganda',
            document_number='A12345678',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get(f'/api/v1/documents/{doc.id}')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(doc.id)
        assert response.data['title'] == 'Passport - Uganda'
        assert 'file_url' in response.data
    
    def test_update_document(self, api_client, staff_user, pilgrim):
        """Test updating a document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Old Title',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.patch(
            f'/api/v1/documents/{doc.id}',
            {'title': 'New Title', 'status': 'VERIFIED'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        doc.refresh_from_db()
        assert doc.title == 'New Title'
        assert doc.status == 'VERIFIED'
    
    def test_delete_document(self, api_client, staff_user, pilgrim):
        """Test deleting a document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.delete(f'/api/v1/documents/{doc.id}')
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Document.objects.count() == 0
    
    def test_verify_document_action(self, api_client, staff_user, pilgrim):
        """Test verifying a document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id='doc1',
            status='PENDING'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.post(f'/api/v1/documents/{doc.id}/verify')
        
        assert response.status_code == status.HTTP_200_OK
        doc.refresh_from_db()
        assert doc.status == 'VERIFIED'
        assert doc.rejection_reason is None
    
    def test_reject_document_action(self, api_client, staff_user, pilgrim):
        """Test rejecting a document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id='doc1',
            status='PENDING'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.post(
            f'/api/v1/documents/{doc.id}/reject',
            {'rejection_reason': 'Document not clear'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        doc.refresh_from_db()
        assert doc.status == 'REJECTED'
        assert doc.rejection_reason == 'Document not clear'
    
    def test_reject_document_without_reason(self, api_client, staff_user, pilgrim):
        """Test rejecting document without reason fails."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.post(f'/api/v1/documents/{doc.id}/reject', {}, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_expiring_soon_action(self, api_client, staff_user, pilgrim):
        """Test getting documents expiring soon."""
        # Create expiring document (within 30 days)
        expiring_date = date.today() + timedelta(days=15)
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Expiring Soon',
            file_public_id='doc1',
            expiry_date=expiring_date,
            status='VERIFIED'
        )
        
        # Create non-expiring document
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='VISA',
            title='Valid',
            file_public_id='doc2',
            expiry_date=date.today() + timedelta(days=365),
            status='VERIFIED'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get('/api/v1/documents/expiring_soon')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['title'] == 'Expiring Soon'
    
    def test_expired_action(self, api_client, staff_user, pilgrim):
        """Test getting expired documents."""
        # Create expired document
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Expired',
            file_public_id='doc1',
            expiry_date=date.today() - timedelta(days=1)
        )
        
        # Create valid document
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='VISA',
            title='Valid',
            file_public_id='doc2',
            expiry_date=date.today() + timedelta(days=365)
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get('/api/v1/documents/expired')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['title'] == 'Expired'


@pytest.mark.django_db
class TestPilgrimDocumentViewSet:
    """Tests for pilgrim-facing document endpoints (mobile app)."""
    
    def test_list_own_documents(self, api_client, pilgrim_user, pilgrim, other_pilgrim):
        """Test pilgrim can list their own documents."""
        # Create documents for authenticated pilgrim
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='My Passport',
            file_public_id='doc1'
        )
        Document.objects.create(
            pilgrim=pilgrim,
            document_type='VISA',
            title='My Visa',
            file_public_id='doc2'
        )
        
        # Create document for other pilgrim
        Document.objects.create(
            pilgrim=other_pilgrim,
            document_type='PASSPORT',
            title='Other Passport',
            file_public_id='doc3'
        )
        
        api_client.force_authenticate(user=pilgrim_user)
        response = api_client.get('/api/v1/me/documents')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert all(d['title'].startswith('My') for d in response.data)
    
    def test_retrieve_own_document(self, api_client, pilgrim_user, pilgrim):
        """Test pilgrim can retrieve their own document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='My Passport',
            document_number='A12345678',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=pilgrim_user)
        response = api_client.get(f'/api/v1/me/documents/{doc.id}')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'My Passport'
        assert 'file_url' in response.data
        assert 'rejection_reason' not in response.data  # Simplified serializer
    
    def test_cannot_retrieve_others_document(self, api_client, pilgrim_user, other_pilgrim):
        """Test pilgrim cannot retrieve another pilgrim's document."""
        doc = Document.objects.create(
            pilgrim=other_pilgrim,
            document_type='PASSPORT',
            title='Other Passport',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=pilgrim_user)
        response = api_client.get(f'/api/v1/me/documents/{doc.id}')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_list_documents_unauthorized(self, api_client):
        """Test listing documents without authentication."""
        response = api_client.get('/api/v1/me/documents')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_staff_can_use_pilgrim_endpoint(self, api_client, staff_user, staff_pilgrim_profile):
        """Test staff with pilgrim profile can use pilgrim endpoints."""
        Document.objects.create(
            pilgrim=staff_pilgrim_profile,
            document_type='PASSPORT',
            title='Staff Passport',
            file_public_id='doc1'
        )
        
        api_client.force_authenticate(user=staff_user)
        response = api_client.get('/api/v1/me/documents')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1


@pytest.mark.django_db
class TestDocumentModel:
    """Tests for Document model validation."""
    
    def test_create_document_valid(self, pilgrim):
        """Test creating a valid document."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Passport - Uganda',
            document_number='A12345678',
            file_public_id='documents/passport_123',
            issue_date='2020-01-01',
            expiry_date='2030-01-01'
        )
        
        assert doc.id is not None
        assert doc.status == 'PENDING'
        assert str(doc) == f"{pilgrim.user.name} - Passport - Uganda"
    
    def test_document_validation_expiry_before_issue(self, pilgrim):
        """Test validation fails when expiry is before issue date."""
        from django.core.exceptions import ValidationError
        
        doc = Document(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id='test',
            issue_date='2030-01-01',
            expiry_date='2020-01-01'
        )
        
        with pytest.raises(ValidationError) as exc_info:
            doc.clean()
        
        assert 'Issue date must be before expiry date' in str(exc_info.value)
    
    def test_document_validation_no_file(self, pilgrim):
        """Test validation fails when no file is provided."""
        from django.core.exceptions import ValidationError
        
        doc = Document(
            pilgrim=pilgrim,
            document_type='PASSPORT',
            title='Test',
            file_public_id=''
        )
        
        with pytest.raises(ValidationError) as exc_info:
            doc.clean()
        
        assert 'Document file is required' in str(exc_info.value)
    
    def test_document_with_trip_relationship(self, pilgrim, trip):
        """Test document can be linked to a trip."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            trip=trip,
            document_type='VISA',
            title=f'Visa - {trip.name}',
            file_public_id='visa_123'
        )
        
        assert doc.trip == trip
        assert doc in trip.documents.all()
    
    def test_document_with_booking_relationship(self, pilgrim, booking):
        """Test document can be linked to a booking."""
        doc = Document.objects.create(
            pilgrim=pilgrim,
            booking=booking,
            document_type='VISA',
            title='Visa',
            file_public_id='visa_123'
        )
        
        assert doc.booking == booking
        assert doc in booking.documents.all()
