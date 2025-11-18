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
        from apps.pilgrims.models import Passport
        from datetime import date, timedelta
        
        other_user = Account.objects.create_user(
            phone="+256700000003",
            name="Other Pilgrim",
            role="PILGRIM"
        )
        other_profile = PilgrimProfile.objects.create(user=other_user)
        
        # Create passport and booking for other user
        Passport.objects.create(
            pilgrim=other_profile,
            number="ZZ7777777",
            country="KE",
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
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['trip']['code'] == 'UMRAH2025'
    
    def test_pilgrim_cannot_see_other_pilgrims_visas(self, authenticated_client, visa):
        """Test that pilgrims cannot see other pilgrims' visas."""
        # Create another pilgrim with visa
        from apps.accounts.models import PilgrimProfile
        from apps.pilgrims.models import Visa
        
        other_user = Account.objects.create_user(
            phone="+256700000004",
            name="Another Pilgrim",
            role="PILGRIM"
        )
        other_profile = PilgrimProfile.objects.create(user=other_user)
        
        Visa.objects.create(
            pilgrim=other_profile,
            trip=visa.trip,
            status="APPROVED"
        )
        
        # Current user should only see their own visa
        response = authenticated_client.get('/api/v1/me/visas/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['status'] == 'PENDING'
    
    def test_pilgrim_cannot_access_trips_without_booking(self, authenticated_client, trip):
        """Test that pilgrims cannot access trips they don't have bookings for."""
        response = authenticated_client.get('/api/v1/trips/')
        
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
            '/api/v1/me/visas/',
            '/api/v1/trips/',
            '/api/v1/duas/',
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
            '/api/v1/me/visas/',
            '/api/v1/trips/',
            '/api/v1/duas/',
        ]
        
        for endpoint in endpoints:
            response = api_client.get(endpoint)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

