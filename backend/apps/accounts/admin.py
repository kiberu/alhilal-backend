from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Account, StaffProfile, PilgrimProfile, OTPCode


@admin.register(Account)
class AccountAdmin(BaseUserAdmin):
    """Admin for Account model."""
    
    list_display = ['phone', 'name', 'email', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['phone', 'name', 'email']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {'fields': ('name', 'email', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    """Admin for StaffProfile model."""
    
    list_display = ['user', 'role', 'created_at']
    list_filter = ['role']
    search_fields = ['user__name', 'user__phone']


@admin.register(PilgrimProfile)
class PilgrimProfileAdmin(admin.ModelAdmin):
    """Admin for PilgrimProfile model."""
    
    list_display = ['user', 'nationality', 'dob', 'created_at']
    list_filter = ['nationality']
    search_fields = ['user__name', 'user__phone']


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    """Admin for OTPCode model."""
    
    list_display = ['phone', 'code', 'expires_at', 'attempts', 'consumed_at', 'created_at']
    list_filter = ['consumed_at', 'created_at']
    search_fields = ['phone']
    readonly_fields = ['created_at']

