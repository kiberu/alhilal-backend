from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin for unified Document model."""
    
    list_display = ['pilgrim', 'document_type', 'title', 'status', 'expiry_date', 'trip', 'created_at']
    list_filter = ['document_type', 'status', 'trip', 'issuing_country']
    search_fields = ['pilgrim__user__name', 'pilgrim__user__phone', 'title', 'document_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'uploaded_by']
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
            'fields': ('status', 'rejection_reason', 'notes')
        }),
        ('Audit', {
            'fields': ('id', 'uploaded_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
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

