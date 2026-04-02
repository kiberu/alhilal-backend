"""
Tests for API permissions and data scoping.
"""
import pytest
from rest_framework import status
from django.contrib.auth import get_user_model

Account = get_user_model()


@pytest.mark.django_db
class TestDataScoping:
    """Tests for ensuring users can only see their own data."""
    
    def test_pilgrim_cannot_see_other_pilgrims_bookings(self, authenticated_client, booking):
        """Test that pilgrims cannot see other pilgrims' bookings."""
        # Create another pilgrim with booking
        from apps.accounts.models import PilgrimProfile
        from apps.bookings.models import Booking
        from apps.pilgrims.models import Document
        from datetime import date, timedelta
        
        other_user = Account.objects.create_user(
            phone="+256700000003",
            name="Other Pilgrim",
            role="PILGRIM"
        )
        other_profile = PilgrimProfile.objects.create(user=other_user)
        
        # Create passport and booking for other user
        Document.objects.create(
            pilgrim=other_profile,
            document_type="PASSPORT",
            title="Other Passport",
            document_number="ZZ7777777",
            issuing_country="KE",
            file_public_id="documents/other_passport",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        Booking.objects.create(
            pilgrim=other_profile,
            package=booking.package,
            status="BOOKED"
        )
        
        # Current user should only see their own booking
        response = authenticated_client.get('/api/v1/me/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['trip_code'] == 'UMRAH2025'
    
    def test_pilgrim_cannot_see_other_pilgrims_documents(self, authenticated_client, visa):
        """Test that pilgrims cannot see other pilgrims' documents."""
        # Create another pilgrim with visa
        from apps.accounts.models import PilgrimProfile
        from apps.pilgrims.models import Document
        
        other_user = Account.objects.create_user(
            phone="+256700000004",
            name="Another Pilgrim",
            role="PILGRIM"
        )
        other_profile = PilgrimProfile.objects.create(user=other_user)
        
        other_visa = Document.objects.create(
            pilgrim=other_profile,
            document_type="VISA",
            title=f"Visa - {visa.trip.name}",
            document_number="OTHER-VISA",
            file_public_id="documents/other_visa",
            trip=visa.trip,
            status="VERIFIED"
        )
        
        response = authenticated_client.get(f'/api/v1/me/documents/{other_visa.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_pilgrim_cannot_access_trips_without_booking(self, authenticated_client, trip):
        """Test that pilgrims cannot access trips they don't have bookings for."""
        response = authenticated_client.get('/api/v1/me/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0  # No booking for this trip


@pytest.mark.django_db
class TestIsPilgrimPermission:
    """Tests for IsPilgrim permission."""
    
    def test_staff_cannot_access_pilgrim_endpoints(self, api_client, staff_user):
        """Test that staff users cannot access pilgrim-only endpoints."""
        from apps.api.auth.tokens import RoleBasedRefreshToken
        
        refresh = RoleBasedRefreshToken.for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        
        # Try to access pilgrim endpoints
        endpoints = [
            '/api/v1/me/',
            '/api/v1/me/bookings/',
            '/api/v1/me/documents/',
            '/api/v1/me/trips/',
            '/api/v1/me/duas/',
        ]
        
        for endpoint in endpoints:
            response = api_client.get(endpoint)
            assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAuthenticationRequired:
    """Tests for authentication requirements."""
    
    def test_all_endpoints_require_authentication(self, api_client):
        """Test that all endpoints require authentication."""
        endpoints = [
            '/api/v1/me/',
            '/api/v1/me/bookings/',
            '/api/v1/me/documents/',
            '/api/v1/me/trips/',
            '/api/v1/me/duas/',
        ]
        
        for endpoint in endpoints:
            response = api_client.get(endpoint)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
