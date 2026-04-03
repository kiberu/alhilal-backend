"""Serializers for Phase 3 mobile pilgrim support endpoints."""

from rest_framework import serializers

from apps.api.serializers.trips import TripResourceSerializer
from apps.common.models import PlatformSettings
from apps.pilgrims.models import DeviceInstallation, NotificationPreference, TripFeedback


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim notification preferences."""

    support_phone = serializers.SerializerMethodField()
    support_whatsapp = serializers.SerializerMethodField()
    support_email = serializers.SerializerMethodField()
    support_message = serializers.SerializerMethodField()
    notification_provider_enabled = serializers.SerializerMethodField()
    notification_provider_name = serializers.SerializerMethodField()

    class Meta:
        model = NotificationPreference
        fields = [
            'push_enabled',
            'in_app_enabled',
            'trip_updates',
            'document_updates',
            'readiness_updates',
            'daily_program_updates',
            'support_updates',
            'marketing_updates',
            'support_phone',
            'support_whatsapp',
            'support_email',
            'support_message',
            'notification_provider_enabled',
            'notification_provider_name',
            'updated_at',
        ]
        read_only_fields = [
            'support_phone',
            'support_whatsapp',
            'support_email',
            'support_message',
            'notification_provider_enabled',
            'notification_provider_name',
            'updated_at',
        ]

    def _get_settings(self) -> PlatformSettings:
        return PlatformSettings.get_solo()

    def get_support_phone(self, obj):
        return self._get_settings().mobile_support_phone

    def get_support_whatsapp(self, obj):
        return self._get_settings().mobile_support_whatsapp

    def get_support_email(self, obj):
        return self._get_settings().mobile_support_email

    def get_support_message(self, obj):
        return self._get_settings().mobile_support_message

    def get_notification_provider_enabled(self, obj):
        return self._get_settings().notification_provider_enabled

    def get_notification_provider_name(self, obj):
        return self._get_settings().notification_provider_name


class DeviceInstallationSerializer(serializers.ModelSerializer):
    """Serializer for provider-agnostic device installations."""

    class Meta:
        model = DeviceInstallation
        fields = [
            'id',
            'installation_id',
            'platform',
            'device_name',
            'device_model',
            'os_version',
            'app_version',
            'locale',
            'timezone',
            'notifications_enabled',
            'capability_flags',
            'preference_state',
            'provider_token_fields',
            'last_seen_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_seen_at']


class TripDailyProgramItemSerializer(serializers.Serializer):
    """Serializer for a single daily-program itinerary item."""

    id = serializers.CharField()
    day_index = serializers.IntegerField()
    title = serializers.CharField()
    location = serializers.CharField(allow_blank=True, allow_null=True)
    notes = serializers.CharField(allow_blank=True, allow_null=True)
    start_time = serializers.DateTimeField(allow_null=True)
    end_time = serializers.DateTimeField(allow_null=True)


class TripDailyProgramDaySerializer(serializers.Serializer):
    """Serializer for a day-grouped daily program."""

    id = serializers.CharField()
    day_index = serializers.IntegerField()
    label = serializers.CharField()
    date = serializers.DateField(allow_null=True)
    items = TripDailyProgramItemSerializer(many=True)


class TripDailyProgramSerializer(serializers.Serializer):
    """Serializer for a booked pilgrim's daily program surface."""

    trip_id = serializers.UUIDField()
    trip_code = serializers.CharField()
    trip_name = serializers.CharField()
    trip_status = serializers.CharField()
    current_day_index = serializers.IntegerField()
    is_trip_live = serializers.BooleanField()
    pinned_resource = TripResourceSerializer(allow_null=True)
    days = TripDailyProgramDaySerializer(many=True)
    updated_at = serializers.DateTimeField(allow_null=True)


class PilgrimTripFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim feedback state and submitted content."""

    booking_reference = serializers.CharField(source='booking.reference_number', read_only=True)
    trip_code = serializers.CharField(source='trip.code', read_only=True)
    trip_name = serializers.CharField(source='trip.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True)

    class Meta:
        model = TripFeedback
        fields = [
            'id',
            'booking_reference',
            'trip_code',
            'trip_name',
            'status',
            'overall_rating',
            'support_rating',
            'accommodation_rating',
            'transport_rating',
            'highlights',
            'improvements',
            'testimonial_opt_in',
            'follow_up_requested',
            'review_notes',
            'reviewed_by_name',
            'reviewed_at',
            'submitted_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'booking_reference',
            'trip_code',
            'trip_name',
            'review_notes',
            'reviewed_by_name',
            'reviewed_at',
            'submitted_at',
            'created_at',
            'updated_at',
        ]


class PilgrimTripFeedbackUpsertSerializer(serializers.ModelSerializer):
    """Serializer for draft-save and submission of post-trip feedback."""

    class Meta:
        model = TripFeedback
        fields = [
            'status',
            'overall_rating',
            'support_rating',
            'accommodation_rating',
            'transport_rating',
            'highlights',
            'improvements',
            'testimonial_opt_in',
            'follow_up_requested',
        ]

    def validate(self, attrs):
        """Keep submitted feedback internally consistent."""
        for field_name in ['overall_rating', 'support_rating', 'accommodation_rating', 'transport_rating']:
            value = attrs.get(field_name)
            if value is not None and not 1 <= value <= 5:
                raise serializers.ValidationError({field_name: 'Ratings must be between 1 and 5.'})

        return attrs


class PilgrimTripFeedbackStateSerializer(serializers.Serializer):
    """Serializer for the trip-feedback availability response."""

    eligible = serializers.BooleanField()
    reason = serializers.CharField(allow_blank=True, allow_null=True)
    feedback = PilgrimTripFeedbackSerializer(allow_null=True)
