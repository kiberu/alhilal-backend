"""
Tests for API authentication (OTP + JWT).
"""
import pytest
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.accounts.models import OTPCode
from django.utils import timezone
from datetime import timedelta

Account = get_user_model()


@pytest.mark.django_db
class TestOTPRequest:
    """Tests for OTP request endpoint."""
    
    def test_request_otp_success(self, api_client):
        """Test successful OTP request."""
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256712345678'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['sent'] is True
        assert 'expires_in' in response.data
        
        # Check OTP was created
        otp = OTPCode.objects.filter(phone='+256712345678').first()
        assert otp is not None
        assert len(otp.code) == 6
    
    def test_request_otp_invalid_phone(self, api_client):
        """Test OTP request with invalid phone."""
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '12345'  # No country code
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_request_otp_rate_limiting(self, api_client):
        """Test OTP rate limiting."""
        # First request
        response1 = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256700000001'
        })
        assert response1.status_code == status.HTTP_200_OK
        
        # Immediate second request (within 60 seconds)
        response2 = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256700000001'
        })
        assert response2.status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
class TestOTPVerify:
    """Tests for OTP verification endpoint."""
    
    def test_verify_otp_success(self, api_client, otp_code):
        """Test successful OTP verification."""
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'code': '123456'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['phone'] == '+256712345678'
        
        # Check OTP was consumed
        otp_code.refresh_from_db()
        assert otp_code.consumed_at is not None
        
        # Check user was created
        user = Account.objects.get(phone='+256712345678')
        assert user.role == 'PILGRIM'
    
    def test_verify_otp_creates_pilgrim_profile(self, api_client, otp_code):
        """Test that OTP verification creates pilgrim profile."""
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'code': '123456'
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        user = Account.objects.get(phone='+256712345678')
        assert hasattr(user, 'pilgrim_profile')
    
    def test_verify_otp_invalid_code(self, api_client, otp_code):
        """Test OTP verification with wrong code."""
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'code': '999999'  # Wrong code
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
        
        # Check attempts were incremented
        otp_code.refresh_from_db()
        assert otp_code.attempts == 1
    
    def test_verify_otp_expired(self, api_client):
        """Test OTP verification with expired code."""
        # Create expired OTP
        OTPCode.objects.create(
            phone='+256700000002',
            code='111111',
            expires_at=timezone.now() - timedelta(minutes=1),
            attempts=0
        )
        
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256700000002',
            'code': '111111'
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_verify_otp_max_attempts(self, api_client, otp_code):
        """Test OTP verification with max attempts exceeded."""
        # Set attempts to max
        otp_code.attempts = 5
        otp_code.save()
        
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'code': '123456'
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'MAX_ATTEMPTS' in response.data['error']['code']
    
    def test_verify_otp_existing_user(self, api_client, pilgrim_user):
        """Test OTP verification for existing user."""
        # Create OTP for existing user
        otp = OTPCode.objects.create(
            phone=pilgrim_user.phone,
            code='654321',
            expires_at=timezone.now() + timedelta(minutes=10),
            attempts=0
        )
        
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': pilgrim_user.phone,
            'code': '654321'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user']['id'] == str(pilgrim_user.id)


@pytest.mark.django_db
class TestJWTRefresh:
    """Tests for JWT token refresh."""
    
    def test_refresh_token(self, api_client, pilgrim_tokens):
        """Test refreshing JWT token."""
        response = api_client.post('/api/v1/auth/refresh/', {
            'refresh': pilgrim_tokens['refresh']
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
    
    def test_refresh_invalid_token(self, api_client):
        """Test refreshing with invalid token."""
        response = api_client.post('/api/v1/auth/refresh/', {
            'refresh': 'invalid-token'
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

