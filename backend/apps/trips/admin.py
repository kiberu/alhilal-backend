from django.contrib import admin
from .models import (
    Trip, TripPackage, PackageFlight, PackageHotel,
    ItineraryItem, TripUpdate, TripGuideSection,
    ChecklistItem, EmergencyContact, TripFAQ
)
from .admin_actions import (
    duplicate_trip, export_trip_roster,
    export_flight_manifest, export_hotel_rooming_list
)


class PackageFlightInline(admin.TabularInline):
    model = PackageFlight
    extra = 1
    fields = ['leg', 'carrier', 'flight_no', 'dep_airport', 'dep_dt', 'arr_airport', 'arr_dt', 'group_pnr']


class PackageHotelInline(admin.TabularInline):
    model = PackageHotel
    extra = 1
    fields = ['name', 'address', 'room_type', 'check_in', 'check_out', 'group_confirmation_no']
    verbose_name = 'Hotel/Accommodation'
    verbose_name_plural = 'Hotels/Accommodations'


class TripPackageInline(admin.TabularInline):
    model = TripPackage
    extra = 0
    fields = ['name', 'capacity', 'price_minor_units', 'currency', 'visibility']


class ItineraryItemInline(admin.StackedInline):
    model = ItineraryItem
    extra = 0
    fields = ['day_index', 'title', 'location', 'start_time', 'end_time', 'notes']


class TripUpdateInline(admin.StackedInline):
    model = TripUpdate
    extra = 0
    fields = ['title', 'urgency', 'pinned', 'publish_at', 'package']


class TripGuideSectionInline(admin.StackedInline):
    model = TripGuideSection
    extra = 0
    fields = ['order', 'title', 'content_md']


class ChecklistItemInline(admin.TabularInline):
    model = ChecklistItem
    extra = 0
    fields = ['category', 'label', 'is_required', 'package']


class EmergencyContactInline(admin.TabularInline):
    model = EmergencyContact
    extra = 1
    fields = ['label', 'phone', 'hours']


class TripFAQInline(admin.StackedInline):
    model = TripFAQ
    extra = 0
    fields = ['order', 'question', 'answer']


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Admin for Trip model."""
    
    list_display = ['code', 'name', 'start_date', 'end_date', 'visibility', 'featured', 'created_at']
    list_filter = ['visibility', 'featured', 'start_date']
    search_fields = ['code', 'name']
    readonly_fields = ['created_at', 'updated_at']
    actions = [
        duplicate_trip,
        export_trip_roster,
        export_flight_manifest,
        export_hotel_rooming_list
    ]
    
    inlines = [
        TripPackageInline,
        ItineraryItemInline,
        TripUpdateInline,
        TripGuideSectionInline,
        ChecklistItemInline,
        EmergencyContactInline,
        TripFAQInline,
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'cities', 'visibility', 'featured', 'cover_image')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Notes', {
            'fields': ('operator_notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TripPackage)
class TripPackageAdmin(admin.ModelAdmin):
    """Admin for TripPackage model."""
    
    list_display = ['trip', 'name', 'capacity', 'price_minor_units', 'currency', 'visibility']
    list_filter = ['visibility', 'trip']
    search_fields = ['name', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [PackageFlightInline, PackageHotelInline]


@admin.register(PackageFlight)
class PackageFlightAdmin(admin.ModelAdmin):
    """Admin for PackageFlight model."""
    
    list_display = ['package', 'leg', 'carrier', 'flight_no', 'dep_airport', 'dep_dt', 'arr_airport', 'arr_dt']
    list_filter = ['leg', 'carrier']
    search_fields = ['flight_no', 'carrier', 'package__trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PackageHotel)
class PackageHotelAdmin(admin.ModelAdmin):
    """Admin for PackageHotel model."""
    
    list_display = ['name', 'package', 'check_in', 'check_out', 'room_type', 'nights']
    list_filter = ['package__trip', 'check_in']
    search_fields = ['name', 'address', 'package__trip__code', 'package__name']
    readonly_fields = ['created_at', 'updated_at', 'nights']
    
    fieldsets = (
        ('Hotel Information', {
            'fields': ('package', 'name', 'address', 'room_type')
        }),
        ('Stay Dates', {
            'fields': ('check_in', 'check_out', 'nights')
        }),
        ('Booking Details', {
            'fields': ('group_confirmation_no',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def nights(self, obj):
        """Calculate number of nights."""
        if obj.check_in and obj.check_out:
            delta = obj.check_out - obj.check_in
            return f"{delta.days} nights"
        return '-'
    nights.short_description = 'Duration'


@admin.register(ItineraryItem)
class ItineraryItemAdmin(admin.ModelAdmin):
    """Admin for ItineraryItem model."""
    
    list_display = ['trip', 'day_index', 'title', 'location', 'start_time']
    list_filter = ['trip']
    search_fields = ['title', 'location', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TripUpdate)
class TripUpdateAdmin(admin.ModelAdmin):
    """Admin for TripUpdate model."""
    
    list_display = ['trip', 'title', 'urgency', 'pinned', 'publish_at']
    list_filter = ['urgency', 'pinned', 'trip']
    search_fields = ['title', 'body_md', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TripGuideSection)
class TripGuideSectionAdmin(admin.ModelAdmin):
    """Admin for TripGuideSection model."""
    
    list_display = ['trip', 'order', 'title']
    list_filter = ['trip']
    search_fields = ['title', 'content_md', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    """Admin for ChecklistItem model."""
    
    list_display = ['trip', 'package', 'category', 'label', 'is_required']
    list_filter = ['category', 'is_required', 'trip']
    search_fields = ['label', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    """Admin for EmergencyContact model."""
    
    list_display = ['trip', 'label', 'phone', 'hours']
    list_filter = ['trip']
    search_fields = ['label', 'phone', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TripFAQ)
class TripFAQAdmin(admin.ModelAdmin):
    """Admin for TripFAQ model."""
    
    list_display = ['trip', 'question_preview', 'order']
    list_filter = ['trip']
    search_fields = ['question', 'answer', 'trip__code']
    readonly_fields = ['created_at', 'updated_at']
    
    def question_preview(self, obj):
        return obj.question[:100] + '...' if len(obj.question) > 100 else obj.question
    question_preview.short_description = 'Question'

