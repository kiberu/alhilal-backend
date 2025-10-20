"""
Integration tests for complete user journeys.
"""
import pytest
from rest_framework import status
from django.utils import timezone


@pytest.mark.django_db
class TestPilgrimJourney:
    """Test complete pilgrim journey from OTP to accessing trip info."""
    
    def test_complete_pilgrim_flow(self, api_client, trip, trip_package, flight, hotel):
        """Test complete flow: OTP → JWT → Access API."""
        from apps.accounts.models import OTPCode
        from apps.pilgrims.models import Passport
        from apps.bookings.models import Booking
        from datetime import date, timedelta
        
        phone = "+256711111111"
        
        # Step 1: Request OTP
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': phone
        })
        assert response.status_code == status.HTTP_200_OK
        
        # Get OTP code from database
        otp = OTPCode.objects.get(phone=phone)
        
        # Step 2: Verify OTP
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': phone,
            'code': otp.code
        })
        assert response.status_code == status.HTTP_200_OK
        access_token = response.data['access']
        user_id = response.data['user']['id']
        
        # Step 3: Access profile (should be created)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = api_client.get('/api/v1/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['phone'] == phone
        
        # Step 4: Create passport via admin (simulated)
        from django.contrib.auth import get_user_model
        user = get_user_model().objects.get(id=user_id)
        passport = Passport.objects.create(
            pilgrim=user.pilgrim_profile,
            number="PP8888888",
            country="UG",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        # Step 5: Create booking via admin (simulated)
        booking = Booking.objects.create(
            pilgrim=user.pilgrim_profile,
            package=trip_package,
            status="BOOKED"
        )
        
        # Step 6: Check bookings
        response = api_client.get('/api/v1/me/bookings/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        
        # Step 7: List trips (should see the trip now)
        response = api_client.get('/api/v1/trips/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        
        # Step 8: Get trip details
        response = api_client.get(f'/api/v1/trips/{trip.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == trip.code
        
        # Step 9: Get package details
        response = api_client.get(f'/api/v1/packages/{trip_package.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['flights']) == 1
        assert len(response.data['hotels']) == 1
        
        # Step 10: Get duas
        from apps.content.models import Dua
        Dua.objects.create(
            category="TAWAF",
            text_ar="Test",
            text_en="Test"
        )
        
        response = api_client.get('/api/v1/duas/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1


@pytest.mark.django_db
class TestBookingValidation:
    """Test booking validation flow."""
    
    def test_cannot_book_without_valid_passport(self, trip_package):
        """Test that booking fails without valid passport."""
        from django.contrib.auth import get_user_model
        from apps.accounts.models import PilgrimProfile
        from apps.bookings.models import Booking
        from django.core.exceptions import ValidationError
        
        # Create user without passport
        user = get_user_model().objects.create_user(
            phone="+256722222222",
            name="No Passport User",
            role="PILGRIM"
        )
        profile = PilgrimProfile.objects.create(user=user)
        
        # Try to create booking
        booking = Booking(
            pilgrim=profile,
            package=trip_package,
            status="BOOKED"
        )
        
        with pytest.raises(ValidationError):
            booking.clean()
    
    def test_cannot_book_beyond_capacity(self, trip_package, pilgrim_user, passport):
        """Test that booking respects package capacity."""
        from apps.bookings.models import Booking
        from django.core.exceptions import ValidationError
        
        # Set capacity to 1
        trip_package.capacity = 1
        trip_package.save()
        
        # Create first booking
        Booking.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            package=trip_package,
            status="BOOKED"
        )
        
        # Try to create second booking
        from django.contrib.auth import get_user_model
        from apps.accounts.models import PilgrimProfile
        from apps.pilgrims.models import Passport
        from datetime import date, timedelta
        
        user2 = get_user_model().objects.create_user(
            phone="+256733333333",
            name="Second User",
            role="PILGRIM"
        )
        profile2 = PilgrimProfile.objects.create(user=user2)
        Passport.objects.create(
            pilgrim=profile2,
            number="QQ6666666",
            country="UG",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        booking2 = Booking(
            pilgrim=profile2,
            package=trip_package,
            status="BOOKED"
        )
        
        with pytest.raises(ValidationError):
            booking2.clean()

