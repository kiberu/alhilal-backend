"""
Unit tests for Admin Package API endpoints.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, datetime, timedelta

from apps.trips.models import Trip, TripPackage, PackageFlight, PackageHotel

Account = get_user_model()


class AdminPackageAPITestCase(TestCase):
    """Test suite for Admin Package API endpoints."""
    
    def setUp(self):
        """Set up test client and test data."""
        self.client = APIClient()
        
        # Create staff user
        self.staff_user = Account.objects.create_user(
            phone='+1234567890',
            name='Staff User',
            role='STAFF',
            is_staff=True,
        )
        
        # Create trip
        self.trip = Trip.objects.create(
            code='UMR2025',
            name='Umrah December 2025',
            cities=['Makkah', 'Madinah'],
            start_date=date(2025, 12, 1),
            end_date=date(2025, 12, 15),
            visibility='PUBLIC'
        )
        
        # Create packages
        self.package1 = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=500000,
            currency='SAR',
            capacity=50,
            visibility='PUBLIC'
        )
        
        self.package2 = TripPackage.objects.create(
            trip=self.trip,
            name='Premium Package',
            price_minor_units=800000,
            currency='SAR',
            capacity=30,
            visibility='PUBLIC'
        )
    
    def test_list_packages(self):
        """Test listing packages."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/packages')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_create_package(self):
        """Test creating a package."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'name': 'Silver Package',
            'price_minor_units': 350000,
            'currency': 'SAR',
            'capacity': 60,
            'visibility': 'PUBLIC'
        }
        
        response = self.client.post('/api/v1/packages', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Silver Package')
        self.assertEqual(TripPackage.objects.count(), 3)
    
    def test_update_package(self):
        """Test updating a package."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'price_minor_units': 550000,
            'capacity': 55
        }
        
        response = self.client.patch(
            f'/api/v1/packages/{self.package1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.package1.refresh_from_db()
        self.assertEqual(self.package1.price_minor_units, 550000)
        self.assertEqual(self.package1.capacity, 55)
    
    def test_filter_packages_by_trip(self):
        """Test filtering packages by trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/packages?trip={self.trip.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response might be paginated or a list
        if isinstance(response.data, dict) and 'results' in response.data:
            self.assertGreaterEqual(len(response.data['results']), 2)
        else:
            self.assertGreaterEqual(len(response.data), 2)


class AdminFlightAPITestCase(TestCase):
    """Test suite for Admin Flight API endpoints."""
    
    def setUp(self):
        """Set up test client and test data."""
        self.client = APIClient()
        
        self.staff_user = Account.objects.create_user(
            phone='+1234567890',
            name='Staff User',
            role='STAFF',
            is_staff=True,
        )
        
        self.trip = Trip.objects.create(
            code='UMR2025',
            name='Umrah December 2025',
            cities=['Makkah', 'Madinah'],
            start_date=date(2025, 12, 1),
            end_date=date(2025, 12, 15),
            visibility='PUBLIC'
        )
        
        self.package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=500000,
            currency='SAR',
            capacity=50
        )
        
        # Create flight
        self.flight = PackageFlight.objects.create(
            package=self.package,
            leg='OUTBOUND',
            carrier='SV',
            flight_no='123',
            dep_airport='JFK',
            dep_dt=datetime(2025, 12, 1, 10, 0),
            arr_airport='JED',
            arr_dt=datetime(2025, 12, 1, 22, 0),
            group_pnr='ABC123'
        )
    
    def test_create_flight(self):
        """Test creating a flight."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'package': str(self.package.id),
            'leg': 'RETURN',
            'carrier': 'SV',
            'flight_no': '456',
            'dep_airport': 'JED',
            'dep_dt': '2025-12-15T18:00:00Z',
            'arr_airport': 'JFK',
            'arr_dt': '2025-12-16T06:00:00Z',
            'group_pnr': 'XYZ789'
        }
        
        response = self.client.post('/api/v1/flights', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PackageFlight.objects.count(), 2)
    
    def test_list_flights_for_package(self):
        """Test getting flights for a package."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/packages/{self.package.id}/flights')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['flight_no'], '123')


class AdminHotelAPITestCase(TestCase):
    """Test suite for Admin Hotel API endpoints."""
    
    def setUp(self):
        """Set up test client and test data."""
        self.client = APIClient()
        
        self.staff_user = Account.objects.create_user(
            phone='+1234567890',
            name='Staff User',
            role='STAFF',
            is_staff=True,
        )
        
        self.trip = Trip.objects.create(
            code='UMR2025',
            name='Umrah December 2025',
            cities=['Makkah', 'Madinah'],
            start_date=date(2025, 12, 1),
            end_date=date(2025, 12, 15),
            visibility='PUBLIC'
        )
        
        self.package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=500000,
            currency='SAR',
            capacity=50
        )
        
        # Create hotel
        self.hotel = PackageHotel.objects.create(
            package=self.package,
            name='Hilton Makkah',
            address='123 Main St, Makkah',
            room_type='Deluxe',
            check_in=date(2025, 12, 1),
            check_out=date(2025, 12, 8),
            group_confirmation_no='CONF123'
        )
    
    def test_create_hotel(self):
        """Test creating a hotel."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'package': str(self.package.id),
            'name': 'Marriott Madinah',
            'address': '456 Prophet St, Madinah',
            'room_type': 'Suite',
            'check_in': '2025-12-08',
            'check_out': '2025-12-15',
            'group_confirmation_no': 'CONF456'
        }
        
        response = self.client.post('/api/v1/hotels', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PackageHotel.objects.count(), 2)
    
    def test_list_hotels_for_package(self):
        """Test getting hotels for a package."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/packages/{self.package.id}/hotels')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Hilton Makkah')
    
    def test_update_hotel(self):
        """Test updating a hotel."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'room_type': 'Presidential Suite'
        }
        
        response = self.client.patch(
            f'/api/v1/hotels/{self.hotel.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.hotel.refresh_from_db()
        self.assertEqual(self.hotel.room_type, 'Presidential Suite')

