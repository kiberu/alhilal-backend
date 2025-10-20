"""
Custom admin actions for Trip management.
"""
import csv
from django.http import HttpResponse
from django.contrib import messages
from django.utils import timezone
from django.db import transaction


def duplicate_trip(modeladmin, request, queryset):
    """
    Duplicate selected trip(s) with all related data.
    
    Duplicates:
    - Trip
    - All packages
    - All flights (per package)
    - All hotels (per package)
    - Itinerary items
    - Guide sections
    - Checklist items
    - Emergency contacts
    - FAQs
    
    Does NOT duplicate:
    - Bookings
    - Visas
    - Updates
    """
    duplicated_count = 0
    
    for trip in queryset:
        try:
            with transaction.atomic():
                # Store old ID for relations
                old_trip_id = trip.id
                
                # Duplicate trip
                trip.pk = None
                trip.id = None
                trip.code = f"{trip.code}_COPY_{timezone.now().strftime('%Y%m%d%H%M%S')}"
                trip.name = f"{trip.name} (Copy)"
                trip.save()
                new_trip = trip
                
                # Duplicate packages with flights and hotels
                from apps.trips.models import TripPackage, PackageFlight, PackageHotel
                
                old_packages = TripPackage.objects.filter(trip_id=old_trip_id)
                package_mapping = {}  # old_id -> new_package
                
                for old_package in old_packages:
                    old_package_id = old_package.id
                    
                    # Duplicate package
                    old_package.pk = None
                    old_package.id = None
                    old_package.trip = new_trip
                    old_package.save()
                    new_package = old_package
                    package_mapping[old_package_id] = new_package
                    
                    # Duplicate flights
                    old_flights = PackageFlight.objects.filter(package_id=old_package_id)
                    for flight in old_flights:
                        flight.pk = None
                        flight.id = None
                        flight.package = new_package
                        flight.save()
                    
                    # Duplicate hotels
                    old_hotels = PackageHotel.objects.filter(package_id=old_package_id)
                    for hotel in old_hotels:
                        hotel.pk = None
                        hotel.id = None
                        hotel.package = new_package
                        hotel.save()
                
                # Duplicate itinerary items
                from apps.trips.models import ItineraryItem
                old_items = ItineraryItem.objects.filter(trip_id=old_trip_id)
                for item in old_items:
                    item.pk = None
                    item.id = None
                    item.trip = new_trip
                    item.save()
                
                # Duplicate guide sections
                from apps.trips.models import TripGuideSection
                old_sections = TripGuideSection.objects.filter(trip_id=old_trip_id)
                for section in old_sections:
                    section.pk = None
                    section.id = None
                    section.trip = new_trip
                    section.save()
                
                # Duplicate checklist items
                from apps.trips.models import ChecklistItem
                old_checklist = ChecklistItem.objects.filter(trip_id=old_trip_id)
                for item in old_checklist:
                    old_package_id = item.package_id
                    item.pk = None
                    item.id = None
                    item.trip = new_trip
                    # Map to new package if package-specific
                    if old_package_id and old_package_id in package_mapping:
                        item.package = package_mapping[old_package_id]
                    else:
                        item.package = None
                    item.save()
                
                # Duplicate emergency contacts
                from apps.trips.models import EmergencyContact
                old_contacts = EmergencyContact.objects.filter(trip_id=old_trip_id)
                for contact in old_contacts:
                    contact.pk = None
                    contact.id = None
                    contact.trip = new_trip
                    contact.save()
                
                # Duplicate FAQs
                from apps.trips.models import TripFAQ
                old_faqs = TripFAQ.objects.filter(trip_id=old_trip_id)
                for faq in old_faqs:
                    faq.pk = None
                    faq.id = None
                    faq.trip = new_trip
                    faq.save()
                
                duplicated_count += 1
                
        except Exception as e:
            messages.error(request, f"Error duplicating trip {trip.code}: {str(e)}")
            continue
    
    messages.success(
        request,
        f"Successfully duplicated {duplicated_count} trip(s) with all related data."
    )

duplicate_trip.short_description = "Duplicate selected trip(s) with all logistics"


