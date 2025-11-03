from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.accounts.models import Account

class StaffLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')

        if not phone or not password:
            raise serializers.ValidationError("Phone and password are required")

        # Check if user exists
        try:
            user_exists = Account.objects.filter(phone=phone).exists()
            if not user_exists:
                raise serializers.ValidationError("Invalid phone number or password")
        except Exception:
            raise serializers.ValidationError("Invalid phone number or password")

        # Authenticate user
        user = authenticate(username=phone, password=password)

        if not user:
            # User exists but password is wrong
            raise serializers.ValidationError("Invalid password. Please check your password and try again.")

        if not user.is_staff:
            raise serializers.ValidationError("Only staff members can access the admin dashboard")

        if not user.is_active:
            raise serializers.ValidationError("This account is not active")

        attrs['user'] = user
        return attrs
