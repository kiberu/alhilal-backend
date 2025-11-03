"""
Unit tests for Admin Itinerary API endpoints.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, datetime

from apps.trips.models import Trip, ItineraryItem

Account = get_user_model()


class AdminItineraryAPITestCase(TestCase):
    """Test suite for Admin Itinerary API endpoints."""
    
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
        
        # Create itinerary items
        self.item1 = ItineraryItem.objects.create(
            trip=self.trip,
            day_index=1,
            title='Arrival and Check-in',
            location='Makkah',
            start_time=datetime(2025, 12, 1, 14, 0),
            end_time=datetime(2025, 12, 1, 16, 0),
            notes='Welcome to Makkah'
        )
        
        self.item2 = ItineraryItem.objects.create(
            trip=self.trip,
            day_index=2,
            title='Umrah',
            location='Masjid al-Haram',
            start_time=datetime(2025, 12, 2, 8, 0),
            end_time=datetime(2025, 12, 2, 12, 0)
        )
    
    def test_list_itinerary_items(self):
        """Test listing itinerary items."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/itinerary')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_create_itinerary_item(self):
        """Test creating an itinerary item."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'day_index': 3,
            'title': 'Visit to Madinah',
            'location': 'Masjid an-Nabawi',
            'start_time': '2025-12-03T09:00:00Z',
            'end_time': '2025-12-03T12:00:00Z',
            'notes': 'Visit the Prophet\'s Mosque'
        }
        
        response = self.client.post('/api/v1/itinerary', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ItineraryItem.objects.count(), 3)
    
    def test_update_itinerary_item(self):
        """Test updating an itinerary item."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'title': 'Arrival and Hotel Check-in',
            'notes': 'Welcome to Makkah - Updated'
        }
        
        response = self.client.patch(
            f'/api/v1/itinerary/{self.item1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.title, 'Arrival and Hotel Check-in')
        self.assertEqual(self.item1.notes, 'Welcome to Makkah - Updated')
    
    def test_delete_itinerary_item(self):
        """Test deleting an itinerary item."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.delete(f'/api/v1/itinerary/{self.item1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ItineraryItem.objects.count(), 1)
    
    def test_filter_itinerary_by_trip(self):
        """Test filtering itinerary items by trip."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/itinerary?trip={self.trip.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_reorder_itinerary_items(self):
        """Test reordering itinerary items."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Create third item
        item3 = ItineraryItem.objects.create(
            trip=self.trip,
            day_index=3,
            title='Day 3 Activity'
        )
        
        # Reorder: item3, item1, item2
        data = {
            'itemIds': [str(item3.id), str(self.item1.id), str(self.item2.id)]
        }
        
        response = self.client.post('/api/v1/itinerary/reorder', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reordered'], 3)
        
        # Verify order changed
        item3.refresh_from_db()
        self.item1.refresh_from_db()
        self.item2.refresh_from_db()
        
        self.assertEqual(item3.day_index, 1)
        self.assertEqual(self.item1.day_index, 2)
        self.assertEqual(self.item2.day_index, 3)
    
    def test_reorder_requires_staff(self):
        """Test that reordering requires staff permission."""
        non_staff = Account.objects.create_user(
            phone='+9999999999',
            name='Non-Staff',
            role='PILGRIM',
            is_staff=False
        )
        self.client.force_authenticate(user=non_staff)
        
        data = {'itemIds': [str(self.item1.id), str(self.item2.id)]}
        response = self.client.post('/api/v1/itinerary/reorder', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

