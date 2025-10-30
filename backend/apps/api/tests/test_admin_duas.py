"""
Unit tests for Admin Dua API endpoints.
Tests authentication, permissions, and CRUD operations.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.content.models import Dua

Account = get_user_model()


class AdminDuaAPITestCase(TestCase):
    """Test suite for Admin Dua API endpoints."""
    
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
        
        # Create non-staff user
        self.pilgrim_user = Account.objects.create_user(
            phone='+0987654321',
            name='Pilgrim User',
            role='PILGRIM',
            is_staff=False,
        )
        
        # Create test duas
        self.dua1 = Dua.objects.create(
            category='TAWAF',
            text_ar='Arabic text for Tawaf',
            text_en='English text for Tawaf',
            transliteration='Transliteration for Tawaf',
            source='Quran',
        )
        
        self.dua2 = Dua.objects.create(
            category='SAI',
            text_ar='Arabic text for Sai',
            text_en='English text for Sai',
            transliteration='Transliteration for Sai',
        )
        
        self.dua3 = Dua.objects.create(
            category='ARAFAT',
            text_ar='Arabic text for Arafat',
            text_en='English text for Arafat',
        )
    
    def test_list_duas_requires_authentication(self):
        """Test that listing duas requires authentication."""
        response = self.client.get('/api/v1/duas')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_duas_requires_staff_permission(self):
        """Test that only staff users can list all duas."""
        self.client.force_authenticate(user=self.pilgrim_user)
        response = self.client.get('/api/v1/duas')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # No duas returned
    
    def test_list_duas_success_for_staff(self):
        """Test that staff users can list all duas."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/duas')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['results']), 3)
    
    def test_list_duas_filtering_by_category(self):
        """Test filtering duas by category."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/duas?category=TAWAF')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['category'], 'TAWAF')
    
    def test_list_duas_search(self):
        """Test searching duas."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/duas?search=Arafat')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
    
    def test_retrieve_dua_success(self):
        """Test retrieving a single dua."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/duas/{self.dua1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['category'], 'TAWAF')
        self.assertEqual(response.data['textAr'], 'Arabic text for Tawaf')
        self.assertEqual(response.data['textEn'], 'English text for Tawaf')
    
    def test_create_dua_success(self):
        """Test creating a new dua."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'category': 'GENERAL',
            'textAr': 'New Arabic text',
            'textEn': 'New English text',
            'transliteration': 'New transliteration',
            'source': 'Hadith',
        }
        
        response = self.client.post('/api/v1/duas', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'GENERAL')
        self.assertEqual(response.data['textAr'], 'New Arabic text')
        
        # Verify dua was created in database
        self.assertEqual(Dua.objects.count(), 4)
    
    def test_create_dua_requires_staff_permission(self):
        """Test that only staff can create duas."""
        self.client.force_authenticate(user=self.pilgrim_user)
        
        data = {
            'category': 'GENERAL',
            'textAr': 'Test',
            'textEn': 'Test',
        }
        
        response = self.client.post('/api/v1/duas', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_dua_success(self):
        """Test updating a dua."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'textEn': 'Updated English text',
            'source': 'Updated source',
        }
        
        response = self.client.patch(
            f'/api/v1/duas/{self.dua1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['textEn'], 'Updated English text')
        
        # Verify update in database
        self.dua1.refresh_from_db()
        self.assertEqual(self.dua1.text_en, 'Updated English text')
        self.assertEqual(self.dua1.source, 'Updated source')
    
    def test_delete_dua_success(self):
        """Test deleting a dua."""
        self.client.force_authenticate(user=self.staff_user)
        
        dua_id = self.dua3.id
        response = self.client.delete(f'/api/v1/duas/{dua_id}')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify deletion in database
        self.assertFalse(Dua.objects.filter(id=dua_id).exists())
    
    def test_camelcase_conversion(self):
        """Test that API returns camelCase keys."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/duas/{self.dua1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check camelCase keys
        self.assertIn('textAr', response.data)
        self.assertIn('textEn', response.data)
        self.assertIn('createdAt', response.data)
        self.assertIn('updatedAt', response.data)
        # Check snake_case keys are NOT present
        self.assertNotIn('text_ar', response.data)
        self.assertNotIn('text_en', response.data)

