"""
Unit tests for Admin Booking API endpoints.
Tests authentication, permissions, CRUD operations, and bulk actions.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta

from apps.trips.models import Trip, TripPackage
from apps.bookings.models import Booking
from apps.accounts.models import PilgrimProfile
from apps.common.models import Currency

Account = get_user_model()


class AdminBookingAPITestCase(TestCase):
    """Test suite for Admin Booking API endpoints."""
    
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
        
        # Create pilgrim user
        self.pilgrim_user = Account.objects.create_user(
            phone='+0987654321',
            name='Pilgrim User',
            role='PILGRIM',
            is_staff=False,
        )
        self.pilgrim_user.set_password('testpass123')
        self.pilgrim_user.save()
        
        # Create pilgrim profile
        self.pilgrim = PilgrimProfile.objects.create(
            user=self.pilgrim_user,
            dob='1990-01-01',
            gender='MALE',
            nationality='US',
            emergency_name='Emergency Contact',
            emergency_phone='+1111111111',
        )
        
        # Create currency
        self.currency_usd, _ = Currency.objects.get_or_create(
            code='USD',
            defaults={'name': 'US Dollar', 'symbol': '$'}
        )
        
        # Create trip and package
        self.trip = Trip.objects.create(
            code='UMR2025',
            name='Umrah Package 2025',
            cities=['Makkah', 'Madinah'],
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=45),
            visibility='PUBLIC',
        )
        
        self.package1 = TripPackage.objects.create(
            trip=self.trip,
            name='Standard Package',
            price_minor_units=250000,
            currency=self.currency_usd,
            capacity=50,
            visibility='PUBLIC',
        )
        
        self.package2 = TripPackage.objects.create(
            trip=self.trip,
            name='Premium Package',
            price_minor_units=350000,
            currency=self.currency_usd,
            capacity=30,
            visibility='PUBLIC',
        )
        
        # Create test bookings (different packages to avoid constraint violation)
        self.booking1 = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package1,
            status='EOI',
            payment_status='PENDING',
            amount_paid_minor_units=0,
            currency=self.currency_usd,
        )
        
        self.booking2 = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package2,
            status='BOOKED',
            payment_status='PARTIAL',
            amount_paid_minor_units=100000,
            currency=self.currency_usd,
        )
    
    def test_list_bookings_requires_authentication(self):
        """Test that listing bookings requires authentication."""
        response = self.client.get('/api/v1/bookings')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_bookings_requires_staff_permission(self):
        """Test that only staff users can list all bookings."""
        self.client.force_authenticate(user=self.pilgrim_user)
        response = self.client.get('/api/v1/bookings')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # No bookings returned
    
    def test_list_bookings_success_for_staff(self):
        """Test that staff users can list all bookings."""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get('/api/v1/bookings')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_list_bookings_filtering_by_status(self):
        """Test filtering bookings by status."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/bookings?status=EOI')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['status'], 'EOI')
    
    def test_list_bookings_filtering_by_payment_status(self):
        """Test filtering bookings by payment status."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get('/api/v1/bookings?payment_status=PARTIAL')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['paymentStatus'], 'PARTIAL')
    
    def test_retrieve_booking_success(self):
        """Test retrieving a single booking."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/bookings/{self.booking1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'EOI')
        self.assertIn('pilgrimDetails', response.data)
        self.assertIn('packageDetails', response.data)
    
    def test_create_booking_success(self):
        """Test creating a new booking."""
        self.client.force_authenticate(user=self.staff_user)
        
        # Create a third package for testing creation
        package3 = TripPackage.objects.create(
            trip=self.trip,
            name='Budget Package',
            price_minor_units=150000,
            currency='USD',
            capacity=40,
            visibility='PUBLIC',
        )
        
        data = {
            'pilgrim': str(self.pilgrim.user_id),
            'package': str(package3.id),
            'status': 'BOOKED',
            'paymentStatus': 'PAID',
            'amountPaidMinorUnits': 250000,
            'currency': 'USD',
        }
        
        response = self.client.post('/api/v1/bookings', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'BOOKED')
        
        # Verify booking was created in database
        self.assertEqual(Booking.objects.count(), 3)
    
    def test_update_booking_success(self):
        """Test updating a booking."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {
            'status': 'CONFIRMED',
            'paymentStatus': 'PAID',
            'amountPaidMinorUnits': 250000,
        }
        
        response = self.client.patch(
            f'/api/v1/bookings/{self.booking1.id}',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify update in database
        self.booking1.refresh_from_db()
        self.assertEqual(self.booking1.status, 'CONFIRMED')
        self.assertEqual(self.booking1.payment_status, 'PAID')
    
    def test_delete_booking_success(self):
        """Test deleting a booking."""
        self.client.force_authenticate(user=self.staff_user)
        
        booking_id = self.booking2.id
        response = self.client.delete(f'/api/v1/bookings/{booking_id}')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify deletion in database
        self.assertFalse(Booking.objects.filter(id=booking_id).exists())
    
    def test_bulk_convert_eoi_success(self):
        """Test bulk converting EOI bookings to BOOKED."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {'ids': [str(self.booking1.id)]}
        
        response = self.client.post(
            '/api/v1/bookings/bulk/convert-eoi',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated'], 1)
        
        # Verify update in database
        self.booking1.refresh_from_db()
        self.assertEqual(self.booking1.status, 'BOOKED')
    
    def test_bulk_cancel_success(self):
        """Test bulk canceling bookings."""
        self.client.force_authenticate(user=self.staff_user)
        
        data = {'ids': [str(self.booking1.id), str(self.booking2.id)]}
        
        response = self.client.post(
            '/api/v1/bookings/bulk/cancel',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated'], 2)
        
        # Verify updates in database
        self.booking1.refresh_from_db()
        self.booking2.refresh_from_db()
        self.assertEqual(self.booking1.status, 'CANCELLED')
        self.assertEqual(self.booking2.status, 'CANCELLED')
    
    def test_bulk_operations_require_staff_permission(self):
        """Test that bulk operations require staff permission."""
        self.client.force_authenticate(user=self.pilgrim_user)
        
        data = {'ids': [str(self.booking1.id)]}
        
        response = self.client.post(
            '/api/v1/bookings/bulk/convert-eoi',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_camelcase_conversion(self):
        """Test that API returns camelCase keys."""
        self.client.force_authenticate(user=self.staff_user)
        
        response = self.client.get(f'/api/v1/bookings/{self.booking1.id}')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check camelCase keys
        self.assertIn('referenceNumber', response.data)
        self.assertIn('paymentStatus', response.data)
        self.assertIn('amountPaidMinorUnits', response.data)
        self.assertIn('createdAt', response.data)
        # Check snake_case keys are NOT present
        self.assertNotIn('reference_number', response.data)
        self.assertNotIn('payment_status', response.data)

