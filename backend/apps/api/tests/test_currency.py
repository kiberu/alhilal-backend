"""
Unit tests for Currency management.
Tests the Currency model and its integration with TripPackage, Booking, and Payment models.
"""
import pytest
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.common.models import Currency
from apps.trips.models import Trip, TripPackage
from apps.bookings.models import Booking, Payment
from apps.accounts.models import Account, PilgrimProfile
from datetime import date, timedelta


class CurrencyModelTests(TestCase):
    """Test the Currency model."""
    
    def setUp(self):
        """Set up test data."""
        self.currency_data = {
            'code': 'UGX',
            'name': 'Ugandan Shilling',
            'symbol': 'USh',
            'is_active': True
        }
    
    def test_create_currency(self):
        """Test creating a currency."""
        currency = Currency.objects.create(**self.currency_data)
        self.assertEqual(currency.code, 'UGX')
        self.assertEqual(currency.name, 'Ugandan Shilling')
        self.assertEqual(currency.symbol, 'USh')
        self.assertTrue(currency.is_active)
    
    def test_currency_str_representation(self):
        """Test string representation of currency."""
        currency = Currency.objects.create(**self.currency_data)
        self.assertEqual(str(currency), 'UGX - Ugandan Shilling')
    
    def test_currency_code_unique(self):
        """Test that currency code must be unique."""
        Currency.objects.create(**self.currency_data)
        with self.assertRaises(Exception):
            Currency.objects.create(**self.currency_data)


class PackageCurrencyTests(TestCase):
    """Test currency integration with TripPackage model."""
    
    def setUp(self):
        """Set up test data."""
        self.currency, _ = Currency.objects.get_or_create(
            code='UGX',
            defaults={
                'name': 'Ugandan Shilling',
                'symbol': 'USh',
                'is_active': True
            }
        )
        self.trip = Trip.objects.create(
            name='Test Umrah Trip',
            code='TEST2025',
            trip_type='UMRAH',
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=40)
        )
    
    def test_package_with_currency(self):
        """Test creating a package with currency."""
        package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=5000000,
            currency=self.currency
        )
        self.assertEqual(package.currency, self.currency)
        self.assertEqual(package.currency.code, 'UGX')
    
    def test_package_without_currency(self):
        """Test creating a package without currency."""
        package = TripPackage.objects.create(
            trip=self.trip,
            name='Silver Package',
            price_minor_units=3000000
        )
        self.assertIsNone(package.currency)


class BookingCurrencyInheritanceTests(TestCase):
    """Test currency inheritance in Booking model."""
    
    def setUp(self):
        """Set up test data."""
        self.currency, _ = Currency.objects.get_or_create(
            code='UGX',
            defaults={
                'name': 'Ugandan Shilling',
                'symbol': 'USh',
                'is_active': True
            }
        )
        self.trip = Trip.objects.create(
            name='Test Umrah Trip',
            code='TEST2025',
            trip_type='UMRAH',
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=40)
        )
        self.package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=5000000,
            currency=self.currency
        )
        self.user = Account.objects.create_user(
            phone='+256700000001',
            name='Test User',
            password='testpass123',
            role='PILGRIM'
        )
        self.pilgrim = PilgrimProfile.objects.create(
            user=self.user,
            nationality='UG'
        )
    
    def test_booking_inherits_currency_from_package(self):
        """Test that booking inherits currency from package on creation."""
        booking = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package
        )
        self.assertEqual(booking.currency, self.currency)
        self.assertEqual(booking.currency.code, 'UGX')
    
    def test_booking_currency_updates_with_package(self):
        """Test that booking currency updates when package currency changes."""
        booking = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package
        )
        
        # Change package currency
        new_currency, _ = Currency.objects.get_or_create(
            code='USD',
            defaults={
                'name': 'US Dollar',
                'symbol': '$',
                'is_active': True
            }
        )
        self.package.currency = new_currency
        self.package.save()
        
        # Re-save booking to trigger inheritance
        booking.save()
        booking.refresh_from_db()
        
        self.assertEqual(booking.currency, new_currency)
        self.assertEqual(booking.currency.code, 'USD')


