"""
Pytest configuration and fixtures for the Alhilal project.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.api.auth.tokens import RoleBasedRefreshToken
from datetime import date, datetime, timedelta
from django.utils import timezone

Account = get_user_model()


@pytest.fixture
def api_client():
    """Return an API client for testing."""
    return APIClient()


@pytest.fixture
def pilgrim_user(db):
    """Create a pilgrim user."""
    from apps.accounts.models import PilgrimProfile
    
    user = Account.objects.create_user(
        phone="+256712345678",
        name="Test Pilgrim",
        role="PILGRIM",
        password="testpass123"
    )
    PilgrimProfile.objects.create(
        user=user,
        full_name="Test Pilgrim",
        phone=user.phone,
        passport_number="AB1234567",
        dob=date(1990, 1, 1),
        nationality="UG",
        emergency_name="Emergency Contact",
        emergency_phone="+256712345679"
    )
    return user


@pytest.fixture
def staff_user(db):
    """Create a staff user."""
    from apps.accounts.models import StaffProfile

    def create_staff(phone, name, role):
        user = Account.objects.create_user(
            phone=phone,
            name=name,
            role="STAFF",
            password="staffpass123"
        )
        user.is_staff = True
        user.save()

        StaffProfile.objects.create(
            user=user,
            role=role
        )
        return user

    return create_staff("+256700000001", "Test Staff", "ADMIN")


@pytest.fixture
def agent_user(db):
    """Create an agent-role staff user."""
    from apps.accounts.models import StaffProfile

    user = Account.objects.create_user(
        phone="+256700000005",
        name="Test Agent",
        role="STAFF",
        password="staffpass123"
    )
    user.is_staff = True
    user.save()

    StaffProfile.objects.create(user=user, role="AGENT")
    return user


@pytest.fixture
def auditor_user(db):
    """Create an auditor-role staff user."""
    from apps.accounts.models import StaffProfile

    user = Account.objects.create_user(
        phone="+256700000006",
        name="Test Auditor",
        role="STAFF",
        password="staffpass123"
    )
    user.is_staff = True
    user.save()

    StaffProfile.objects.create(user=user, role="AUDITOR")
    return user


@pytest.fixture
def pilgrim_tokens(pilgrim_user):
    """Generate JWT tokens for pilgrim user with long expiration."""
    refresh = RoleBasedRefreshToken.for_user(pilgrim_user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }


@pytest.fixture
def authenticated_client(api_client, pilgrim_tokens):
    """Return an authenticated API client."""
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {pilgrim_tokens['access']}")
    return api_client


@pytest.fixture
def trip(db):
    """Create a test trip."""
    from apps.trips.models import Trip
    
    return Trip.objects.create(
        code="UMRAH2025",
        name="Umrah 2025 - May",
        cities=["Makkah", "Madinah"],
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=45),
        visibility="PUBLIC"
    )


@pytest.fixture
def currency_ugx(db):
    """Create or get UGX currency."""
    from apps.common.models import Currency
    
    currency, _ = Currency.objects.get_or_create(
        code="UGX",
        defaults={
            "name": "Ugandan Shilling",
            "symbol": "USh"
        }
    )
    return currency


@pytest.fixture
def currency_usd(db):
    """Create or get USD currency."""
    from apps.common.models import Currency
    
    currency, _ = Currency.objects.get_or_create(
        code="USD",
        defaults={
            "name": "US Dollar",
            "symbol": "$"
        }
    )
    return currency


@pytest.fixture
def currency_sar(db):
    """Create or get SAR currency."""
    from apps.common.models import Currency
    
    currency, _ = Currency.objects.get_or_create(
        code="SAR",
        defaults={
            "name": "Saudi Riyal",
            "symbol": "﷼"
        }
    )
    return currency


@pytest.fixture
def trip_package(trip, currency_ugx):
    """Create a test trip package."""
    from apps.trips.models import TripPackage
    
    return TripPackage.objects.create(
        trip=trip,
        name="Gold",
        price_minor_units=500000,
        currency=currency_ugx,
        capacity=50,
        visibility="PUBLIC"
    )


@pytest.fixture
def pilgrim(pilgrim_user):
    """Return the default authenticated pilgrim profile."""
    return pilgrim_user.pilgrim_profile


@pytest.fixture
def other_pilgrim(db):
    """Create a second pilgrim profile for data-scoping tests."""
    from apps.accounts.models import PilgrimProfile

    user = Account.objects.create_user(
        phone="+256799999999",
        name="Other Pilgrim",
        role="PILGRIM",
        password="testpass123"
    )
    return PilgrimProfile.objects.create(
        user=user,
        full_name="Other Pilgrim",
        phone=user.phone,
        passport_number="ZZ7777777",
        nationality="KE"
    )


@pytest.fixture
def staff_pilgrim_profile(staff_user):
    """Create a pilgrim profile for a staff user when needed."""
    from apps.accounts.models import PilgrimProfile

    profile, _ = PilgrimProfile.objects.get_or_create(
        user=staff_user,
        defaults={
            "full_name": staff_user.name,
            "phone": staff_user.phone,
            "passport_number": "ST1234567",
            "nationality": "UG",
        }
    )
    return profile


@pytest.fixture
def passport(pilgrim):
    """Create a passport document for the default pilgrim."""
    from apps.pilgrims.models import Document

    return Document.objects.create(
        pilgrim=pilgrim,
        document_type="PASSPORT",
        title="Passport - Uganda",
        document_number="AB1234567",
        issuing_country="UG",
        file_public_id="documents/passport_123",
        expiry_date=date.today() + timedelta(days=365)
    )


@pytest.fixture
def booking(pilgrim_user, trip_package, passport):
    """Create a test booking."""
    from apps.bookings.models import Booking
    
    return Booking.objects.create(
        pilgrim=pilgrim_user.pilgrim_profile,
        package=trip_package,
        status="BOOKED"
    )


@pytest.fixture
def visa(pilgrim_user, trip):
    """Create a test visa document."""
    from apps.pilgrims.models import Document
    
    return Document.objects.create(
        pilgrim=pilgrim_user.pilgrim_profile,
        document_type="VISA",
        title=f"Visa - {trip.name}",
        document_number="VISA-123",
        file_public_id="documents/visa_123",
        trip=trip,
        status="PENDING"
    )


@pytest.fixture
def otp_code(db):
    """Create a test OTP code."""
    from apps.accounts.models import OTPCode
    
    return OTPCode.objects.create(
        phone="+256712345678",
        code="123456",
        expires_at=timezone.now() + timedelta(minutes=10),
        attempts=0
    )


@pytest.fixture
def settings():
    """Provide access to Django settings for test mocking."""
    from django.conf import settings
    return settings


@pytest.fixture
def flight(trip_package):
    """Create a test flight."""
    from apps.trips.models import PackageFlight
    
    trip = trip_package.trip
    return PackageFlight.objects.create(
        package=trip_package,
        leg="OUTBOUND",
        carrier="EK",
        flight_no="EK730",
        dep_airport="EBB",
        dep_dt=timezone.make_aware(datetime.combine(trip.start_date, datetime.min.time())),
        arr_airport="DXB",
        arr_dt=timezone.make_aware(datetime.combine(trip.start_date, datetime.min.time())) + timedelta(hours=6)
    )


@pytest.fixture
def hotel(trip_package):
    """Create a test hotel."""
    from apps.trips.models import PackageHotel
    
    trip = trip_package.trip
    return PackageHotel.objects.create(
        package=trip_package,
        name="Hilton Makkah",
        address="Near Haram, Makkah",
        room_type="Standard",
        check_in=trip.start_date,
        check_out=trip.end_date
    )


@pytest.fixture
def dua(db):
    """Create a test dua."""
    from apps.content.models import Dua
    
    return Dua.objects.create(
        category="TAWAF",
        text_ar="سبحان الله",
        text_en="Glory be to Allah",
        transliteration="Subhan Allah"
    )