def export_trip_roster(modeladmin, request, queryset):
    """
    Export trip roster as CSV.
    
    Includes all pilgrims with bookings for selected trip(s).
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="trip_roster.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Trip Code', 'Trip Name', 'Package', 
        'Pilgrim Name', 'Phone', 'Email', 'Nationality',
        'Date of Birth', 'Emergency Contact', 'Emergency Phone',
        'Booking Status', 'Ticket Number', 'Room Assignment',
        'Passport Number (Masked)', 'Passport Country', 'Passport Expiry'
    ])
    
    from apps.bookings.models import Booking
    from apps.common.encryption import mask_value
    
    for trip in queryset:
        bookings = Booking.objects.filter(
            package__trip=trip,
            status__in=['EOI', 'BOOKED']
        ).select_related(
            'pilgrim__user',
            'package'
        ).order_by('package__name', 'pilgrim__user__name')
        
        for booking in bookings:
            pilgrim = booking.pilgrim
            user = pilgrim.user
            
            # Get passport info
            passport = pilgrim.passports.first()
            passport_number = mask_value(passport.number) if passport else ''
            passport_country = passport.country if passport else ''
            passport_expiry = passport.expiry_date if passport else ''
            
            writer.writerow([
                trip.code,
                trip.name,
                booking.package.name,
                user.name,
                user.phone,
                user.email or '',
                pilgrim.nationality or '',
                pilgrim.dob or '',
                pilgrim.emergency_name or '',
                pilgrim.emergency_phone or '',
                booking.status,
                booking.ticket_number or '',
                booking.room_assignment or '',
                passport_number,
                passport_country,
                passport_expiry
            ])
    
    return response

export_trip_roster.short_description = "Export trip roster as CSV"


def export_flight_manifest(modeladmin, request, queryset):
    """
    Export flight manifest for selected trip(s).
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="flight_manifest.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Trip Code', 'Package', 'Leg', 'Carrier', 'Flight Number',
        'Departure Airport', 'Departure DateTime', 'Arrival Airport', 'Arrival DateTime',
        'PNR', 'Pilgrim Name', 'Ticket Number', 'Seat Assignment'
    ])
    
    from apps.bookings.models import Booking
    from apps.trips.models import PackageFlight
    
    for trip in queryset:
        # Get all packages for this trip
        packages = trip.packages.all()
        
        for package in packages:
            flights = PackageFlight.objects.filter(package=package).order_by('dep_dt')
            bookings = Booking.objects.filter(
                package=package,
                status='BOOKED'
            ).select_related('pilgrim__user')
            
            for flight in flights:
                for booking in bookings:
                    writer.writerow([
                        trip.code,
                        package.name,
                        flight.leg,
                        flight.carrier,
                        flight.flight_no,
                        flight.dep_airport,
                        flight.dep_dt,
                        flight.arr_airport,
                        flight.arr_dt,
                        flight.group_pnr or '',
                        booking.pilgrim.user.name,
                        booking.ticket_number or '',
                        ''  # Seat assignment (to be filled manually)
                    ])
    
    return response

export_flight_manifest.short_description = "Export flight manifest as CSV"


def export_hotel_rooming_list(modeladmin, request, queryset):
    """
    Export hotel rooming list for selected trip(s).
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="hotel_rooming_list.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Trip Code', 'Package', 'Hotel Name', 'Address', 'Room Type',
        'Check-In', 'Check-Out', 'Confirmation Number',
        'Pilgrim Name', 'Phone', 'Room Assignment'
    ])
    
    from apps.bookings.models import Booking
    from apps.trips.models import PackageHotel
    
    for trip in queryset:
        packages = trip.packages.all()
        
        for package in packages:
            hotels = PackageHotel.objects.filter(package=package).order_by('check_in')
            bookings = Booking.objects.filter(
                package=package,
                status='BOOKED'
            ).select_related('pilgrim__user')
            
            for hotel in hotels:
                for booking in bookings:
                    writer.writerow([
                        trip.code,
                        package.name,
                        hotel.name,
                        hotel.address,
                        hotel.room_type,
                        hotel.check_in,
                        hotel.check_out,
                        hotel.group_confirmation_no or '',
                        booking.pilgrim.user.name,
                        booking.pilgrim.user.phone,
                        booking.room_assignment or ''
                    ])
    
    return response

export_hotel_rooming_list.short_description = "Export hotel rooming list as CSV"

