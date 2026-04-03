from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
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


class StaffChangePasswordSerializer(serializers.Serializer):
    """Validate self-service staff password changes."""

    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        current_password = attrs.get("current_password")
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        if not user.check_password(current_password):
            raise serializers.ValidationError(
                {"current_password": ["Current password is incorrect."]}
            )

        if new_password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": ["New password and confirmation do not match."]}
            )

        if current_password == new_password:
            raise serializers.ValidationError(
                {"new_password": ["New password must be different from the current password."]}
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)}) from exc

        return attrs
