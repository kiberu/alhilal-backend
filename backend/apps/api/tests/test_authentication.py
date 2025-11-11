"""
Tests for API authentication (OTP + JWT).
"""
import pytest
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, MagicMock

from apps.accounts.models import OTPCode

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
    
    @patch('africastalking.SMS.send')
    def test_sms_enabled_success(self, mock_sms_send, api_client, settings):
        """Test OTP request with SMS enabled - successful send."""
        settings.SMS_ENABLED = True
        
        # Mock successful SMS response
        mock_sms_send.return_value = {
            'SMSMessageData': {
                'Recipients': [
                    {'status': 'Success', 'number': '+256712345678'}
                ]
            }
        }
        
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256712345678'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['sent'] is True
        assert 'otp' not in response.data  # OTP should not be in response in production
        assert mock_sms_send.called
    
    @patch('africastalking.SMS.send')
    def test_sms_enabled_failure(self, mock_sms_send, api_client, settings):
        """Test OTP request with SMS enabled - failed send."""
        settings.SMS_ENABLED = True
        
        # Mock failed SMS response
        mock_sms_send.return_value = {
            'SMSMessageData': {
                'Recipients': [
                    {'status': 'Failed', 'number': '+256712345678'}
                ]
            }
        }
        
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256712345678'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['sent'] is True  # OTP still created in DB
        assert 'sms_warning' in response.data  # Warning about SMS failure
        
        # OTP should still be in database
        otp = OTPCode.objects.filter(phone='+256712345678').first()
        assert otp is not None
    
    @patch('africastalking.SMS.send')
    def test_sms_enabled_exception(self, mock_sms_send, api_client, settings):
        """Test OTP request with SMS enabled - exception during send."""
        settings.SMS_ENABLED = True
        
        # Mock exception
        mock_sms_send.side_effect = Exception("Network error")
        
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256712345678'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['sent'] is True  # OTP still created in DB
        assert 'sms_warning' in response.data
        
        # OTP should still be in database
        otp = OTPCode.objects.filter(phone='+256712345678').first()
        assert otp is not None
    
    def test_sms_disabled_development(self, api_client, settings):
        """Test OTP request with SMS disabled (development mode)."""
        settings.SMS_ENABLED = False
        settings.DEBUG = True
        
        response = api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256712345678'
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['sent'] is True
        assert 'otp' in response.data  # OTP included for development
        assert 'dev_note' in response.data
        
        # Verify OTP is valid
        otp_code = response.data['otp']
        assert len(otp_code) == 6
        assert otp_code.isdigit()


@pytest.mark.django_db
class TestOTPVerify:
    """Tests for OTP verification endpoint."""
    
    def test_verify_otp_success(self, api_client, otp_code):
        """Test successful OTP verification."""
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'otp': '123456'
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
            'otp': '123456'
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        user = Account.objects.get(phone='+256712345678')
        assert hasattr(user, 'pilgrim_profile')
    
    def test_verify_otp_invalid_code(self, api_client, otp_code):
        """Test OTP verification with wrong code."""
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'otp': '999999'  # Wrong code
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
            'otp': '111111'
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_verify_otp_max_attempts(self, api_client, otp_code):
        """Test OTP verification with max attempts exceeded."""
        # Set attempts to max
        otp_code.attempts = 5
        otp_code.save()
        
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256712345678',
            'otp': '123456'
        })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Maximum' in response.data['error']
    
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
            'otp': '654321'
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

