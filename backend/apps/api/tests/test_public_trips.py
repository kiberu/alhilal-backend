"""
Tests for public trip endpoints.
"""
import pytest
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.trips.models import (
    Trip, TripPackage, ItineraryItem, TripFAQ,
    PackageHotel, EmergencyContact, TripGuideSection
)
from apps.common.models import Currency


@pytest.mark.django_db
class TestPublicTripListView:
    """Tests for public trip list endpoint."""
    
    def test_list_public_trips_success(self, api_client, currency_usd):
        """Test listing public trips."""
        # Create public trip with public package
        trip = Trip.objects.create(
            code='NOV2025',
            name='November Umrah',
            cities=['Makkah', 'Madinah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC',
            featured=True,
            cover_image='https://example.com/image.jpg'
        )
        
        TripPackage.objects.create(
            trip=trip,
            name='Gold Package',
            price_minor_units=180000,
            currency=currency_usd,
            capacity=30,
            visibility='PUBLIC'
        )
        
        response = api_client.get('/api/v1/public/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['code'] == 'NOV2025'
        assert response.data['results'][0]['name'] == 'November Umrah'
        assert response.data['results'][0]['featured'] is True
        assert response.data['results'][0]['cover_image'] == 'https://example.com/image.jpg'
        assert response.data['results'][0]['packages_count'] == 1
    
    def test_list_public_trips_no_auth_required(self, api_client, currency_usd):
        """Test that no authentication is required."""
        trip = Trip.objects.create(
            code='DEC2025',
            name='December Umrah',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=60),
            end_date=timezone.now().date() + timedelta(days=70),
            visibility='PUBLIC'
        )
        
        TripPackage.objects.create(
            trip=trip,
            name='Silver Package',
            price_minor_units=150000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # No credentials set
        response = api_client.get('/api/v1/public/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
    
    def test_list_public_trips_excludes_private(self, api_client, currency_usd):
        """Test that private trips are excluded."""
        # Create private trip
        private_trip = Trip.objects.create(
            code='PRIV2025',
            name='Private Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PRIVATE'
        )
        
        TripPackage.objects.create(
            trip=private_trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Create public trip
        public_trip = Trip.objects.create(
            code='PUB2025',
            name='Public Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        TripPackage.objects.create(
            trip=public_trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        response = api_client.get('/api/v1/public/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['code'] == 'PUB2025'
    
    def test_list_public_trips_excludes_no_public_packages(self, api_client, currency_usd):
        """Test that trips without public packages are excluded."""
        trip = Trip.objects.create(
            code='NOPACK2025',
            name='No Public Packages',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        # Create only private package
        TripPackage.objects.create(
            trip=trip,
            name='Private Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PRIVATE'
        )
        
        response = api_client.get('/api/v1/public/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 0
    
    def test_filter_featured_trips(self, api_client, currency_usd):
        """Test filtering by featured trips."""
        # Create featured trip
        featured_trip = Trip.objects.create(
            code='FEAT2025',
            name='Featured Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC',
            featured=True
        )
        
        TripPackage.objects.create(
            trip=featured_trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Create non-featured trip
        regular_trip = Trip.objects.create(
            code='REG2025',
            name='Regular Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC',
            featured=False
        )
        
        TripPackage.objects.create(
            trip=regular_trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        response = api_client.get('/api/v1/public/trips/?featured=true')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['code'] == 'FEAT2025'
        assert response.data['results'][0]['featured'] is True
    
    def test_trip_ordering(self, api_client, currency_usd):
        """Test that featured trips appear first, then by start_date."""
        # Create non-featured trip with earlier date
        trip1 = Trip.objects.create(
            code='TRIP1',
            name='Trip 1',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=10),
            end_date=timezone.now().date() + timedelta(days=20),
            visibility='PUBLIC',
            featured=False
        )
        
        TripPackage.objects.create(
            trip=trip1,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Create featured trip with later date
        trip2 = Trip.objects.create(
            code='TRIP2',
            name='Trip 2',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC',
            featured=True
        )
        
        TripPackage.objects.create(
            trip=trip2,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        response = api_client.get('/api/v1/public/trips/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2
        # Featured trip should come first
        assert response.data['results'][0]['code'] == 'TRIP2'
        assert response.data['results'][1]['code'] == 'TRIP1'


@pytest.mark.django_db
class TestPublicTripDetailView:
    """Tests for public trip detail endpoint."""
    
    def test_get_trip_detail_success(self, api_client, currency_usd):
        """Test retrieving trip details."""
        trip = Trip.objects.create(
            code='NOV2025',
            name='November Umrah',
            cities=['Makkah', 'Madinah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC',
            featured=True,
            cover_image='https://example.com/image.jpg'
        )
        
        # Create package
        package = TripPackage.objects.create(
            trip=trip,
            name='Gold Package',
            price_minor_units=180000,
            currency=currency_usd,
            capacity=30,
            visibility='PUBLIC'
        )
        
        # Create hotel for package
        PackageHotel.objects.create(
            package=package,
            name='Swissotel Makkah',
            address='Makkah, Saudi Arabia',
            room_type='Double',
            check_in=trip.start_date,
            check_out=trip.start_date + timedelta(days=4)
        )
        
        # Create itinerary
        ItineraryItem.objects.create(
            trip=trip,
            day_index=1,
            title='Arrival in Makkah',
            location='Makkah',
            notes='Check-in and rest'
        )
        
        # Create FAQ
        TripFAQ.objects.create(
            trip=trip,
            question='What is included?',
            answer='Flights, accommodation, and visa',
            order=1
        )
        
        # Create guide section
        TripGuideSection.objects.create(
            trip=trip,
            order=1,
            title='What to Pack',
            content_md='Bring comfortable clothes'
        )
        
        # Create emergency contact
        EmergencyContact.objects.create(
            trip=trip,
            label='Al-Hilal Support',
            phone='+256700123456',
            hours='24/7'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == 'NOV2025'
        assert response.data['name'] == 'November Umrah'
        assert response.data['featured'] is True
        assert len(response.data['packages']) == 1
        assert response.data['packages'][0]['name'] == 'Gold Package'
        assert len(response.data['packages'][0]['hotels']) == 1
        assert response.data['has_itinerary'] is True
        assert len(response.data['itinerary']) == 1
        assert len(response.data['faqs']) == 1
        assert len(response.data['guide_sections']) == 1
        assert len(response.data['emergency_contacts']) == 1
    
    def test_get_trip_detail_no_auth_required(self, api_client, currency_usd):
        """Test that no authentication is required."""
        trip = Trip.objects.create(
            code='DEC2025',
            name='December Umrah',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=60),
            end_date=timezone.now().date() + timedelta(days=70),
            visibility='PUBLIC'
        )
        
        TripPackage.objects.create(
            trip=trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == 'DEC2025'
    
    def test_get_private_trip_not_found(self, api_client, currency_usd):
        """Test that private trips cannot be accessed."""
        trip = Trip.objects.create(
            code='PRIV2025',
            name='Private Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PRIVATE'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_trip_with_no_itinerary(self, api_client, currency_usd):
        """Test trip detail when no itinerary exists."""
        trip = Trip.objects.create(
            code='NOITINERARY',
            name='Trip Without Itinerary',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        TripPackage.objects.create(
            trip=trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['has_itinerary'] is False
        assert len(response.data['itinerary']) == 0
    
    def test_get_trip_only_public_packages(self, api_client, currency_usd):
        """Test that only public packages are returned."""
        trip = Trip.objects.create(
            code='MIXED2025',
            name='Mixed Packages Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        # Public package
        TripPackage.objects.create(
            trip=trip,
            name='Public Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Private package
        TripPackage.objects.create(
            trip=trip,
            name='Private Package',
            price_minor_units=200000,
            currency=currency_usd,
            visibility='PRIVATE'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['packages']) == 1
        assert response.data['packages'][0]['name'] == 'Public Package'
    
    def test_get_trip_with_multiple_hotels(self, api_client, currency_usd):
        """Test trip with multiple hotels per package."""
        trip = Trip.objects.create(
            code='MULTI2025',
            name='Multi Hotel Trip',
            cities=['Makkah', 'Madinah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        package = TripPackage.objects.create(
            trip=trip,
            name='Complete Package',
            price_minor_units=180000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Create multiple hotels
        PackageHotel.objects.create(
            package=package,
            name='Makkah Hotel',
            address='Makkah, Saudi Arabia',
            check_in=trip.start_date,
            check_out=trip.start_date + timedelta(days=5)
        )
        
        PackageHotel.objects.create(
            package=package,
            name='Madinah Hotel',
            address='Madinah, Saudi Arabia',
            check_in=trip.start_date + timedelta(days=5),
            check_out=trip.end_date
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['packages'][0]['hotels']) == 2
        assert response.data['packages'][0]['hotels'][0]['name'] == 'Makkah Hotel'
        assert response.data['packages'][0]['hotels'][1]['name'] == 'Madinah Hotel'
    
    def test_get_trip_itinerary_ordered(self, api_client, currency_usd):
        """Test that itinerary is ordered by day_index."""
        trip = Trip.objects.create(
            code='ORDER2025',
            name='Ordered Itinerary Trip',
            cities=['Makkah'],
            start_date=timezone.now().date() + timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=40),
            visibility='PUBLIC'
        )
        
        TripPackage.objects.create(
            trip=trip,
            name='Package',
            price_minor_units=100000,
            currency=currency_usd,
            visibility='PUBLIC'
        )
        
        # Create items out of order
        ItineraryItem.objects.create(
            trip=trip,
            day_index=3,
            title='Day 3 Activity'
        )
        
        ItineraryItem.objects.create(
            trip=trip,
            day_index=1,
            title='Day 1 Activity'
        )
        
        ItineraryItem.objects.create(
            trip=trip,
            day_index=2,
            title='Day 2 Activity'
        )
        
        response = api_client.get(f'/api/v1/public/trips/{trip.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['itinerary']) == 3
        assert response.data['itinerary'][0]['title'] == 'Day 1 Activity'
        assert response.data['itinerary'][1]['title'] == 'Day 2 Activity'
        assert response.data['itinerary'][2]['title'] == 'Day 3 Activity'
    
    def test_get_nonexistent_trip(self, api_client):
        """Test retrieving a trip that doesn't exist."""
        from uuid import uuid4
        fake_id = uuid4()
        
        response = api_client.get(f'/api/v1/public/trips/{fake_id}/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

