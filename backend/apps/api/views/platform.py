"""Platform-wide settings and content feeds."""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.serializers.platform import PlatformSettingsSerializer, PublicVideoFeedSerializer
from apps.common.models import PlatformSettings
from apps.common.permissions import ADMIN_ONLY_ROLES, StaffActionRolePermission, StaffRoleAccessMixin
from apps.common.youtube import YouTubeSyncError, sync_platform_videos


class PlatformSettingsView(StaffRoleAccessMixin, APIView):
    """Admin-only platform settings endpoint."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    method_staff_roles = {
        'GET': ADMIN_ONLY_ROLES,
        'PATCH': ADMIN_ONLY_ROLES,
    }

    def get(self, request):
        """Return the singleton platform settings."""
        serializer = PlatformSettingsSerializer(PlatformSettings.get_solo())
        return Response(serializer.data)

    def patch(self, request):
        """Update the singleton platform settings."""
        settings_obj = PlatformSettings.get_solo()
        serializer = PlatformSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Reset cached videos if the source changed.
        if 'youtube_channel_id' in serializer.validated_data or 'youtube_playlist_id' in serializer.validated_data:
            instance.youtube_cache_payload = []
            instance.youtube_cache_synced_at = None
            instance.save(update_fields=['youtube_cache_payload', 'youtube_cache_synced_at', 'updated_at'])

        return Response(PlatformSettingsSerializer(instance).data)


class PublicVideoFeedView(APIView):
    """Public endpoint for lesson videos sourced from YouTube."""

    permission_classes = [AllowAny]

    def get(self, request):
        """Return cached or freshly synced videos."""
        force_refresh = request.query_params.get('refresh') == 'true'

        try:
            items, platform_settings, _ = sync_platform_videos(force_refresh=force_refresh)
        except YouTubeSyncError as exc:
            platform_settings = PlatformSettings.get_solo()
            if platform_settings.youtube_cache_payload:
                items = platform_settings.youtube_cache_payload
            else:
                return Response(
                    {
                        'error': str(exc),
                        'items': [],
                        'syncedAt': platform_settings.youtube_cache_synced_at,
                        'sourceType': 'youtube',
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        payload = {
            'items': items,
            'syncedAt': platform_settings.youtube_cache_synced_at,
            'sourceType': 'youtube',
        }
        serializer = PublicVideoFeedSerializer(payload)
        return Response(serializer.data)
