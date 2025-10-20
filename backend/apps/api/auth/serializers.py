"""
Authentication serializers for OTP and JWT.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

Account = get_user_model()


class RequestOTPSerializer(serializers.Serializer):
    """Serializer for OTP request."""
    
    phone = serializers.CharField(
        max_length=24,
        help_text="Phone number in international format (e.g., +256712345678)"
    )
    
    def validate_phone(self, value):
        """Validate phone number format."""
        # Basic validation - starts with + and has at least 10 digits
        if not value.startswith('+'):
            raise serializers.ValidationError("Phone number must start with country code (e.g., +256)")
        
        digits = ''.join(filter(str.isdigit, value))
        if len(digits) < 10:
            raise serializers.ValidationError("Phone number must have at least 10 digits")
        
        return value


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification."""
    
    phone = serializers.CharField(max_length=24)
    code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="6-digit OTP code"
    )
    
    def validate_code(self, value):
        """Validate OTP code format."""
        if not value.isdigit():
            raise serializers.ValidationError("OTP code must contain only digits")
        return value


class TokenResponseSerializer(serializers.Serializer):
    """Serializer for token response."""
    
    access = serializers.CharField(help_text="JWT access token")
    refresh = serializers.CharField(help_text="JWT refresh token")
    user = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        """Get user information."""
        user = obj.get('user')
        if user:
            return {
                'id': str(user.id),
                'name': user.name,
                'phone': user.phone,
                'role': user.role,
            }
        return None


class AccountSerializer(serializers.ModelSerializer):
    """Basic account serializer."""
    
    class Meta:
        model = Account
        fields = ['id', 'name', 'phone', 'email', 'role']
        read_only_fields = ['id', 'role']

