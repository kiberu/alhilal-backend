"""
Custom JWT token classes for role-based token expiration.
Pilgrims get tokens that don't expire (very long lifetime).
Staff/Admin get normal expiring tokens.
"""
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta
from django.utils import timezone


class PilgrimAccessToken(AccessToken):
    """Access token with extended lifetime for pilgrims"""
    lifetime = timedelta(days=365)


class PilgrimRefreshToken(RefreshToken):
    """Refresh token with extended lifetime for pilgrims"""
    lifetime = timedelta(days=730)
    access_token_class = PilgrimAccessToken


class RoleBasedRefreshToken(RefreshToken):
    """
    Custom RefreshToken that sets different lifetimes based on user role.
    
    - PILGRIM: Very long token lifetime (365 days access, 730 days refresh)
    - STAFF/ADMIN: Normal token lifetime from settings
    """
    
    @classmethod
    def for_user(cls, user):
        """
        Create token with role-based expiration
        """
        # Check user role and create appropriate token type
        if hasattr(user, 'role') and user.role == 'PILGRIM':
            # Pilgrims: Use extended lifetime tokens
            token = PilgrimRefreshToken.for_user(user)
        else:
            # Staff/Admin: Use default settings from SIMPLE_JWT config
            token = super().for_user(user)
        
        return token

