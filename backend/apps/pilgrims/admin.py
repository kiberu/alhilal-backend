from django.contrib import admin
from .models import Passport, Visa
from .admin_actions import (
    mark_visa_submitted, approve_visas, reject_visas,
    export_visa_status_csv, export_passports_csv
)


@admin.register(Passport)
class PassportAdmin(admin.ModelAdmin):
    """Admin for Passport model."""
    
    list_display = ['pilgrim', 'country', 'expiry_date', 'created_at']
    list_filter = ['country', 'expiry_date']
    search_fields = ['pilgrim__user__name', 'pilgrim__user__phone']
    readonly_fields = ['created_at', 'updated_at']
    actions = [export_passports_csv]


@admin.register(Visa)
class VisaAdmin(admin.ModelAdmin):
    """Admin for Visa model."""
    
    list_display = ['pilgrim', 'trip', 'status', 'issue_date', 'expiry_date']
    list_filter = ['status', 'trip']
    search_fields = ['pilgrim__user__name', 'ref_no']
    readonly_fields = ['created_at', 'updated_at']
    actions = [
        mark_visa_submitted,
        approve_visas,
        reject_visas,
        export_visa_status_csv
    ]

