"""
Custom JWT token classes for role-based token expiration.
Pilgrims get rare-login, refreshable sessions.
Staff/Admin get normal expiring tokens.
"""
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta


class PilgrimAccessToken(AccessToken):
    """Access token with a convenient but bounded lifetime for pilgrims."""
    lifetime = timedelta(days=30)


class PilgrimRefreshToken(RefreshToken):
    """Refresh token with a long trusted-device lifetime for pilgrims."""
    lifetime = timedelta(days=180)
    access_token_class = PilgrimAccessToken


class RoleBasedRefreshToken(RefreshToken):
    """
    Custom RefreshToken that sets different lifetimes based on user role.
    
    - PILGRIM: 30-day access, 180-day refresh with silent refresh on trusted devices
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
