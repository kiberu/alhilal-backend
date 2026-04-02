from django.contrib import admin
from .models import DeviceInstallation, Document, NotificationPreference, PilgrimReadiness, TripFeedback


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin for unified Document model."""
    
    list_display = ['pilgrim', 'document_type', 'title', 'status', 'expiry_date', 'trip', 'created_at']
    list_filter = ['document_type', 'status', 'trip', 'issuing_country']
    search_fields = ['pilgrim__user__name', 'pilgrim__user__phone', 'title', 'document_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'uploaded_by', 'reviewed_at']
    autocomplete_fields = ['pilgrim', 'trip', 'booking']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('pilgrim', 'document_type', 'title', 'document_number', 'issuing_country')
        }),
        ('Relationships', {
            'fields': ('trip', 'booking'),
            'description': 'Optional: Link this document to a specific trip or booking'
        }),
        ('File', {
            'fields': ('file_public_id', 'file_url')
        }),
        ('Dates', {
            'fields': ('issue_date', 'expiry_date')
        }),
        ('Status & Review', {
            'fields': ('status', 'rejection_reason', 'notes', 'reviewed_at')
        }),
        ('Audit', {
            'fields': ('id', 'uploaded_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin for pilgrim notification preferences."""

    list_display = ['pilgrim', 'push_enabled', 'in_app_enabled', 'support_updates', 'updated_at']
    list_filter = ['push_enabled', 'in_app_enabled', 'support_updates', 'marketing_updates']
    search_fields = ['pilgrim__full_name', 'pilgrim__user__name', 'pilgrim__user__phone']


@admin.register(DeviceInstallation)
class DeviceInstallationAdmin(admin.ModelAdmin):
    """Admin for provider-agnostic device registrations."""

    list_display = ['pilgrim', 'platform', 'installation_id', 'notifications_enabled', 'last_seen_at']
    list_filter = ['platform', 'notifications_enabled']
    search_fields = ['pilgrim__full_name', 'pilgrim__user__name', 'installation_id', 'device_name', 'device_model']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_seen_at']


@admin.register(TripFeedback)
class TripFeedbackAdmin(admin.ModelAdmin):
    """Admin for post-trip feedback review."""

    list_display = ['booking', 'status', 'overall_rating', 'follow_up_requested', 'submitted_at', 'reviewed_at']
    list_filter = ['status', 'follow_up_requested', 'testimonial_opt_in', 'trip']
    search_fields = ['booking__reference_number', 'pilgrim__full_name', 'pilgrim__user__name', 'trip__code']
    readonly_fields = ['id', 'pilgrim', 'booking', 'trip', 'created_at', 'updated_at', 'submitted_at']
    
    actions = ['mark_as_verified', 'mark_as_pending', 'mark_as_rejected']
    
    def mark_as_verified(self, request, queryset):
        updated = queryset.update(status='VERIFIED')
        self.message_user(request, f'{updated} document(s) marked as verified.')
    mark_as_verified.short_description = 'Mark selected documents as verified'
    
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='PENDING')
        self.message_user(request, f'{updated} document(s) marked as pending.')
    mark_as_pending.short_description = 'Mark selected documents as pending'
    
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f'{updated} document(s) marked as rejected.')
    mark_as_rejected.short_description = 'Mark selected documents as rejected'


@admin.register(PilgrimReadiness)
class PilgrimReadinessAdmin(admin.ModelAdmin):
    """Admin view for travel-readiness passes."""

    list_display = [
        'booking',
        'status',
        'ready_for_travel',
        'payment_progress_percent',
        'documents_complete',
        'ticket_issued',
        'validated_at',
    ]
    list_filter = ['status', 'ready_for_travel', 'requires_follow_up', 'trip']
    search_fields = [
        'booking__reference_number',
        'pilgrim__full_name',
        'pilgrim__user__name',
        'package__name',
        'trip__code',
    ]
    readonly_fields = [
        'id',
        'pilgrim',
        'booking',
        'trip',
        'package',
        'profile_complete',
        'passport_valid',
        'visa_verified',
        'documents_complete',
        'payment_target_met',
        'payment_progress_percent',
        'ticket_issued',
        'status',
        'ready_for_travel',
        'requires_follow_up',
        'blocking_reason',
        'created_at',
        'updated_at',
    ]
    autocomplete_fields = ['validated_by']

    fieldsets = (
        ('Booking', {
            'fields': ('id', 'pilgrim', 'booking', 'trip', 'package')
        }),
        ('Computed Readiness', {
            'fields': (
                'status',
                'ready_for_travel',
                'profile_complete',
                'passport_valid',
                'visa_verified',
                'documents_complete',
                'payment_target_met',
                'payment_progress_percent',
                'ticket_issued',
                'requires_follow_up',
                'blocking_reason',
            )
        }),
        ('Manual Completion', {
            'fields': (
                'darasa_one_completed',
                'darasa_two_completed',
                'send_off_completed',
                'validation_notes',
                'validated_by',
                'validated_at',
            )
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
