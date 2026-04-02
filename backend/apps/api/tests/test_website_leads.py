"""Tests for website lead capture and staff follow-up endpoints."""
import pytest
from django.core import mail
from rest_framework import status

from apps.api.auth.tokens import RoleBasedRefreshToken
from apps.common.models import PlatformSettings, WebsiteLead


def authenticate(client, user):
    """Attach a bearer token for the given user."""
    refresh = RoleBasedRefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestPublicWebsiteLeadCapture:
    def test_public_lead_create_success(self, api_client, trip, settings):
        """Public forms should persist a lead and send the internal notification."""
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        settings.DEFAULT_FROM_EMAIL = 'noreply@alhilaltravels.com'
        mail.outbox.clear()
        platform_settings = PlatformSettings.get_solo()
        platform_settings.lead_notification_to_email = 'info@alhilaltravels.com'
        platform_settings.lead_notification_cc_email = 'kiberusharif@gmail.com'
        platform_settings.save()

        response = api_client.post('/api/v1/public/leads/', {
            'name': 'Amina K',
            'phone': '+256700123123',
            'email': 'amina@example.com',
            'interest_type': 'CONSULTATION',
            'travel_window': 'July 2026',
            'notes': 'Looking for a family-friendly option.',
            'trip': str(trip.id),
            'source': 'homepage',
            'page_path': '/',
            'context_label': 'homepage',
            'cta_label': 'consultation_form_submit',
            'campaign': 'july-fenna',
            'referrer': 'https://google.com/search?q=umrah',
            'utm_source': 'google',
            'utm_medium': 'cpc',
            'utm_campaign': 'july_fenna_launch',
            'utm_content': 'hero',
            'utm_term': 'uganda umrah',
        }, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        lead = WebsiteLead.objects.get()
        assert lead.name == 'Amina K'
        assert lead.trip == trip
        assert lead.status == 'NEW'
        assert lead.utm_campaign == 'july_fenna_launch'
        assert response.data['status'] == 'NEW'
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == ['info@alhilaltravels.com']
        assert mail.outbox[0].cc == ['kiberusharif@gmail.com']
        assert mail.outbox[0].subject == 'New Consultation lead: Amina K'
        assert 'utm_campaign' not in mail.outbox[0].body.lower()
        assert 'UTM campaign: july_fenna_launch' in mail.outbox[0].body
        assert 'Page path: /' in mail.outbox[0].body

    def test_public_lead_requires_core_fields(self, api_client):
        """Public lead capture should reject incomplete submissions."""
        response = api_client.post('/api/v1/public/leads/', {
            'phone': '+256700123123',
            'interest_type': 'CONSULTATION',
        }, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'name' in response.data['error']['fields']
        assert 'source' in response.data['error']['fields']
        assert WebsiteLead.objects.count() == 0

    def test_public_guide_request_without_trip_is_allowed(self, api_client, settings):
        """Guide requests should persist and notify even without a phone or trip."""
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        settings.DEFAULT_FROM_EMAIL = 'noreply@alhilaltravels.com'
        mail.outbox.clear()
        platform_settings = PlatformSettings.get_solo()
        platform_settings.lead_notification_to_email = 'info@alhilaltravels.com'
        platform_settings.save()

        response = api_client.post('/api/v1/public/leads/', {
            'name': 'Mariam',
            'email': 'mariam@example.com',
            'interest_type': 'GUIDE_REQUEST',
            'source': 'homepage',
            'page_path': '/',
            'context_label': 'homepage',
            'cta_label': 'guide_request_form_submit',
        }, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        lead = WebsiteLead.objects.get()
        assert lead.trip is None
        assert lead.interest_type == 'GUIDE_REQUEST'
        assert lead.phone == ''
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == ['info@alhilaltravels.com']
        assert 'Phone: Not provided' in mail.outbox[0].body

    def test_public_lead_skips_email_when_no_notification_recipient(self, api_client, settings):
        """Lead capture should still succeed when notification recipients are not configured."""
        settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
        settings.DEFAULT_FROM_EMAIL = 'noreply@alhilaltravels.com'
        mail.outbox.clear()

        response = api_client.post('/api/v1/public/leads/', {
            'name': 'Safiya',
            'phone': '+256700000123',
            'interest_type': 'CONSULTATION',
            'source': 'homepage',
            'page_path': '/',
            'context_label': 'homepage',
            'cta_label': 'consultation_form_submit',
        }, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert WebsiteLead.objects.count() == 1
        assert len(mail.outbox) == 0

    def test_public_lead_logs_email_failures_but_still_succeeds(self, api_client, monkeypatch):
        """Notification errors should not roll back the saved lead."""
        logged_messages = []

        def raise_send_error(_lead):
            raise RuntimeError('SMTP unavailable')

        def capture_log(message, *args, **kwargs):
            logged_messages.append(message % args)

        monkeypatch.setattr('apps.api.views.leads.send_website_lead_notification', raise_send_error)
        monkeypatch.setattr('apps.api.views.leads.logger.exception', capture_log)

        response = api_client.post('/api/v1/public/leads/', {
            'name': 'Hasina',
            'phone': '+256700777222',
            'interest_type': 'CONSULTATION',
            'source': 'homepage',
            'page_path': '/',
            'context_label': 'homepage',
            'cta_label': 'consultation_form_submit',
        }, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert WebsiteLead.objects.count() == 1
        assert logged_messages
        assert 'Failed to send website lead notification' in logged_messages[0]


@pytest.mark.django_db
class TestStaffWebsiteLeadAccess:
    def test_staff_can_list_leads(self, api_client, agent_user):
        """Agents should retain read access to lead records."""
        WebsiteLead.objects.create(
            name='Amina K',
            phone='+256700123123',
            interest_type='CONSULTATION',
            source='homepage',
            page_path='/',
            context_label='homepage',
            cta_label='consultation_form_submit',
        )

        agent_client = authenticate(api_client, agent_user)
        response = agent_client.get('/api/v1/leads')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
        assert response.data['results'][0]['interestType'] == 'CONSULTATION'

    def test_auditor_can_view_but_not_patch_leads(self, api_client, auditor_user):
        """Auditors should get read-only access to leads."""
        lead = WebsiteLead.objects.create(
            name='Amina K',
            phone='+256700123123',
            interest_type='CONSULTATION',
            source='homepage',
            page_path='/',
            context_label='homepage',
            cta_label='consultation_form_submit',
        )

        auditor_client = authenticate(api_client, auditor_user)
        detail = auditor_client.get(f'/api/v1/leads/{lead.id}')
        forbidden = auditor_client.patch(
            f'/api/v1/leads/{lead.id}',
            {'status': 'CONTACTED'},
            format='json',
        )

        assert detail.status_code == status.HTTP_200_OK
        assert forbidden.status_code == status.HTTP_403_FORBIDDEN

    def test_agent_can_patch_follow_up_fields(self, api_client, agent_user, staff_user):
        """Agents should be able to update status, assignee, and notes."""
        lead = WebsiteLead.objects.create(
            name='Amina K',
            phone='+256700123123',
            interest_type='CONSULTATION',
            source='homepage',
            page_path='/',
            context_label='homepage',
            cta_label='consultation_form_submit',
        )

        agent_client = authenticate(api_client, agent_user)
        response = agent_client.patch(
            f'/api/v1/leads/{lead.id}',
            {
                'status': 'CONTACTED',
                'assignedTo': str(staff_user.id),
                'followUpNotes': 'Called and shared departure options.',
            },
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        lead.refresh_from_db()
        assert lead.status == 'CONTACTED'
        assert lead.assigned_to == staff_user
        assert lead.follow_up_notes == 'Called and shared departure options.'
