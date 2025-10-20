"""
Tests for package API endpoints.
"""
import pytest
from rest_framework import status


@pytest.mark.django_db
class TestPackageDetailEndpoint:
    """Tests for /api/v1/packages/{id} endpoint."""
    
    def test_get_package_detail(self, authenticated_client, booking, flight, hotel):
        """Test getting package details with flights and hotels."""
        package_id = booking.package.id
        response = authenticated_client.get(f'/api/v1/packages/{package_id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Gold'
        assert 'flights' in response.data
        assert 'hotels' in response.data
        assert len(response.data['flights']) == 1
        assert len(response.data['hotels']) == 1
    
    def test_get_package_no_access(self, authenticated_client, trip_package):
        """Test that user cannot access packages they don't have bookings for."""
        response = authenticated_client.get(f'/api/v1/packages/{trip_package.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestPackageFlightsEndpoint:
    """Tests for /api/v1/packages/{id}/flights endpoint."""
    
    def test_get_flights(self, authenticated_client, booking, flight):
        """Test getting package flights."""
        package_id = booking.package.id
        response = authenticated_client.get(f'/api/v1/packages/{package_id}/flights/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['carrier'] == 'EK'
        assert response.data['results'][0]['flight_no'] == 'EK730'
    
    def test_get_flights_no_access(self, authenticated_client, trip_package, flight):
        """Test that user cannot access flights for packages without booking."""
        response = authenticated_client.get(f'/api/v1/packages/{trip_package.id}/flights/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestPackageHotelsEndpoint:
    """Tests for /api/v1/packages/{id}/hotels endpoint."""
    
    def test_get_hotels(self, authenticated_client, booking, hotel):
        """Test getting package hotels."""
        package_id = booking.package.id
        response = authenticated_client.get(f'/api/v1/packages/{package_id}/hotels/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['name'] == 'Hilton Makkah'
    
    def test_get_hotels_no_access(self, authenticated_client, trip_package, hotel):
        """Test that user cannot access hotels for packages without booking."""
        response = authenticated_client.get(f'/api/v1/packages/{trip_package.id}/hotels/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestDuaEndpoint:
    """Tests for /api/v1/duas endpoint."""
    
    def test_list_duas(self, authenticated_client, dua):
        """Test listing duas."""
        response = authenticated_client.get('/api/v1/duas/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['category'] == 'TAWAF'
        assert response.data['results'][0]['text_ar'] == 'سبحان الله'
    
    def test_list_duas_filter_by_category(self, authenticated_client, dua):
        """Test filtering duas by category."""
        from apps.content.models import Dua
        
        # Create dua in different category
        Dua.objects.create(
            category="SAI",
            text_ar="الحمد لله",
            text_en="Praise be to Allah"
        )
        
        response = authenticated_client.get('/api/v1/duas/?category=TAWAF')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['category'] == 'TAWAF'

