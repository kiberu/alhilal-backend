"""
Unit tests for Admin Trip Content API endpoints (Updates, Guides, Checklists, FAQs, Contacts).
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, datetime, timezone

from apps.trips.models import (
    Trip, TripPackage, TripUpdate, TripGuideSection, 
    ChecklistItem, EmergencyContact, TripFAQ
)

Account = get_user_model()


class AdminTripUpdateAPITestCase(TestCase):
    """Test suite for Admin Trip Update API endpoints."""
    
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
        
        self.update = TripUpdate.objects.create(
            trip=self.trip,
            title='Important Announcement',
            body_md='Please bring your passport',
            urgency='IMPORTANT',
            publish_at=datetime.now(timezone.utc)
        )
    
    def test_create_trip_update(self):
        """Test creating a trip update."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'title': 'New Update',
            'body_md': 'This is a new update',
            'urgency': 'INFO',
            'publish_at': '2025-11-01T12:00:00Z',
            'pinned': False
        }
        
        response = self.client.post('/api/v1/updates', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TripUpdate.objects.count(), 2)
    
    def test_toggle_pin(self):
        """Test toggling pin status."""
        self.client.force_authenticate(user=self.staff_user)
        
        self.assertFalse(self.update.pinned)
        
        response = self.client.post(f'/api/v1/updates/{self.update.id}/toggle_pin')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['pinned'])
        
        self.update.refresh_from_db()
        self.assertTrue(self.update.pinned)


class AdminTripGuideAPITestCase(TestCase):
    """Test suite for Admin Trip Guide API endpoints."""
    
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
        
        self.guide1 = TripGuideSection.objects.create(
            trip=self.trip,
            order=1,
            title='What to Pack',
            content_md='# Packing List\n\n- Passport\n- Ihram'
        )
        
        self.guide2 = TripGuideSection.objects.create(
            trip=self.trip,
            order=2,
            title='Rituals Guide',
            content_md='# Umrah Rituals\n\n1. Ihram\n2. Tawaf'
        )
    
    def test_create_guide_section(self):
        """Test creating a guide section."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'order': 3,
            'title': 'Safety Tips',
            'content_md': '# Safety\n\n- Stay hydrated'
        }
        
        response = self.client.post('/api/v1/guides', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TripGuideSection.objects.count(), 3)
    
    def test_reorder_guides(self):
        """Test reordering guide sections."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Reverse order
        data = {
            'sectionIds': [str(self.guide2.id), str(self.guide1.id)]
        }
        
        response = self.client.post('/api/v1/guides/reorder', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reordered'], 2)
        
        # Verify order
        self.guide2.refresh_from_db()
        self.guide1.refresh_from_db()
        
        self.assertEqual(self.guide2.order, 0)
        self.assertEqual(self.guide1.order, 1)


class AdminChecklistAPITestCase(TestCase):
    """Test suite for Admin Checklist API endpoints."""
    
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
        
        self.checklist_item = ChecklistItem.objects.create(
            trip=self.trip,
            label='Valid Passport',
            category='DOCS',
            is_required=True
        )
    
    def test_create_checklist_item(self):
        """Test creating a checklist item."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'label': 'Vaccination Certificate',
            'category': 'HEALTH',
            'is_required': True
        }
        
        response = self.client.post('/api/v1/checklists', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChecklistItem.objects.count(), 2)
    
    def test_filter_by_category(self):
        """Test filtering checklist by category."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Create another item with different category
        ChecklistItem.objects.create(
            trip=self.trip,
            label='Travel Insurance',
            category='MONEY',
            is_required=False
        )
        
        response = self.client.get('/api/v1/checklists?category=DOCS')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response might be paginated or a list
        if isinstance(response.data, dict) and 'results' in response.data:
            self.assertGreaterEqual(len(response.data['results']), 1)
        else:
            self.assertGreaterEqual(len(response.data), 1)


class AdminEmergencyContactAPITestCase(TestCase):
    """Test suite for Admin Emergency Contact API endpoints."""
    
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
        
        self.contact = EmergencyContact.objects.create(
            trip=self.trip,
            label='Tour Guide',
            phone='+966501234567',
            hours='24/7'
        )
    
    def test_create_emergency_contact(self):
        """Test creating an emergency contact."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'label': 'Local Police',
            'phone': '+966112345678',
            'hours': '24/7',
            'notes': 'For emergencies only'
        }
        
        response = self.client.post('/api/v1/contacts', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EmergencyContact.objects.count(), 2)
    
    def test_update_contact(self):
        """Test updating an emergency contact."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {'phone': '+966509876543'}
        
        response = self.client.patch(
            f'/api/v1/contacts/{self.contact.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.phone, '+966509876543')


class AdminTripFAQAPITestCase(TestCase):
    """Test suite for Admin Trip FAQ API endpoints."""
    
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
        
        self.faq1 = TripFAQ.objects.create(
            trip=self.trip,
            question='What should I bring?',
            answer='Passport, Ihram, comfortable shoes',
            order=1
        )
        
        self.faq2 = TripFAQ.objects.create(
            trip=self.trip,
            question='Is visa included?',
            answer='Yes, visa processing is included',
            order=2
        )
    
    def test_create_faq(self):
        """Test creating an FAQ."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'trip': str(self.trip.id),
            'question': 'What is the refund policy?',
            'answer': '50% refund if cancelled 30 days before',
            'order': 3
        }
        
        response = self.client.post('/api/v1/faqs', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TripFAQ.objects.count(), 3)
    
    def test_reorder_faqs(self):
        """Test reordering FAQs."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Reverse order
        data = {
            'faqIds': [str(self.faq2.id), str(self.faq1.id)]
        }
        
        response = self.client.post('/api/v1/faqs/reorder', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reordered'], 2)
        
        # Verify order
        self.faq2.refresh_from_db()
        self.faq1.refresh_from_db()
        
        self.assertEqual(self.faq2.order, 0)
        self.assertEqual(self.faq1.order, 1)
    
    def test_update_faq(self):
        """Test updating an FAQ."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'answer': 'Passport, Ihram, comfortable shoes, and travel documents'
        }
        
        response = self.client.patch(
            f'/api/v1/faqs/{self.faq1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.faq1.refresh_from_db()
        self.assertIn('travel documents', self.faq1.answer)

