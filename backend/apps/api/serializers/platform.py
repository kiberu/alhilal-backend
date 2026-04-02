"""Serializers for platform-level settings and synced video content."""

from rest_framework import serializers

from apps.common.models import PlatformSettings, WebsiteLead
from apps.trips.models import Trip


class PlatformSettingsSerializer(serializers.ModelSerializer):
    """Serializer for admin-managed platform settings."""

    class Meta:
        model = PlatformSettings
        fields = [
            'otp_support_phone',
            'otp_support_whatsapp',
            'otp_fallback_message',
            'mobile_support_phone',
            'mobile_support_whatsapp',
            'mobile_support_email',
            'mobile_support_message',
            'notification_provider_enabled',
            'notification_provider_name',
            'notification_provider_notes',
            'lead_notification_to_email',
            'lead_notification_cc_email',
            'youtube_channel_id',
            'youtube_playlist_id',
            'youtube_cache_synced_at',
            'updated_at',
        ]
        read_only_fields = ['youtube_cache_synced_at', 'updated_at']


class PublicVideoItemSerializer(serializers.Serializer):
    """Serializer for normalized YouTube video items."""

    videoId = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    publishedAt = serializers.DateTimeField(allow_null=True)
    channelTitle = serializers.CharField(allow_blank=True)
    thumbnailUrl = serializers.URLField(allow_null=True)
    youtubeUrl = serializers.URLField()


class PublicVideoFeedSerializer(serializers.Serializer):
    """Serializer for the mobile lessons feed."""

    items = PublicVideoItemSerializer(many=True)
    syncedAt = serializers.DateTimeField(allow_null=True)
    sourceType = serializers.CharField()


class OTPFallbackSerializer(serializers.Serializer):
    """Serializer for OTP fallback information returned to pilgrims."""

    supportPhone = serializers.CharField(allow_blank=True)
    supportWhatsApp = serializers.CharField(allow_blank=True)
    message = serializers.CharField(allow_blank=True)


class WebsiteLeadPublicCreateSerializer(serializers.ModelSerializer):
    """Serializer for unauthenticated website lead capture."""

    trip = serializers.PrimaryKeyRelatedField(
        queryset=Trip.objects.filter(visibility='PUBLIC'),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = WebsiteLead
        fields = [
            'id',
            'name',
            'phone',
            'email',
            'interest_type',
            'travel_window',
            'notes',
            'trip',
            'source',
            'page_path',
            'context_label',
            'cta_label',
            'campaign',
            'referrer',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, attrs):
        """Require the minimum public lead-capture contract."""
        for field_name, value in list(attrs.items()):
            if isinstance(value, str):
                attrs[field_name] = value.strip()

        required_fields = ['name', 'interest_type', 'source', 'page_path', 'context_label', 'cta_label']
        for field_name in required_fields:
            value = attrs.get(field_name)
            if value in (None, ''):
                raise serializers.ValidationError({field_name: 'This field is required.'})

        interest_type = attrs.get('interest_type')
        phone = attrs.get('phone', '')
        if interest_type == 'CONSULTATION' and not phone:
            raise serializers.ValidationError({'phone': 'This field is required for consultation requests.'})
        return attrs

    def create(self, validated_data):
        """Attach request-derived fallback values when the browser omits them."""
        request = self.context.get('request')
        if request and not validated_data.get('referrer'):
            validated_data['referrer'] = request.headers.get('Referer', '')
        return super().create(validated_data)
