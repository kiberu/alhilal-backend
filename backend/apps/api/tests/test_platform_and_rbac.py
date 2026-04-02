"""
Tests for platform settings, public video feed fallback, and staff RBAC.
"""
import pytest
from django.utils import timezone
from rest_framework import status

from apps.api.auth.tokens import RoleBasedRefreshToken
from apps.common.models import PlatformSettings
from apps.common.youtube import YouTubeSyncError


def authenticate(client, user):
    """Attach a bearer token for the given user."""
    refresh = RoleBasedRefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestPlatformSettings:
    def test_platform_settings_are_admin_only(self, api_client, staff_user, agent_user):
        """Agents should not be able to access platform settings."""
        admin_client = authenticate(api_client, staff_user)
        response = admin_client.get('/api/v1/platform/settings/')

        assert response.status_code == status.HTTP_200_OK
        assert 'mobile_support_phone' in response.data
        assert 'notification_provider_name' in response.data
        assert 'lead_notification_to_email' in response.data
        assert 'lead_notification_cc_email' in response.data

        agent_client = authenticate(api_client.__class__(), agent_user)
        forbidden = agent_client.get('/api/v1/platform/settings/')

        assert forbidden.status_code == status.HTTP_403_FORBIDDEN

    def test_platform_settings_patch_updates_notification_emails(self, api_client, staff_user):
        """Admins should be able to persist lead notification recipients and mobile-support settings."""
        admin_client = authenticate(api_client, staff_user)

        response = admin_client.patch(
            '/api/v1/platform/settings/',
            {
                'lead_notification_to_email': 'info@alhilaltravels.com',
                'lead_notification_cc_email': 'kiberusharif@gmail.com',
                'mobile_support_phone': '+256700111111',
                'mobile_support_whatsapp': '+256700222222',
                'mobile_support_email': 'support@alhilaltravels.com',
                'notification_provider_enabled': True,
                'notification_provider_name': 'native-apns-fcm',
            },
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['lead_notification_to_email'] == 'info@alhilaltravels.com'
        assert response.data['lead_notification_cc_email'] == 'kiberusharif@gmail.com'
        assert response.data['mobile_support_phone'] == '+256700111111'
        assert response.data['notification_provider_name'] == 'native-apns-fcm'

        platform_settings = PlatformSettings.get_solo()
        assert platform_settings.lead_notification_to_email == 'info@alhilaltravels.com'
        assert platform_settings.lead_notification_cc_email == 'kiberusharif@gmail.com'
        assert platform_settings.mobile_support_phone == '+256700111111'
        assert platform_settings.notification_provider_enabled is True

    def test_public_videos_use_cached_payload_on_sync_failure(self, api_client, monkeypatch):
        """The public feed should serve cached videos when YouTube refresh fails."""
        platform_settings = PlatformSettings.get_solo()
        platform_settings.youtube_cache_payload = [
            {
                'videoId': 'abc123',
                'title': 'Umrah Lesson',
                'description': 'Cached lesson',
                'publishedAt': '2026-04-01T08:30:00Z',
                'channelTitle': 'Al Hilal Travels',
                'thumbnailUrl': 'https://example.com/thumb.jpg',
                'youtubeUrl': 'https://www.youtube.com/watch?v=abc123',
            }
        ]
        platform_settings.youtube_cache_synced_at = timezone.now()
        platform_settings.save()

        def raise_sync_error(*args, **kwargs):
            raise YouTubeSyncError('YouTube unavailable')

        monkeypatch.setattr('apps.api.views.platform.sync_platform_videos', raise_sync_error)

        response = api_client.get('/api/v1/public/videos/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['items'][0]['videoId'] == 'abc123'


@pytest.mark.django_db
class TestStaffRBAC:
    def test_dashboard_stats_allow_auditors(self, api_client, auditor_user):
        """Auditors should retain read access to the staff dashboard."""
        auditor_client = authenticate(api_client, auditor_user)
        response = auditor_client.get('/api/v1/dashboard/stats/')

        assert response.status_code == status.HTTP_200_OK

    def test_trip_updates_are_denied_for_auditors(self, api_client, auditor_user, trip):
        """Auditors must not mutate operational trip records."""
        auditor_client = authenticate(api_client, auditor_user)
        response = auditor_client.patch(
            f'/api/v1/trips/{trip.id}',
            {'name': 'Updated Trip Name'},
            format='json',
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_trip_updates_are_allowed_for_agents(self, api_client, agent_user, trip):
        """Agents should keep operational write access to trips."""
        agent_client = authenticate(api_client, agent_user)
        response = agent_client.patch(
            f'/api/v1/trips/{trip.id}',
            {'name': 'Updated Trip Name'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Trip Name'

    def test_user_management_is_denied_for_agents(self, api_client, agent_user):
        """Only admins should reach user-management endpoints."""
        agent_client = authenticate(api_client, agent_user)
        response = agent_client.get('/api/v1/users/')

        assert response.status_code == status.HTTP_403_FORBIDDEN
