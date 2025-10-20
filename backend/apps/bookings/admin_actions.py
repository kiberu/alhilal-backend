"""
Custom admin actions for Booking management.
"""
from django.contrib import messages
from django.core.exceptions import ValidationError


def convert_eoi_to_booked(modeladmin, request, queryset):
    """
    Convert EOI bookings to BOOKED status.
    
    Validates:
    - Valid passport exists
    - Passport not expired
    - Package has capacity
    """
    converted = 0
    errors = []
    
    for booking in queryset.filter(status='EOI'):
        try:
            # Change status
            booking.status = 'BOOKED'
            
            # Run validation
            booking.clean()
            
            # Save
            booking.save()
            converted += 1
            
        except ValidationError as e:
            errors.append(f"{booking.pilgrim.user.name}: {', '.join(e.messages)}")
    
    if converted:
        messages.success(request, f"Successfully converted {converted} EOI(s) to BOOKED.")
    
    if errors:
        for error in errors[:5]:  # Show max 5 errors
            messages.error(request, error)
        if len(errors) > 5:
            messages.warning(request, f"...and {len(errors) - 5} more errors.")

convert_eoi_to_booked.short_description = "Convert EOI to BOOKED (with validation)"


def cancel_bookings(modeladmin, request, queryset):
    """
    Cancel selected bookings.
    """
    count = queryset.update(status='CANCELLED')
    messages.success(request, f"Successfully cancelled {count} booking(s).")

cancel_bookings.short_description = "Cancel selected bookings"


def assign_rooms(modeladmin, request, queryset):
    """
    Auto-assign room numbers to bookings.
    
    Simple sequential assignment: Room 101, 102, 103...
    """
    room_number = 101
    updated = 0
    
    for booking in queryset.filter(status='BOOKED', room_assignment__isnull=True):
        booking.room_assignment = f"Room {room_number}"
        booking.save()
        room_number += 1
        updated += 1
    
    messages.success(request, f"Assigned rooms to {updated} booking(s).")

assign_rooms.short_description = "Auto-assign room numbers"


def export_bookings_csv(modeladmin, request, queryset):
    """
    Export selected bookings as CSV.
    """
    import csv
    from django.http import HttpResponse
    from apps.common.encryption import mask_value
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="bookings.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Booking ID', 'Status', 'Trip', 'Package',
        'Pilgrim Name', 'Phone', 'Email',
        'Passport (Masked)', 'Nationality',
        'Ticket Number', 'Room Assignment',
        'Created At', 'Updated At'
    ])
    
    for booking in queryset:
        pilgrim = booking.pilgrim
        user = pilgrim.user
        passport = pilgrim.passports.first()
        
        writer.writerow([
            str(booking.id),
            booking.status,
            booking.package.trip.code,
            booking.package.name,
            user.name,
            user.phone,
            user.email or '',
            mask_value(passport.number) if passport else '',
            pilgrim.nationality or '',
            booking.ticket_number or '',
            booking.room_assignment or '',
            booking.created_at,
            booking.updated_at
        ])
    
    return response

export_bookings_csv.short_description = "Export as CSV"

