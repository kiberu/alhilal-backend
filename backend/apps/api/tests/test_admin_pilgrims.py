"""
Unit tests for Admin Pilgrim API endpoints.
Tests authentication, permissions, CRUD operations, and nested endpoints.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.accounts.models import PilgrimProfile

Account = get_user_model()


class AdminPilgrimAPITestCase(TestCase):
    """Test suite for Admin Pilgrim API endpoints."""
    
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
        self.non_staff_user = Account.objects.create_user(
            phone='+0987654321',
            name='Non-Staff User',
            role='PILGRIM',
            is_staff=False,
        )
        
        # Create pilgrim users
        self.pilgrim_user1 = Account.objects.create_user(
            phone='+1111111111',
            name='John Doe',
            email='john@example.com',
            role='PILGRIM',
        )
        
        self.pilgrim_user2 = Account.objects.create_user(
            phone='+2222222222',
            name='Jane Smith',
            email='jane@example.com',
            role='PILGRIM',
        )
        
        # Create pilgrim profiles
        self.pilgrim1 = PilgrimProfile.objects.create(
            user=self.pilgrim_user1,
            dob='1990-01-15',
            gender='MALE',
            nationality='US',
            emergency_name='Emergency Contact 1',
            emergency_phone='+3333333333',
            medical_conditions='None',
        )
        
        self.pilgrim2 = PilgrimProfile.objects.create(
            user=self.pilgrim_user2,
            dob='1985-05-20',
            gender='FEMALE',
            nationality='UK',
            emergency_name='Emergency Contact 2',
            emergency_phone='+4444444444',
        )
    
    def test_list_pilgrims_requires_authentication(self):
        """Test that listing pilgrims requires authentication."""
        response = self.client.get('/api/v1/pilgrims')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_pilgrims_requires_staff_permission(self):
        """Test that only staff users can list all pilgrims."""
        self.client.force_authenticate(user=self.non_staff_user)
        response = self.client.get('/api/v1/pilgrims')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # No pilgrims returned
    
    def test_list_pilgrims_success_for_staff(self):
        """Test that staff users can list all pilgrims."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/pilgrims')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_list_pilgrims_pagination(self):
        """Test pilgrim list pagination."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/pilgrims?page=1&page_size=1')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['totalPages'], 2)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_list_pilgrims_filtering_by_nationality(self):
        """Test filtering pilgrims by nationality."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/pilgrims?nationality=US')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['user']['name'], 'John Doe')
    
    def test_list_pilgrims_filtering_by_gender(self):
        """Test filtering pilgrims by gender."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/pilgrims?gender=FEMALE')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['user']['name'], 'Jane Smith')
    
    def test_list_pilgrims_search_by_name(self):
        """Test searching pilgrims by name."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/pilgrims?search=Jane')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['user']['name'], 'Jane Smith')
    
    def test_retrieve_pilgrim_success(self):
        """Test retrieving a single pilgrim."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/pilgrims/{self.pilgrim1.user_id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['name'], 'John Doe')
        self.assertEqual(response.data['gender'], 'MALE')
        self.assertEqual(response.data['nationality'], 'US')
    
    def test_retrieve_pilgrim_bookings(self):
        """Test retrieving pilgrim's bookings."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/pilgrims/{self.pilgrim1.user_id}/bookings')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_retrieve_pilgrim_documents(self):
        """Test retrieving pilgrim's documents."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/pilgrims/{self.pilgrim1.user_id}/documents')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('passports', response.data)
        self.assertIn('visas', response.data)
    
    def test_nested_endpoints_require_staff_permission(self):
        """Test that nested endpoints require staff permission."""
        self.client.force_authenticate(user=self.non_staff_user)
        
        response = self.client.get(f'/api/v1/pilgrims/{self.pilgrim1.user_id}/bookings')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_pilgrim_success(self):
        """Test updating a pilgrim profile."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'emergency_name': 'Updated Emergency Contact',
            'emergency_phone': '+9999999999',
            'medical_conditions': 'Diabetes',
        }
        
        response = self.client.patch(
            f'/api/v1/pilgrims/{self.pilgrim1.user_id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify update in database
        self.pilgrim1.refresh_from_db()
        self.assertEqual(self.pilgrim1.emergency_name, 'Updated Emergency Contact')
        self.assertEqual(self.pilgrim1.emergency_phone, '+9999999999')
        self.assertEqual(self.pilgrim1.medical_conditions, 'Diabetes')
    
    def test_camelcase_conversion(self):
        """Test that API returns camelCase keys."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/pilgrims/{self.pilgrim1.user_id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check camelCase keys
        self.assertIn('emergencyName', response.data)
        self.assertIn('emergencyPhone', response.data)
        self.assertIn('medicalConditions', response.data)
        self.assertIn('createdAt', response.data)
        # Check snake_case keys are NOT present
        self.assertNotIn('emergency_name', response.data)
        self.assertNotIn('medical_conditions', response.data)

