from django.contrib import admin
from .models import Booking
from .admin_actions import (
    convert_eoi_to_booked, cancel_bookings,
    assign_rooms, export_bookings_csv
)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin for Booking model."""
    
    list_display = ['pilgrim', 'package', 'status', 'created_at']
    list_filter = ['status', 'package__trip']
    search_fields = ['pilgrim__user__name', 'pilgrim__user__phone', 'package__trip__code']
    readonly_fields = ['created_at', 'updated_at']
    actions = [
        convert_eoi_to_booked,
        cancel_bookings,
        assign_rooms,
        export_bookings_csv
    ]

