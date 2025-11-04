"""
Unit tests for Payment API endpoints.
"""
import pytest
from datetime import date, timedelta
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.bookings.models import Booking, Payment
from apps.accounts.models import Account, PilgrimProfile
from apps.trips.models import Trip, TripPackage
from apps.common.models import Currency


@pytest.fixture
def api_client():
    """Return API client."""
    return APIClient()


@pytest.fixture
def staff_user(db):
    """Create a staff user."""
    user = Account.objects.create_user(
        phone="+256700000001",
        name="Staff User",
        password="testpass123",
        role="STAFF"
    )
    user.is_staff = True
    user.save()
    return user


@pytest.fixture
def pilgrim_user(db):
    """Create a pilgrim user with profile."""
    user = Account.objects.create_user(
        phone="+256700000002",
        name="Test Pilgrim",
        password="testpass123",
        role="PILGRIM"
    )
    PilgrimProfile.objects.create(
        user=user,
        dob=date(1990, 1, 1),
        nationality="UG"
    )
    return user


@pytest.fixture
def trip(db):
    """Create a test trip."""
    return Trip.objects.create(
        code="HAJJ2025",
        name="Hajj 2025",
        cities="Makkah, Madinah",
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=60),
        visibility="PUBLIC"
    )


@pytest.fixture
def currency_usd(db):
    """Create or get USD currency."""
    currency, _ = Currency.objects.get_or_create(
        code="USD",
        defaults={'name': 'US Dollar', 'symbol': '$'}
    )
    return currency


@pytest.fixture
def package(db, trip, currency_usd):
    """Create a test package."""
    return TripPackage.objects.create(
        trip=trip,
        name="Economy Package",
        price_minor_units=500000,  # $5,000.00
        currency=currency_usd,
        capacity=50,
        visibility="PUBLIC"
    )


@pytest.fixture
def booking(db, pilgrim_user, package, currency_usd):
    """Create a test booking."""
    return Booking.objects.create(
        pilgrim=pilgrim_user.pilgrim_profile,
        package=package,
        status="BOOKED",
        currency=currency_usd
    )


