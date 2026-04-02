"""Tests for the Phase 3 mobile pilgrim support contract."""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from apps.api.tests.test_platform_and_rbac import authenticate
from apps.common.models import PlatformSettings
from apps.pilgrims.models import DeviceInstallation, NotificationPreference, TripFeedback
from apps.trips.models import ItineraryItem, TripResource


@pytest.mark.django_db
class TestNotificationPreferencesAndDevices:
    """Notification preference and device lifecycle coverage."""

    def test_preferences_and_device_registration_are_provider_agnostic(
        self,
        authenticated_client,
        pilgrim_user,
    ):
        """Pilgrims should be able to persist preferences and de-duplicate installations."""
        platform_settings = PlatformSettings.get_solo()
        platform_settings.mobile_support_phone = "+256700111111"
        platform_settings.mobile_support_whatsapp = "+256700222222"
        platform_settings.mobile_support_email = "support@alhilaltravels.com"
        platform_settings.notification_provider_enabled = True
        platform_settings.notification_provider_name = "native-apns-fcm"
        platform_settings.save()

        authenticated_client.force_authenticate(user=pilgrim_user)

        get_response = authenticated_client.get('/api/v1/me/notification-preferences/')
        assert get_response.status_code == status.HTTP_200_OK
        assert get_response.data['push_enabled'] is True
        assert get_response.data['support_phone'] == "+256700111111"
        assert get_response.data['notification_provider_name'] == "native-apns-fcm"

        update_response = authenticated_client.put(
            '/api/v1/me/notification-preferences/',
            {
                'push_enabled': False,
                'document_updates': False,
                'support_updates': True,
            },
            format='json',
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.data['push_enabled'] is False
        assert update_response.data['document_updates'] is False

        preferences = NotificationPreference.get_for_pilgrim(pilgrim_user.pilgrim_profile)
        assert preferences.push_enabled is False
        assert preferences.document_updates is False

        create_response = authenticated_client.post(
            '/api/v1/me/devices/',
            {
                'installation_id': 'ios-install-1',
                'platform': 'IOS',
                'device_name': 'Pilgrim iPhone',
                'device_model': 'iPhone 15',
                'os_version': '18.0',
                'app_version': '3.0.0',
                'locale': 'en-UG',
                'timezone': 'Africa/Kampala',
                'notifications_enabled': True,
                'capability_flags': {'push': True, 'local': True},
                'preference_state': {'push_enabled': False},
                'provider_token_fields': {'nativeToken': 'abc123'},
            },
            format='json',
        )
        assert create_response.status_code == status.HTTP_201_CREATED

        duplicate_response = authenticated_client.post(
            '/api/v1/me/devices/',
            {
                'installation_id': 'ios-install-1',
                'platform': 'IOS',
                'app_version': '3.0.1',
                'notifications_enabled': False,
                'provider_token_fields': {'nativeToken': 'xyz789'},
            },
            format='json',
        )
        assert duplicate_response.status_code == status.HTTP_200_OK
        assert duplicate_response.data['app_version'] == '3.0.1'
        assert duplicate_response.data['notifications_enabled'] is False
        assert DeviceInstallation.objects.count() == 1

        device_id = duplicate_response.data['id']
        patch_response = authenticated_client.patch(
            f'/api/v1/me/devices/{device_id}/',
            {'device_name': 'Updated Pilgrim iPhone'},
            format='json',
        )
        assert patch_response.status_code == status.HTTP_200_OK
        assert patch_response.data['device_name'] == 'Updated Pilgrim iPhone'

        delete_response = authenticated_client.delete(f'/api/v1/me/devices/{device_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        assert DeviceInstallation.objects.count() == 0


@pytest.mark.django_db
class TestDailyProgramAndFeedback:
    """Daily-program and post-trip feedback coverage."""

    def test_daily_program_requires_a_valid_booking_and_returns_pinned_resource(
        self,
        authenticated_client,
        booking,
        other_pilgrim,
    ):
        """Booked pilgrims should receive grouped daily-program data and outsiders should be denied."""
        trip = booking.package.trip
        ItineraryItem.objects.create(
            trip=trip,
            day_index=1,
            title="Departure briefing",
            location="Kampala",
            notes="Arrive early for check-in.",
        )
        ItineraryItem.objects.create(
            trip=trip,
            day_index=2,
            title="Masjid al-Haram arrival",
            location="Makkah",
            notes="Meet your guide in the lobby.",
        )
        TripResource.objects.create(
            trip=trip,
            title="Pinned daily program",
            resource_type="DAILY_PROGRAM",
            file_public_id="guides/pinned-program",
            file_format="pdf",
            published_at=timezone.now() - timedelta(hours=1),
            is_pinned=True,
        )

        response = authenticated_client.get(f'/api/v1/me/trips/{trip.id}/daily-program/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['trip_code'] == trip.code
        assert response.data['pinned_resource']['title'] == 'Pinned daily program'
        assert len(response.data['days']) == 2
        assert response.data['days'][0]['items'][0]['title'] == 'Departure briefing'

        other_client = authenticated_client.__class__()
        other_client.force_authenticate(user=other_pilgrim.user)
        forbidden = other_client.get(f'/api/v1/me/trips/{trip.id}/daily-program/')
        assert forbidden.status_code == status.HTTP_403_FORBIDDEN

    def test_feedback_is_only_available_after_trip_completion_and_supports_draft_then_submit(
        self,
        authenticated_client,
        booking,
        api_client,
        staff_user,
    ):
        """Pilgrims should only receive feedback access after return, with resumable draft support."""
        trip = booking.package.trip

        ineligible_response = authenticated_client.get(f'/api/v1/me/trips/{trip.id}/feedback/')
        assert ineligible_response.status_code == status.HTTP_200_OK
        assert ineligible_response.data['eligible'] is False
        assert ineligible_response.data['feedback'] is None

        trip.status = 'RETURNED'
        trip.save(update_fields=['status'])

        draft_response = authenticated_client.post(
            f'/api/v1/me/trips/{trip.id}/feedback/',
            {
                'status': 'DRAFT',
                'overall_rating': 4,
                'support_rating': 5,
                'highlights': 'The in-country support team was calm and clear.',
            },
            format='json',
        )
        assert draft_response.status_code == status.HTTP_201_CREATED
        assert draft_response.data['status'] == 'DRAFT'
        assert draft_response.data['submitted_at'] is None

        submit_response = authenticated_client.post(
            f'/api/v1/me/trips/{trip.id}/feedback/',
            {
                'status': 'SUBMITTED',
                'overall_rating': 5,
                'support_rating': 5,
                'accommodation_rating': 4,
                'transport_rating': 4,
                'improvements': 'Share the next-day movement plan a little earlier.',
                'follow_up_requested': True,
            },
            format='json',
        )
        assert submit_response.status_code == status.HTTP_200_OK
        assert submit_response.data['status'] == 'SUBMITTED'
        assert submit_response.data['submitted_at'] is not None

        feedback = TripFeedback.objects.get(booking=booking)
        assert feedback.follow_up_requested is True
        assert feedback.status == 'SUBMITTED'

        authenticate(api_client, staff_user)
        review_response = api_client.patch(
            f'/api/v1/feedback/{feedback.id}',
            {'reviewNotes': 'Follow up with the pilgrim about the day-plan timing.'},
            format='json',
        )
        assert review_response.status_code == status.HTTP_200_OK
        assert review_response.data['reviewNotes'] == 'Follow up with the pilgrim about the day-plan timing.'
        assert review_response.data['reviewedByName'] == staff_user.name


@pytest.mark.django_db
class TestDocumentCenterTruth:
    """Read-only document-center contract coverage."""

    def test_document_center_surfaces_missing_and_expiring_truth(
        self,
        authenticated_client,
        booking,
        passport,
    ):
        """The document center should include synthetic missing items plus truthful support guidance."""
        trip = booking.package.trip
        passport.booking = booking
        passport.trip = trip
        passport.status = 'VERIFIED'
        passport.expiry_date = timezone.now().date() + timedelta(days=20)
        passport.save()

        response = authenticated_client.get('/api/v1/me/documents/')

        assert response.status_code == status.HTTP_200_OK
        document_types = [item['document_type'] for item in response.data]
        assert document_types[:3] == ['PASSPORT', 'VISA', 'VACCINATION']

        passport_row = next(item for item in response.data if item['document_type'] == 'PASSPORT')
        visa_row = next(item for item in response.data if item['document_type'] == 'VISA')

        assert passport_row['verification_status'] == 'VERIFIED'
        assert passport_row['required_for_travel'] is True
        assert passport_row['is_expiring_soon'] is True
        assert 'expiring soon' in passport_row['support_next_step'].lower()

        assert visa_row['verification_status'] == 'MISSING'
        assert visa_row['required_for_travel'] is True
        assert visa_row['missing_item'] is True
        assert 'contact al hilal support' in visa_row['support_next_step'].lower()
