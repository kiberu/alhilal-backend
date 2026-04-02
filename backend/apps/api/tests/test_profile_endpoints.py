"""
Tests for profile API endpoints.
"""
import pytest
from rest_framework import status


@pytest.mark.django_db
class TestMeEndpoint:
    """Tests for /api/v1/me endpoint."""
    
    def test_get_profile_authenticated(self, authenticated_client, pilgrim_user, passport):
        """Test getting profile when authenticated."""
        response = authenticated_client.get('/api/v1/me/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == pilgrim_user.name
        assert response.data['phone'] == pilgrim_user.phone
        assert response.data['nationality'] == 'UG'
        assert response.data['passport_number'] == 'AB1234567'
        assert response.data['emergency_contact']['name'] == 'Emergency Contact'
    
    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile without authentication."""
        response = api_client.get('/api/v1/me/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_profile_staff_denied(self, api_client, staff_user):
        """Test that staff without pilgrim profiles are denied."""
        from apps.api.auth.tokens import RoleBasedRefreshToken
        
        refresh = RoleBasedRefreshToken.for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        
        response = api_client.get('/api/v1/me/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestMyDocumentsEndpoint:
    """Tests for /api/v1/me/documents endpoint."""
    
    def test_get_visas(self, authenticated_client, visa):
        """Test getting pilgrim documents."""
        response = authenticated_client.get('/api/v1/me/documents/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['status'] == 'PENDING'
        assert response.data[0]['trip_name'] == 'Umrah 2025 - May'
    
    def test_get_visas_filter_by_trip(self, authenticated_client, visa):
        """Test retrieving a specific pilgrim document."""
        response = authenticated_client.get(
            f'/api/v1/me/documents/{visa.id}/'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(visa.id)
    
    def test_get_visas_unauthenticated(self, api_client):
        """Test getting documents without authentication."""
        response = api_client.get('/api/v1/me/documents/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMyBookingsEndpoint:
    """Tests for /api/v1/me/bookings endpoint."""
    
    def test_get_bookings(self, authenticated_client, booking):
        """Test getting pilgrim bookings."""
        response = authenticated_client.get('/api/v1/me/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['status'] == 'BOOKED'
        assert response.data[0]['trip_code'] == 'UMRAH2025'
        assert response.data[0]['package_name'] == 'Gold'
    
    def test_get_bookings_unauthenticated(self, api_client):
        """Test getting bookings without authentication."""
        response = api_client.get('/api/v1/me/bookings/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