class PaymentCurrencyInheritanceTests(TestCase):
    """Test currency inheritance in Payment model."""
    
    def setUp(self):
        """Set up test data."""
        self.currency, _ = Currency.objects.get_or_create(
            code='UGX',
            defaults={
                'name': 'Ugandan Shilling',
                'symbol': 'USh',
                'is_active': True
            }
        )
        self.trip = Trip.objects.create(
            name='Test Umrah Trip',
            code='TEST2025',
            trip_type='UMRAH',
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=40)
        )
        self.package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=5000000,
            currency=self.currency
        )
        self.user = Account.objects.create_user(
            phone='+256700000001',
            name='Test User',
            password='testpass123',
            role='PILGRIM'
        )
        self.pilgrim = PilgrimProfile.objects.create(
            user=self.user,
            nationality='UG'
        )
        self.booking = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package
        )
        self.staff_user = Account.objects.create_user(
            phone='+256700000002',
            name='Staff User',
            password='testpass123',
            role='STAFF',
            is_staff=True
        )
    
    def test_payment_inherits_currency_from_booking(self):
        """Test that payment inherits currency from booking on creation."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount_minor_units=1000000,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=self.staff_user
        )
        self.assertEqual(payment.currency, self.currency)
        self.assertEqual(payment.currency.code, 'UGX')
    
    def test_payment_currency_str_representation(self):
        """Test payment string representation with currency."""
        payment = Payment.objects.create(
            booking=self.booking,
            amount_minor_units=1000000,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=self.staff_user
        )
        payment_str = str(payment)
        self.assertIn('UGX', payment_str)
        self.assertIn(self.booking.reference_number, payment_str)


class CurrencyAPITests(TestCase):
    """Test currency in API responses."""
    
    def setUp(self):
        """Set up test data and API client."""
        self.client = APIClient()
        self.currency, _ = Currency.objects.get_or_create(
            code='UGX',
            defaults={
                'name': 'Ugandan Shilling',
                'symbol': 'USh',
                'is_active': True
            }
        )
        self.trip = Trip.objects.create(
            name='Test Umrah Trip',
            code='TEST2025',
            trip_type='UMRAH',
            start_date=date.today() + timedelta(days=30),
            end_date=date.today() + timedelta(days=40)
        )
        self.package = TripPackage.objects.create(
            trip=self.trip,
            name='Gold Package',
            price_minor_units=5000000,
            currency=self.currency
        )
        self.user = Account.objects.create_user(
            phone='+256700000001',
            name='Test User',
            password='testpass123',
            role='PILGRIM'
        )
        self.pilgrim = PilgrimProfile.objects.create(
            user=self.user,
            nationality='UG'
        )
        self.booking = Booking.objects.create(
            pilgrim=self.pilgrim,
            package=self.package
        )
        self.staff_user = Account.objects.create_user(
            phone='+256700000002',
            name='Staff User',
            password='testpass123',
            role='STAFF',
            is_staff=True
        )
        
        # Authenticate as staff
        self.client.force_authenticate(user=self.staff_user)
    
    def test_booking_api_returns_currency_details(self):
        """Test that booking API returns full currency object."""
        url = f'/api/admin/bookings/{self.booking.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('currency', response.data)
        self.assertEqual(response.data['currency']['code'], 'UGX')
        self.assertEqual(response.data['currency']['name'], 'Ugandan Shilling')
        self.assertEqual(response.data['currency']['symbol'], 'USh')
    
    def test_package_api_returns_currency_details(self):
        """Test that package API returns full currency object."""
        url = f'/api/admin/packages/{self.package.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('currency', response.data)
        self.assertEqual(response.data['currency']['code'], 'UGX')


if __name__ == '__main__':
    pytest.main([__file__])

