"""
Unit tests for Admin Trip API endpoints.
Tests authentication, permissions, CRUD operations, filtering, and pagination.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta

from apps.trips.models import Trip, TripPackage
from apps.common.models import Currency

Account = get_user_model()


class AdminTripAPITestCase(TestCase):
    """Test suite for Admin Trip API endpoints."""
    
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
        self.staff_user.set_password('testpass123')
        self.staff_user.save()
        
        # Create non-staff user
        self.pilgrim_user = Account.objects.create_user(
            phone='+0987654321',
            name='Pilgrim User',
            role='PILGRIM',
            is_staff=False,
        )
        self.pilgrim_user.set_password('testpass123')
        self.pilgrim_user.save()
        
        # Create currency
        self.currency_usd, _ = Currency.objects.get_or_create(
            code='USD',
            defaults={'name': 'US Dollar', 'symbol': '$'}
        )
        
        # Create test trips
        self.trip1 = Trip.objects.create(
            code='UMR2025',
            name='Umrah Package 2025',
            cities=['Makkah', 'Madinah'],
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=45),
            visibility='PUBLIC',
        )
        
        self.trip2 = Trip.objects.create(
            code='HAJ2025',
            name='Hajj Package 2025',
            cities=['Makkah', 'Madinah', 'Mina'],
            start_date=date.today() + timedelta(days=60),
            end_date=date.today() + timedelta(days=75),
            visibility='PRIVATE',
        )
        
        # Create packages for trip1
        self.package1 = TripPackage.objects.create(
            trip=self.trip1,
            name='Standard Package',
            price_minor_units=250000,
            currency=self.currency_usd,
            capacity=50,
            visibility='PUBLIC',
        )
    
    def test_list_trips_requires_authentication(self):
        """Test that listing trips requires authentication."""
        response = self.client.get('/api/v1/trips')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_trips_requires_staff_permission(self):
        """Test that only staff users can list all trips."""
        # Pilgrim user should not have access
        self.client.force_authenticate(user=self.pilgrim_user)
        response = self.client.get('/api/v1/trips')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # No trips returned
    
    def test_list_trips_success_for_staff(self):
        """Test that staff users can list all trips."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/trips')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('totalPages', response.data)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_list_trips_pagination(self):
        """Test trip list pagination."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Request page 1 with page_size 1
        response = self.client.get('/api/v1/trips?page=1&page_size=1')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['totalPages'], 2)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_list_trips_filtering_by_visibility(self):
        """Test filtering trips by visibility."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/trips?visibility=PUBLIC')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['code'], 'UMR2025')
    
    def test_list_trips_search_by_name(self):
        """Test searching trips by name."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/trips?search=Umrah')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['code'], 'UMR2025')
    
    def test_retrieve_trip_success(self):
        """Test retrieving a single trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/trips/{self.trip1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'UMR2025')
        self.assertEqual(response.data['name'], 'Umrah Package 2025')
        self.assertIn('packages', response.data)
        self.assertEqual(len(response.data['packages']), 1)
    
    def test_retrieve_trip_not_found(self):
        """Test retrieving non-existent trip returns 404."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/trips/00000000-0000-0000-0000-000000000000')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_trip_success(self):
        """Test creating a new trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'code': 'TEST2025',
            'name': 'Test Trip',
            'cities': ['Makkah'],
            'startDate': str(date.today() + timedelta(days=90)),
            'endDate': str(date.today() + timedelta(days=100)),
            'visibility': 'PUBLIC',
        }
        
        response = self.client.post('/api/v1/trips', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'TEST2025')
        self.assertEqual(response.data['name'], 'Test Trip')
        
        # Verify trip was created in database
        self.assertTrue(Trip.objects.filter(code='TEST2025').exists())
    
    def test_create_trip_requires_staff_permission(self):
        """Test that only staff can create trips."""
        self.client.force_authenticate(user=self.pilgrim_user)
        
        data = {
            'code': 'TEST2025',
            'name': 'Test Trip',
            'cities': ['Makkah'],
            'startDate': str(date.today() + timedelta(days=90)),
            'endDate': str(date.today() + timedelta(days=100)),
            'visibility': 'PUBLIC',
        }
        
        response = self.client.post('/api/v1/trips', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_trip_success(self):
        """Test updating a trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'name': 'Updated Umrah Package',
            'visibility': 'PRIVATE',
        }
        
        response = self.client.patch(
            f'/api/v1/trips/{self.trip1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Umrah Package')
        self.assertEqual(response.data['visibility'], 'PRIVATE')
        
        # Verify update in database
        self.trip1.refresh_from_db()
        self.assertEqual(self.trip1.name, 'Updated Umrah Package')
        self.assertEqual(self.trip1.visibility, 'PRIVATE')
    
    def test_update_trip_requires_staff_permission(self):
        """Test that only staff can update trips."""
        self.client.force_authenticate(user=self.pilgrim_user)
        
        data = {'name': 'Updated Name'}
        
        response = self.client.patch(
            f'/api/v1/trips/{self.trip1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_trip_success(self):
        """Test deleting a trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        trip_id = self.trip2.id
        response = self.client.delete(f'/api/v1/trips/{trip_id}')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify deletion in database
        self.assertFalse(Trip.objects.filter(id=trip_id).exists())
    
    def test_delete_trip_requires_staff_permission(self):
        """Test that only staff can delete trips."""
        self.client.force_authenticate(user=self.pilgrim_user)
        
        response = self.client.delete(f'/api/v1/trips/{self.trip1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_duplicate_trip_success(self):
        """Test duplicating a trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.post(f'/api/v1/trips/{self.trip1.id}/duplicate')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['code'].startswith('UMR2025'))
        self.assertTrue('Copy' in response.data['name'])
        self.assertEqual(response.data['visibility'], 'PRIVATE')
    
    def test_camelcase_conversion(self):
        """Test that API returns camelCase keys."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/trips/{self.trip1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check camelCase keys
        self.assertIn('startDate', response.data)
        self.assertIn('endDate', response.data)
        self.assertIn('coverImage', response.data)
        self.assertIn('createdAt', response.data)
        self.assertIn('updatedAt', response.data)
        # Check snake_case keys are NOT present
        self.assertNotIn('start_date', response.data)
        self.assertNotIn('end_date', response.data)

