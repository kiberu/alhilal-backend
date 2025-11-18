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
        assert 'passport' in response.data
        assert '****' in response.data['passport']['number_masked']
    
    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile without authentication."""
        response = api_client.get('/api/v1/me/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_profile_staff_denied(self, api_client, staff_user):
        """Test that staff cannot access pilgrim profile endpoint."""
        from apps.api.auth.tokens import RoleBasedRefreshToken
        
        refresh = RoleBasedRefreshToken.for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        
        response = api_client.get('/api/v1/me/')
        
        # Staff is not a pilgrim, so should be denied
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestMyVisasEndpoint:
    """Tests for /api/v1/me/visas endpoint."""
    
    def test_get_visas(self, authenticated_client, visa):
        """Test getting pilgrim visas."""
        response = authenticated_client.get('/api/v1/me/visas/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['status'] == 'PENDING'
        assert response.data['results'][0]['trip_code'] == 'UMRAH2025'
    
    def test_get_visas_filter_by_trip(self, authenticated_client, visa):
        """Test filtering visas by trip."""
        response = authenticated_client.get(
            f'/api/v1/me/visas/?trip_id={visa.trip.id}'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_get_visas_unauthenticated(self, api_client):
        """Test getting visas without authentication."""
        response = api_client.get('/api/v1/me/visas/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMyBookingsEndpoint:
    """Tests for /api/v1/me/bookings endpoint."""
    
    def test_get_bookings(self, authenticated_client, booking):
        """Test getting pilgrim bookings."""
        response = authenticated_client.get('/api/v1/me/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['status'] == 'BOOKED'
        assert response.data['results'][0]['trip']['code'] == 'UMRAH2025'
        assert response.data['results'][0]['package']['name'] == 'Gold'
    
    def test_get_bookings_unauthenticated(self, api_client):
        """Test getting bookings without authentication."""
        response = api_client.get('/api/v1/me/bookings/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

