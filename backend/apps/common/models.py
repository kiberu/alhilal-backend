"""
Common models shared across the application.
"""
from django.db import models
from uuid import uuid4


class Currency(models.Model):
    """Currency model to manage different currencies in the system."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=3, unique=True, help_text='ISO 4217 currency code (e.g., USD, UGX)')
    name = models.CharField(max_length=50, help_text='Full currency name (e.g., US Dollar, Ugandan Shilling)')
    symbol = models.CharField(max_length=10, help_text='Currency symbol (e.g., $, USh)')
    is_active = models.BooleanField(default=True, help_text='Whether this currency is currently in use')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'currencies'
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def __repr__(self):
        return f"<Currency: {self.code}>"


class PlatformSettings(models.Model):
    """Singleton-style operational settings shared across clients."""

    key = models.CharField(max_length=32, unique=True, default='default', editable=False)
    otp_support_phone = models.CharField(max_length=24, blank=True, default='')
    otp_support_whatsapp = models.CharField(max_length=24, blank=True, default='')
    otp_fallback_message = models.CharField(
        max_length=255,
        blank=True,
        default='If your code does not arrive, wait a moment, try resending, or contact Al Hilal support.',
    )
    mobile_support_phone = models.CharField(max_length=24, blank=True, default='')
    mobile_support_whatsapp = models.CharField(max_length=24, blank=True, default='')
    mobile_support_email = models.EmailField(blank=True, default='')
    mobile_support_message = models.CharField(
        max_length=255,
        blank=True,
        default='Contact Al Hilal support if you need help with documents, readiness blockers, or in-trip updates.',
    )
    notification_provider_enabled = models.BooleanField(default=False)
    notification_provider_name = models.CharField(max_length=64, blank=True, default='')
    notification_provider_notes = models.CharField(max_length=255, blank=True, default='')
    lead_notification_to_email = models.EmailField(blank=True, default='')
    lead_notification_cc_email = models.EmailField(blank=True, default='')
    youtube_channel_id = models.CharField(max_length=64, blank=True, default='')
    youtube_playlist_id = models.CharField(max_length=64, blank=True, default='')
    youtube_cache_payload = models.JSONField(default=list, blank=True)
    youtube_cache_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'platform_settings'
        verbose_name = 'Platform Settings'
        verbose_name_plural = 'Platform Settings'

    def __str__(self):
        return 'Platform Settings'

    @classmethod
    def get_solo(cls):
        """Return the singleton settings row."""
        settings_obj, _ = cls.objects.get_or_create(key='default')
        return settings_obj


class WebsiteLead(models.Model):
    """Website lead captured from public conversion forms."""

    INTEREST_TYPE_CHOICES = [
        ('CONSULTATION', 'Consultation'),
        ('GUIDE_REQUEST', 'Guide Request'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('QUALIFIED', 'Qualified'),
        ('CLOSED', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=24, blank=True, default='')
    email = models.EmailField(blank=True, null=True)
    interest_type = models.CharField(max_length=20, choices=INTEREST_TYPE_CHOICES)
    travel_window = models.CharField(max_length=120, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='website_leads',
    )
    source = models.CharField(max_length=64)
    page_path = models.CharField(max_length=255)
    context_label = models.CharField(max_length=120)
    cta_label = models.CharField(max_length=120)
    campaign = models.CharField(max_length=120, blank=True, default='')
    referrer = models.URLField(max_length=500, blank=True, default='')
    utm_source = models.CharField(max_length=120, blank=True, default='')
    utm_medium = models.CharField(max_length=120, blank=True, default='')
    utm_campaign = models.CharField(max_length=120, blank=True, default='')
    utm_content = models.CharField(max_length=120, blank=True, default='')
    utm_term = models.CharField(max_length=120, blank=True, default='')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='NEW')
    assigned_to = models.ForeignKey(
        'accounts.Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_website_leads',
    )
    follow_up_notes = models.TextField(blank=True, default='')
    contacted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'website_leads'
        verbose_name = 'Website Lead'
        verbose_name_plural = 'Website Leads'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['interest_type']),
            models.Index(fields=['source']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.interest_type}"
