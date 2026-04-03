from django.contrib import admin

from .models import Currency, PlatformSettings, WebsiteLead


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    """Admin for currencies."""

    list_display = ['code', 'name', 'symbol', 'is_active']
    list_filter = ['is_active']
    search_fields = ['code', 'name', 'symbol']


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    """Admin for the singleton platform settings."""

    list_display = [
        'key',
        'lead_notification_to_email',
        'lead_notification_cc_email',
        'mobile_support_phone',
        'notification_provider_name',
        'otp_support_phone',
        'youtube_channel_id',
    ]
    readonly_fields = ['key', 'youtube_cache_synced_at', 'created_at', 'updated_at']
    fieldsets = (
        ('Lead Notifications', {
            'fields': ('lead_notification_to_email', 'lead_notification_cc_email'),
        }),
        ('OTP Support', {
            'fields': ('otp_support_phone', 'otp_support_whatsapp', 'otp_fallback_message'),
        }),
        ('Mobile Support', {
            'fields': (
                'mobile_support_phone',
                'mobile_support_whatsapp',
                'mobile_support_email',
                'mobile_support_message',
            ),
        }),
        ('Notification Provider', {
            'fields': (
                'notification_provider_enabled',
                'notification_provider_name',
                'notification_provider_notes',
            ),
        }),
        ('YouTube Sync', {
            'fields': (
                'youtube_channel_id',
                'youtube_playlist_id',
                'youtube_cache_synced_at',
                'youtube_cache_payload',
            ),
        }),
        ('Audit', {
            'fields': ('key', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(WebsiteLead)
class WebsiteLeadAdmin(admin.ModelAdmin):
    """Admin for website conversion leads."""

    list_display = ['name', 'interest_type', 'status', 'source', 'trip', 'assigned_to', 'created_at']
    list_filter = ['interest_type', 'status', 'source', 'created_at']
    search_fields = ['name', 'phone', 'email', 'source', 'context_label', 'page_path', 'trip__name', 'trip__code']
