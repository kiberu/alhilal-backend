"""
Tests for profile update endpoint.
"""
import pytest
from rest_framework import status
from django.contrib.auth import get_user_model

Account = get_user_model()


@pytest.mark.django_db
class TestUpdateProfile:
    """Tests for profile update endpoint."""
    
    def test_update_profile_success(self, authenticated_client, pilgrim_user):
        """Test successful profile update."""
        response = authenticated_client.put('/api/v1/profile/update/', {
            'full_name': 'John Doe Updated',
            'dob': '1990-01-15',
            'gender': 'MALE',
            'nationality': 'UG',
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'data' in response.data
        
        # Verify profile was updated
        pilgrim_user.refresh_from_db()
        assert pilgrim_user.name == 'John Doe Updated'
        assert pilgrim_user.pilgrim_profile.full_name == 'John Doe Updated'
        assert str(pilgrim_user.pilgrim_profile.dob) == '1990-01-15'
        assert pilgrim_user.pilgrim_profile.gender == 'MALE'
        assert pilgrim_user.pilgrim_profile.nationality == 'UG'
    
    def test_update_profile_partial_update(self, authenticated_client, pilgrim_user):
        """Test partial profile update (only some fields)."""
        original_name = pilgrim_user.name
        
        response = authenticated_client.put('/api/v1/profile/update/', {
            'dob': '1995-05-20',
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify only DOB was updated
        pilgrim_user.refresh_from_db()
        assert str(pilgrim_user.pilgrim_profile.dob) == '1995-05-20'
        assert pilgrim_user.name == original_name  # Name unchanged
    
    def test_update_profile_with_passport(self, authenticated_client, pilgrim_user):
        """Test profile update with passport number."""
        response = authenticated_client.put('/api/v1/profile/update/', {
            'full_name': 'Jane Smith',
            'passport_number': 'A12345678',
            'nationality': 'KE',
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        pilgrim_user.refresh_from_db()
        assert pilgrim_user.pilgrim_profile.full_name == 'Jane Smith'
        assert pilgrim_user.pilgrim_profile.passport_number == 'A12345678'
        assert pilgrim_user.pilgrim_profile.nationality == 'KE'
    
    def test_update_profile_with_emergency_contact(self, authenticated_client, pilgrim_user):
        """Test profile update with emergency contact info."""
        response = authenticated_client.put('/api/v1/profile/update/', {
            'emergency_name': 'Emergency Contact',
            'emergency_phone': '+256700123456',
            'emergency_relationship': 'Spouse',
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        pilgrim_user.refresh_from_db()
        profile = pilgrim_user.pilgrim_profile
        assert profile.emergency_name == 'Emergency Contact'
        assert profile.emergency_phone == '+256700123456'
        assert profile.emergency_relationship == 'Spouse'
    
    def test_update_profile_with_address(self, authenticated_client, pilgrim_user):
        """Test profile update with address."""
        response = authenticated_client.put('/api/v1/profile/update/', {
            'address': '123 Main Street, Kampala, Uganda',
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        pilgrim_user.refresh_from_db()
        assert pilgrim_user.pilgrim_profile.address == '123 Main Street, Kampala, Uganda'
    
    def test_update_profile_unauthenticated(self, api_client):
        """Test profile update without authentication."""
        response = api_client.put('/api/v1/profile/update/', {
            'full_name': 'Test User',
        })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_profile_staff_user_denied(self, api_client, staff_user):
        """Test that staff users cannot update pilgrim profile."""
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        
        response = api_client.put('/api/v1/profile/update/', {
            'full_name': 'Test User',
        })
        
        # Staff users don't have pilgrim_profile, so should be denied
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_profile_empty_request(self, authenticated_client, pilgrim_user):
        """Test profile update with empty request (no fields to update)."""
        response = authenticated_client.put('/api/v1/profile/update/', {})
        
        # Should succeed but not change anything
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
    
    def test_update_profile_all_fields(self, authenticated_client, pilgrim_user):
        """Test profile update with all possible fields."""
        response = authenticated_client.put('/api/v1/profile/update/', {
            'full_name': 'Complete Profile Test',
            'dob': '1985-03-10',
            'gender': 'FEMALE',
            'nationality': 'TZ',
            'passport_number': 'P98765432',
            'address': '456 Oak Avenue, Dar es Salaam, Tanzania',
            'emergency_name': 'Emergency Person',
            'emergency_phone': '+255712345678',
            'emergency_relationship': 'Parent',
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        pilgrim_user.refresh_from_db()
        profile = pilgrim_user.pilgrim_profile
        
        # Verify all fields were updated
        assert pilgrim_user.name == 'Complete Profile Test'
        assert profile.full_name == 'Complete Profile Test'
        assert str(profile.dob) == '1985-03-10'
        assert profile.gender == 'FEMALE'
        assert profile.nationality == 'TZ'
        assert profile.passport_number == 'P98765432'
        assert profile.address == '456 Oak Avenue, Dar es Salaam, Tanzania'
        assert profile.emergency_name == 'Emergency Person'
        assert profile.emergency_phone == '+255712345678'
        assert profile.emergency_relationship == 'Parent'
    
    def test_update_profile_gender_validation(self, authenticated_client, pilgrim_user):
        """Test profile update with valid gender values."""
        for gender in ['MALE', 'FEMALE', 'OTHER']:
            response = authenticated_client.put('/api/v1/profile/update/', {
                'gender': gender,
            })
            
            assert response.status_code == status.HTTP_200_OK
            
            pilgrim_user.refresh_from_db()
            assert pilgrim_user.pilgrim_profile.gender == gender
    
    def test_update_profile_nationality_format(self, authenticated_client, pilgrim_user):
        """Test profile update with various nationality codes."""
        nationalities = ['UG', 'KE', 'TZ', 'RW', 'US', 'GB', 'SA']
        
        for nationality in nationalities:
            response = authenticated_client.put('/api/v1/profile/update/', {
                'nationality': nationality,
            })
            
            assert response.status_code == status.HTTP_200_OK
            
            pilgrim_user.refresh_from_db()
            assert pilgrim_user.pilgrim_profile.nationality == nationality


@pytest.mark.django_db
class TestProfileUpdateIntegration:
    """Integration tests for profile update with authentication flow."""
    
    def test_complete_profile_after_otp(self, api_client):
        """Test completing profile immediately after OTP verification."""
        from apps.accounts.models import OTPCode
        from django.utils import timezone
        from datetime import timedelta
        
        # Clean up any existing user from previous test runs
        Account.objects.filter(phone='+256700999999').delete()
        
        # Step 1: Request OTP
        api_client.post('/api/v1/auth/request-otp/', {
            'phone': '+256700999999'
        })
        
        # Step 2: Verify OTP
        otp = OTPCode.objects.filter(phone='+256700999999').first()
        response = api_client.post('/api/v1/auth/verify-otp/', {
            'phone': '+256700999999',
            'otp': otp.code
        })
        
        assert response.status_code == status.HTTP_200_OK
        access_token = response.data['access']
        
        # Verify user and profile were created
        user = Account.objects.get(phone='+256700999999')
        try:
            profile = user.pilgrim_profile
            assert profile is not None, "Pilgrim profile should exist after OTP verification"
        except Exception as e:
            assert False, f"Pilgrim profile should exist after OTP verification. Error: {e}"
        
        # Step 3: Update profile with access token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        
        response = api_client.put('/api/v1/profile/update/', {
            'full_name': 'New User Complete',
            'dob': '2000-01-01',
            'gender': 'MALE',
            'nationality': 'UG',
        })
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Verify profile was created and updated
        user = Account.objects.get(phone='+256700999999')
        assert user.name == 'New User Complete'
        assert user.pilgrim_profile.full_name == 'New User Complete'
        assert user.pilgrim_profile.gender == 'MALE'
    
    def test_profile_update_persistence(self, authenticated_client, pilgrim_user):
        """Test that profile updates persist across requests."""
        # First update
        authenticated_client.put('/api/v1/profile/update/', {
            'full_name': 'First Update',
        })
        
        # Second update
        authenticated_client.put('/api/v1/profile/update/', {
            'nationality': 'RW',
        })
        
        # Verify both updates persisted
        pilgrim_user.refresh_from_db()
        assert pilgrim_user.pilgrim_profile.full_name == 'First Update'
        assert pilgrim_user.pilgrim_profile.nationality == 'RW'
    
    def test_profile_retrieve_after_update(self, authenticated_client, pilgrim_user):
        """Test retrieving profile after update via /me endpoint."""
        # Update profile
        authenticated_client.put('/api/v1/profile/update/', {
            'full_name': 'Updated Name',
            'nationality': 'KE',
        })
        
        # Retrieve profile
        response = authenticated_client.get('/api/v1/me/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Name'
        assert response.data['nationality'] == 'KE'

