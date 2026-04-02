"""Internal email notifications for website lead capture."""

import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone

from apps.common.models import PlatformSettings, WebsiteLead

logger = logging.getLogger(__name__)


def _optional_value(value: str | None, fallback: str = "Not provided") -> str:
    """Return a normalized optional string for email output."""
    if value is None:
        return fallback

    normalized = value.strip()
    return normalized or fallback


def build_website_lead_notification_body(lead: WebsiteLead) -> str:
    """Build the plain-text email body for an internal lead notification."""
    created_at = timezone.localtime(lead.created_at).strftime("%Y-%m-%d %H:%M:%S %Z")
    trip_label = "Not linked"
    if lead.trip_id and lead.trip:
        trip_bits = [lead.trip.name]
        if lead.trip.code:
            trip_bits.append(f"({lead.trip.code})")
        trip_label = " ".join(trip_bits)

    return "\n".join(
        [
            "A new website lead has been saved.",
            "",
            f"Name: {lead.name}",
            f"Interest type: {lead.get_interest_type_display()}",
            f"Phone: {_optional_value(lead.phone)}",
            f"Email: {_optional_value(lead.email)}",
            f"Trip: {trip_label}",
            f"Travel window: {_optional_value(lead.travel_window)}",
            f"Notes: {_optional_value(lead.notes)}",
            "",
            f"Source: {lead.source}",
            f"Page path: {lead.page_path}",
            f"Context label: {lead.context_label}",
            f"CTA label: {lead.cta_label}",
            f"Campaign: {_optional_value(lead.campaign)}",
            f"Referrer: {_optional_value(lead.referrer)}",
            f"UTM source: {_optional_value(lead.utm_source)}",
            f"UTM medium: {_optional_value(lead.utm_medium)}",
            f"UTM campaign: {_optional_value(lead.utm_campaign)}",
            f"UTM content: {_optional_value(lead.utm_content)}",
            f"UTM term: {_optional_value(lead.utm_term)}",
            "",
            f"Lead ID: {lead.id}",
            f"Created at: {created_at}",
            f"Status: {lead.get_status_display()}",
        ]
    )


def send_website_lead_notification(lead: WebsiteLead) -> bool:
    """Send an internal email notification for a newly captured website lead."""
    platform_settings = PlatformSettings.get_solo()
    to_email = platform_settings.lead_notification_to_email.strip()
    if not to_email:
        logger.info("Skipping website lead notification for lead %s because no recipient is configured.", lead.id)
        return False

    cc_email = platform_settings.lead_notification_cc_email.strip()
    subject = f"New {lead.get_interest_type_display()} lead: {lead.name}"

    email = EmailMessage(
        subject=subject,
        body=build_website_lead_notification_body(lead),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
        cc=[cc_email] if cc_email else [],
    )
    email.send(fail_silently=False)
    return True
