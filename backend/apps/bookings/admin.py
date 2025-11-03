from django.contrib import admin
from .models import Booking, Payment
from .admin_actions import (
    convert_eoi_to_booked, cancel_bookings,
    assign_rooms, export_bookings_csv
)


class PaymentInline(admin.TabularInline):
    """Inline for Payment model."""
    model = Payment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['payment_date', 'amount_minor_units', 'currency', 'payment_method', 'reference_number', 'recorded_by', 'notes']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin for Booking model."""
    
    list_display = ['reference_number', 'pilgrim', 'package', 'status', 'payment_status', 'amount_paid_minor_units', 'created_at']
    list_filter = ['status', 'payment_status', 'package__trip']
    search_fields = ['reference_number', 'pilgrim__user__name', 'pilgrim__user__phone', 'package__trip__code']
    readonly_fields = ['reference_number', 'amount_paid_minor_units', 'created_at', 'updated_at']
    inlines = [PaymentInline]
    actions = [
        convert_eoi_to_booked,
        cancel_bookings,
        assign_rooms,
        export_bookings_csv
    ]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for Payment model."""
    
    list_display = ['booking', 'amount_minor_units', 'currency', 'payment_method', 'payment_date', 'recorded_by', 'created_at']
    list_filter = ['payment_method', 'payment_date', 'currency']
    search_fields = ['booking__reference_number', 'reference_number', 'booking__pilgrim__user__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'payment_date'

