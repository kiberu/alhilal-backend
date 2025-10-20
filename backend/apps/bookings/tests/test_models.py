"""
Tests for bookings models.
"""
import pytest
from django.core.exceptions import ValidationError
from apps.bookings.models import Booking
from datetime import date, timedelta


@pytest.mark.django_db
class TestBookingModel:
    """Tests for Booking model."""
    
    def test_create_booking(self, booking):
        """Test creating a booking."""
        assert booking.status == "BOOKED"
        assert booking.pilgrim is not None
        assert booking.package is not None
    
    def test_booking_requires_valid_passport(self, pilgrim_user, trip_package):
        """Test that BOOKED status requires valid passport."""
        # Try to book without passport
        booking = Booking(
            pilgrim=pilgrim_user.pilgrim_profile,
            package=trip_package,
            status="BOOKED"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            booking.clean()
        
        assert "passport" in str(exc_info.value).lower()
    
    def test_booking_checks_passport_expiry(self, pilgrim_user, trip_package):
        """Test that booking checks passport expiry against trip dates."""
        from apps.pilgrims.models import Passport
        
        # Create expired passport
        Passport.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            number="XX9999999",
            country="UG",
            expiry_date=date.today() - timedelta(days=1)  # Expired
        )
        
        booking = Booking(
            pilgrim=pilgrim_user.pilgrim_profile,
            package=trip_package,
            status="BOOKED"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            booking.clean()
        
        assert "expires" in str(exc_info.value).lower()
    
    def test_booking_checks_capacity(self, pilgrim_user, trip_package, passport):
        """Test that booking checks package capacity."""
        # Set low capacity
        trip_package.capacity = 1
        trip_package.save()
        
        # Create first booking
        Booking.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            package=trip_package,
            status="BOOKED"
        )
        
        # Try to create second booking (should fail)
        from django.contrib.auth import get_user_model
        from apps.accounts.models import PilgrimProfile
        from apps.pilgrims.models import Passport
        
        user2 = get_user_model().objects.create_user(
            phone="+256700000002",
            name="Pilgrim 2",
            role="PILGRIM"
        )
        profile2 = PilgrimProfile.objects.create(user=user2)
        Passport.objects.create(
            pilgrim=profile2,
            number="YY8888888",
            country="UG",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        booking2 = Booking(
            pilgrim=profile2,
            package=trip_package,
            status="BOOKED"
        )
        
        with pytest.raises(ValidationError) as exc_info:
            booking2.clean()
        
        assert "capacity" in str(exc_info.value).lower()
    
    def test_booking_eoi_no_validation(self, pilgrim_user, trip_package):
        """Test that EOI status doesn't require validation."""
        # EOI without passport should work
        booking = Booking.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            package=trip_package,
            status="EOI"
        )
        
        assert booking.status == "EOI"
    
    def test_booking_str(self, booking):
        """Test booking string representation."""
        assert "Test Pilgrim" in str(booking)
        assert "UMRAH2025" in str(booking)
        assert "BOOKED" in str(booking)
    
    def test_booking_history(self, booking):
        """Test booking audit trail."""
        # Update booking
        booking.status = "CANCELLED"
        booking.save()
        
        # Check history
        history = booking.history.all()
        assert history.count() >= 1
    
    def test_unique_active_booking_constraint(self, booking):
        """Test that a pilgrim can't have duplicate active bookings."""
        # Try to create duplicate active booking
        duplicate_booking = Booking(
            pilgrim=booking.pilgrim,
            package=booking.package,
            status="BOOKED"
        )
        
        with pytest.raises(Exception):  # IntegrityError from database constraint
            duplicate_booking.save()