@pytest.mark.django_db
class TestPaymentRecording:
    """Tests for recording payments."""
    
    def test_record_payment_success(self, api_client, staff_user, booking):
        """Test successfully recording a payment."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 150000,  # $1,500.00
            'currency': 'USD',
            'payment_method': 'BANK_TRANSFER',
            'payment_date': date.today().isoformat(),
            'reference_number': 'TXN-12345',
            'notes': 'First installment'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['amount_minor_units'] == 150000
        assert response.data['payment_method'] == 'BANK_TRANSFER'
        assert response.data['reference_number'] == 'TXN-12345'
        assert response.data['recorded_by'] == str(staff_user.id)
        
        # Verify payment was created
        assert Payment.objects.filter(booking=booking).count() == 1
        
        # Verify booking payment status was updated
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 150000
        assert booking.payment_status == 'PARTIAL'
    
    def test_record_full_payment(self, api_client, staff_user, booking):
        """Test recording a full payment updates status to PAID."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 500000,  # Full amount
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify booking payment status is PAID
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 500000
        assert booking.payment_status == 'PAID'
    
    def test_record_multiple_payments(self, api_client, staff_user, booking):
        """Test recording multiple payments accumulates correctly."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        
        # First payment
        data1 = {
            'amount_minor_units': 200000,
            'currency': 'USD',
            'payment_method': 'BANK_TRANSFER',
            'payment_date': date.today().isoformat(),
        }
        response1 = api_client.post(url, data1, format='json')
        assert response1.status_code == status.HTTP_201_CREATED
        
        # Second payment
        data2 = {
            'amount_minor_units': 150000,
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        response2 = api_client.post(url, data2, format='json')
        assert response2.status_code == status.HTTP_201_CREATED
        
        # Verify total
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 350000
        assert booking.payment_status == 'PARTIAL'
        assert Payment.objects.filter(booking=booking).count() == 2
    
    def test_record_payment_requires_staff(self, api_client, pilgrim_user, booking):
        """Test that non-staff users cannot record payments."""
        api_client.force_authenticate(user=pilgrim_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 150000,
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Payment.objects.filter(booking=booking).count() == 0
    
    def test_record_payment_requires_authentication(self, api_client, booking):
        """Test that unauthenticated users cannot record payments."""
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 150000,
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_record_payment_invalid_amount(self, api_client, staff_user, booking):
        """Test recording payment with invalid amount."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': -100,  # Negative amount
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        
        response = api_client.post(url, data, format='json')
        
        # Should fail validation
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_record_payment_missing_required_fields(self, api_client, staff_user, booking):
        """Test recording payment without required fields."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 150000,
            # Missing payment_method and payment_date
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'payment_method' in str(response.data) or 'payment_date' in str(response.data)
    
    def test_record_payment_sets_recorded_by_automatically(self, api_client, staff_user, booking):
        """Test that recorded_by is automatically set to current user."""
        api_client.force_authenticate(user=staff_user)
        
        url = reverse('api:admin-booking-add-payment', kwargs={'pk': booking.id})
        data = {
            'amount_minor_units': 150000,
            'currency': 'USD',
            'payment_method': 'CASH',
            'payment_date': date.today().isoformat(),
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        
        payment = Payment.objects.get(id=response.data['id'])
        assert payment.recorded_by == staff_user


@pytest.mark.django_db
class TestPaymentListing:
    """Tests for listing payments."""
    
    def test_list_payments_success(self, api_client, staff_user, booking, currency_usd):
        """Test successfully listing payments for a booking."""
        # Create some payments
        Payment.objects.create(
            booking=booking,
            amount_minor_units=200000,
            currency=currency_usd,
            payment_method='BANK_TRANSFER',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        Payment.objects.create(
            booking=booking,
            amount_minor_units=150000,
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        api_client.force_authenticate(user=staff_user)
        url = reverse('api:admin-booking-list-payments', kwargs={'pk': booking.id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['payments']) == 2
        assert response.data['total_paid'] == 350000
        assert response.data['package_price'] == 500000
        assert response.data['balance'] == 150000
    
    def test_list_payments_empty(self, api_client, staff_user, booking):
        """Test listing payments when there are none."""
        api_client.force_authenticate(user=staff_user)
        url = reverse('api:admin-booking-list-payments', kwargs={'pk': booking.id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['payments']) == 0
        assert response.data['total_paid'] == 0
        assert response.data['balance'] == 500000
    
    def test_list_payments_requires_staff(self, api_client, pilgrim_user, booking):
        """Test that non-staff users cannot list payments."""
        api_client.force_authenticate(user=pilgrim_user)
        url = reverse('api:admin-booking-list-payments', kwargs={'pk': booking.id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_list_payments_includes_payment_details(self, api_client, staff_user, booking, currency_usd):
        """Test that payment list includes all necessary details."""
        payment = Payment.objects.create(
            booking=booking,
            amount_minor_units=200000,
            currency=currency_usd,
            payment_method='BANK_TRANSFER',
            payment_date=date.today(),
            reference_number='TXN-001',
            notes='Initial payment',
            recorded_by=staff_user
        )
        
        api_client.force_authenticate(user=staff_user)
        url = reverse('api:admin-booking-list-payments', kwargs={'pk': booking.id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        payment_data = response.data['payments'][0]
        assert payment_data['id'] == str(payment.id)
        assert payment_data['amount_minor_units'] == 200000
        assert payment_data['payment_method'] == 'BANK_TRANSFER'
        assert payment_data['reference_number'] == 'TXN-001'
        assert payment_data['notes'] == 'Initial payment'
        assert payment_data['recorded_by_name'] == staff_user.name


@pytest.mark.django_db
class TestBookingDetailWithPayments:
    """Tests for booking detail endpoint including payments."""
    
    def test_booking_detail_includes_payments(self, api_client, staff_user, booking, currency_usd):
        """Test that booking detail includes payment history."""
        # Create a payment
        Payment.objects.create(
            booking=booking,
            amount_minor_units=200000,
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        api_client.force_authenticate(user=staff_user)
        url = reverse('api:admin-booking-detail', kwargs={'pk': booking.id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'payments' in response.data
        assert len(response.data['payments']) == 1
        assert response.data['amount_paid_minor_units'] == 200000
        assert response.data['payment_status'] == 'PARTIAL'


@pytest.mark.django_db
class TestPaymentModel:
    """Tests for Payment model behavior."""
    
    def test_payment_creation_updates_booking(self, staff_user, booking, currency_usd):
        """Test that creating a payment updates booking totals."""
        assert booking.amount_paid_minor_units == 0
        assert booking.payment_status == 'PENDING'
        
        Payment.objects.create(
            booking=booking,
            amount_minor_units=100000,
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 100000
        assert booking.payment_status == 'PARTIAL'
    
    def test_payment_deletion_updates_booking(self, staff_user, booking, currency_usd):
        """Test that deleting a payment updates booking totals."""
        payment = Payment.objects.create(
            booking=booking,
            amount_minor_units=100000,
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 100000
        
        payment.delete()
        
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 0
        assert booking.payment_status == 'PENDING'
    
    def test_payment_str_representation(self, staff_user, booking, currency_usd):
        """Test payment string representation."""
        payment = Payment.objects.create(
            booking=booking,
            amount_minor_units=150000,
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        assert booking.reference_number in str(payment)
        assert 'USD 1500.00' in str(payment)
    
    def test_overpayment_status(self, staff_user, booking, currency_usd):
        """Test payment status when payment exceeds package price."""
        Payment.objects.create(
            booking=booking,
            amount_minor_units=600000,  # More than package price
            currency=currency_usd,
            payment_method='CASH',
            payment_date=date.today(),
            recorded_by=staff_user
        )
        
        booking.refresh_from_db()
        assert booking.amount_paid_minor_units == 600000
        assert booking.payment_status == 'PAID'  # Should be PAID, not overpaid

