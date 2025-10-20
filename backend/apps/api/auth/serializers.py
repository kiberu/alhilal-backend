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

        # Authenticate user
        user = authenticate(username=phone, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_staff:
            raise serializers.ValidationError("Only staff members can access the admin dashboard")

        if not user.is_active:
            raise serializers.ValidationError("This account is not active")

        attrs['user'] = user
        return attrs
