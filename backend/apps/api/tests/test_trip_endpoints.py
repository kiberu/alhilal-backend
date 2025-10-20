"""
Tests for trip API endpoints.
"""
import pytest
from rest_framework import status
from apps.trips.models import ItineraryItem, TripUpdate, TripGuideSection
from django.utils import timezone


@pytest.mark.django_db
class TestTripListEndpoint:
    """Tests for /api/v1/trips endpoint."""
    
    def test_list_trips_with_booking(self, authenticated_client, booking):
        """Test listing trips where user has bookings."""
        response = authenticated_client.get('/api/v1/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['code'] == 'UMRAH2025'
    
    def test_list_trips_no_bookings(self, authenticated_client, trip):
        """Test that trips without bookings are not shown."""
        response = authenticated_client.get('/api/v1/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0  # No booking for this trip
    
    def test_list_trips_filter_upcoming(self, authenticated_client, booking):
        """Test filtering upcoming trips."""
        response = authenticated_client.get('/api/v1/trips/?when=upcoming')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_list_trips_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot access trips."""
        response = api_client.get('/api/v1/trips/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTripDetailEndpoint:
    """Tests for /api/v1/trips/{id} endpoint."""
    
    def test_get_trip_detail(self, authenticated_client, booking):
        """Test getting trip details."""
        trip_id = booking.package.trip.id
        response = authenticated_client.get(f'/api/v1/trips/{trip_id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == 'UMRAH2025'
        assert response.data['name'] == 'Umrah 2025 - May'
        assert 'cities' in response.data
    
    def test_get_trip_detail_no_access(self, authenticated_client, trip):
        """Test that user cannot access trips they don't have bookings for."""
        response = authenticated_client.get(f'/api/v1/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTripItineraryEndpoint:
    """Tests for /api/v1/trips/{id}/itinerary endpoint."""
    
    def test_get_itinerary(self, authenticated_client, booking):
        """Test getting trip itinerary."""
        trip = booking.package.trip
        
        # Create itinerary items
        ItineraryItem.objects.create(
            trip=trip,
            day_index=1,
            title="Arrival",
            location="Jeddah Airport"
        )
        ItineraryItem.objects.create(
            trip=trip,
            day_index=2,
            title="Umrah",
            location="Makkah"
        )
        
        response = authenticated_client.get(f'/api/v1/trips/{trip.id}/itinerary/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
        assert response.data['results'][0]['day_index'] == 1
        assert response.data['results'][1]['day_index'] == 2


@pytest.mark.django_db
class TestTripUpdatesEndpoint:
    """Tests for /api/v1/trips/{id}/updates endpoint."""
    
    def test_get_trip_updates(self, authenticated_client, booking):
        """Test getting trip updates."""
        trip = booking.package.trip
        
        # Create trip-level update
        TripUpdate.objects.create(
            trip=trip,
            title="Important Update",
            body_md="This is important",
            urgency="IMPORTANT",
            publish_at=timezone.now() - timezone.timedelta(hours=1)
        )
        
        response = authenticated_client.get(f'/api/v1/trips/{trip.id}/updates/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == "Important Update"
    
    def test_get_package_specific_updates(self, authenticated_client, booking):
        """Test that package-specific updates are included."""
        trip = booking.package.trip
        package = booking.package
        
        # Create package-specific update
        TripUpdate.objects.create(
            trip=trip,
            package=package,
            title="Gold Package Update",
            body_md="For Gold package only",
            urgency="INFO",
            publish_at=timezone.now() - timezone.timedelta(hours=1)
        )
        
        response = authenticated_client.get(f'/api/v1/trips/{trip.id}/updates/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
class TestTripEssentialsEndpoint:
    """Tests for /api/v1/trips/{id}/essentials endpoint."""
    
    def test_get_essentials(self, authenticated_client, booking):
        """Test getting trip essentials."""
        trip = booking.package.trip
        
        # Create essentials
        TripGuideSection.objects.create(
            trip=trip,
            order=1,
            title="What to Pack",
            content_md="Pack light clothes"
        )
        
        from apps.trips.models import ChecklistItem, EmergencyContact, TripFAQ
        
        ChecklistItem.objects.create(
            trip=trip,
            label="Passport",
            category="DOCS",
            is_required=True
        )
        
        EmergencyContact.objects.create(
            trip=trip,
            label="Tour Guide",
            phone="+256700000000",
            hours="24/7"
        )
        
        TripFAQ.objects.create(
            trip=trip,
            question="What time is check-in?",
            answer="2 PM",
            order=1
        )
        
        response = authenticated_client.get(f'/api/v1/trips/{trip.id}/essentials/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'sections' in response.data
        assert 'checklist' in response.data
        assert 'contacts' in response.data
        assert 'faqs' in response.data
        assert len(response.data['sections']) == 1
        assert len(response.data['checklist']) == 1
        assert len(response.data['contacts']) == 1
        assert len(response.data['faqs']) == 1

