"""
Tests for accounts models.
"""
import pytest
from django.contrib.auth import get_user_model
from apps.accounts.models import PilgrimProfile, StaffProfile, OTPCode
from datetime import date, timedelta
from django.utils import timezone

Account = get_user_model()


@pytest.mark.django_db
class TestAccountModel:
    """Tests for Account model."""
    
    def test_create_pilgrim_account(self):
        """Test creating a pilgrim account."""
        account = Account.objects.create_user(
            phone="+256712345678",
            name="Test Pilgrim",
            role="PILGRIM"
        )
        
        assert account.phone == "+256712345678"
        assert account.name == "Test Pilgrim"
        assert account.role == "PILGRIM"
        assert account.is_active is True
        assert account.is_staff is False
    
    def test_create_staff_account(self):
        """Test creating a staff account."""
        account = Account.objects.create_user(
            phone="+256700000001",
            name="Test Staff",
            role="STAFF",
            password="testpass"
        )
        account.is_staff = True
        account.save()
        
        assert account.role == "STAFF"
        assert account.is_staff is True
        assert account.check_password("testpass")
    
    def test_account_str(self):
        """Test account string representation."""
        account = Account.objects.create_user(
            phone="+256712345678",
            name="Test User",
            role="PILGRIM"
        )
        assert str(account) == "Test User (+256712345678)"
    
    def test_unique_phone_constraint(self):
        """Test that phone numbers must be unique."""
        Account.objects.create_user(
            phone="+256712345678",
            name="User 1",
            role="PILGRIM"
        )
        
        with pytest.raises(Exception):  # IntegrityError
            Account.objects.create_user(
                phone="+256712345678",
                name="User 2",
                role="PILGRIM"
            )


@pytest.mark.django_db
class TestPilgrimProfile:
    """Tests for PilgrimProfile model."""
    
    def test_create_pilgrim_profile(self, pilgrim_user):
        """Test creating a pilgrim profile."""
        profile = pilgrim_user.pilgrim_profile
        
        assert profile.user == pilgrim_user
        assert profile.dob == date(1990, 1, 1)
        assert profile.nationality == "UG"
        assert profile.emergency_name == "Emergency Contact"
    
    def test_pilgrim_profile_str(self, pilgrim_user):
        """Test pilgrim profile string representation."""
        profile = pilgrim_user.pilgrim_profile
        assert str(profile) == "Test Pilgrim"
    
    def test_pilgrim_profile_history(self, pilgrim_user):
        """Test that pilgrim profile has audit trail."""
        profile = pilgrim_user.pilgrim_profile
        
        # Update profile
        profile.nationality = "KE"
        profile.save()
        
        # Check history
        history = profile.history.all()
        assert history.count() >= 1


@pytest.mark.django_db
class TestStaffProfile:
    """Tests for StaffProfile model."""
    
    def test_create_staff_profile(self, staff_user):
        """Test creating a staff profile."""
        profile = staff_user.staff_profile
        
        assert profile.user == staff_user
        assert profile.role == "ADMIN"
    
    def test_staff_profile_str(self, staff_user):
        """Test staff profile string representation."""
        profile = staff_user.staff_profile
        assert str(profile) == "Test Staff - ADMIN"


@pytest.mark.django_db
class TestOTPCode:
    """Tests for OTPCode model."""
    
    def test_create_otp_code(self, otp_code):
        """Test creating an OTP code."""
        assert otp_code.phone == "+256712345678"
        assert otp_code.code == "123456"
        assert otp_code.attempts == 0
        assert otp_code.consumed_at is None
    
    def test_otp_expiry(self):
        """Test OTP expiry check."""
        # Expired OTP
        expired_otp = OTPCode.objects.create(
            phone="+256700000000",
            code="999999",
            expires_at=timezone.now() - timedelta(minutes=1),
            attempts=0
        )
        
        assert expired_otp.expires_at < timezone.now()
    
    def test_otp_consumption(self, otp_code):
        """Test marking OTP as consumed."""
        assert otp_code.consumed_at is None
        
        otp_code.consumed_at = timezone.now()
        otp_code.save()
        
        assert otp_code.consumed_at is not None
    
    def test_otp_attempts(self, otp_code):
        """Test incrementing OTP attempts."""
        assert otp_code.attempts == 0
        
        otp_code.attempts += 1
        otp_code.save()
        
        assert otp_code.attempts == 1

