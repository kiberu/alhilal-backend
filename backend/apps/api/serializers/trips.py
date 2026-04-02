"""
Serializers for trips, packages, and related data.
"""
from rest_framework import serializers
from apps.trips.models import (
    Trip, TripPackage, PackageFlight, PackageHotel,
    ItineraryItem, TripUpdate, TripGuideSection,
    ChecklistItem, EmergencyContact, TripFAQ,
    TripMilestone, TripResource
)
from apps.bookings.models import Booking
from apps.content.models import Dua
from apps.pilgrims.models import PilgrimReadiness


class TripListSerializer(serializers.ModelSerializer):
    """Serializer for trip list."""
    
    packages_count = serializers.SerializerMethodField()
    starting_price_minor_units = serializers.SerializerMethodField()
    starting_price_currency = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id',
            'code',
            'name',
            'slug',
            'excerpt',
            'seo_title',
            'seo_description',
            'cities',
            'commercial_month_label',
            'status',
            'default_nights',
            'starting_price_minor_units',
            'starting_price_currency',
            'start_date',
            'end_date',
            'cover_image',
            'featured',
            'packages_count',
            'updated_at',
        ]
    
    def get_packages_count(self, obj):
        """Get count of available packages."""
        return obj.packages.filter(visibility='PUBLIC').count()

    def get_starting_price_minor_units(self, obj):
        """Return the lowest truthful public package price."""
        package = obj.packages.filter(visibility='PUBLIC', price_minor_units__isnull=False).order_by('price_minor_units').select_related('currency').first()
        return package.price_minor_units if package else None

    def get_starting_price_currency(self, obj):
        """Return the currency for the lowest truthful public package price."""
        package = obj.packages.filter(visibility='PUBLIC', price_minor_units__isnull=False).order_by('price_minor_units').select_related('currency').first()
        if not package or not package.currency:
            return None
        return package.currency.code


class TripDetailSerializer(serializers.ModelSerializer):
    """Serializer for trip details."""
    
    packages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'family_code', 'commercial_month_label', 'name', 'cities',
            'status', 'sales_open_date', 'default_nights',
            'start_date', 'end_date', 'visibility',
            'packages_count', 'updated_at'
        ]
    
    def get_packages_count(self, obj):
        """Get count of available packages."""
        return obj.packages.filter(visibility='PUBLIC').count()


class FlightSerializer(serializers.ModelSerializer):
    """Serializer for package flights."""
    
    class Meta:
        model = PackageFlight
        fields = [
            'id', 'leg', 'carrier', 'flight_no',
            'dep_airport', 'dep_dt', 'arr_airport', 'arr_dt',
            'group_pnr'
        ]


class HotelSerializer(serializers.ModelSerializer):
    """Serializer for package hotels."""
    
    class Meta:
        model = PackageHotel
        fields = [
            'id', 'name', 'address', 'room_type',
            'check_in', 'check_out', 'group_confirmation_no'
        ]


class TripPackageSerializer(serializers.ModelSerializer):
    """Serializer for trip package."""
    
    flights = FlightSerializer(many=True, read_only=True)
    hotels = HotelSerializer(many=True, read_only=True)
    currency = serializers.CharField(source='currency.code', read_only=True)
    start_date = serializers.DateField(source='effective_start_date', read_only=True)
    end_date = serializers.DateField(source='effective_end_date', read_only=True)
    nights = serializers.IntegerField(source='effective_nights', read_only=True)
    
    class Meta:
        model = TripPackage
        fields = [
            'id', 'package_code', 'name', 'start_date', 'end_date', 'nights',
            'price_minor_units', 'currency', 'capacity', 'sales_target',
            'hotel_booking_month', 'airline_booking_month', 'status',
            'flights', 'hotels'
        ]


class ItineraryItemSerializer(serializers.ModelSerializer):
    """Serializer for itinerary items."""
    
    attach_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = ItineraryItem
        fields = [
            'id', 'day_index', 'start_time', 'end_time',
            'title', 'location', 'notes', 'attach_url_signed', 'updated_at'
        ]
    
    def get_attach_url_signed(self, obj):
        """Get signed URL for attachment."""
        if not obj.attach_public_id:
            return None
        
        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.attach_public_id, expires_in=600)


class TripUpdateSerializer(serializers.ModelSerializer):
    """Serializer for trip updates."""
    
    trip_id = serializers.CharField(source='trip.id', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True, allow_null=True)
    attach_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = TripUpdate
        fields = [
            'id', 'trip_id', 'title', 'body_md', 'urgency', 'pinned',
            'publish_at', 'package_name', 'attach_url_signed',
            'created_at', 'updated_at'
        ]
    
    def get_attach_url_signed(self, obj):
        """Get signed URL for attachment."""
        if not obj.attach_public_id:
            return None
        
        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.attach_public_id, expires_in=600)


class GuideSectionSerializer(serializers.ModelSerializer):
    """Serializer for guide sections."""
    
    attach_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = TripGuideSection
        fields = ['id', 'order', 'title', 'content_md', 'attach_url_signed']
    
    def get_attach_url_signed(self, obj):
        """Get signed URL for attachment."""
        if not obj.attach_public_id:
            return None
        
        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.attach_public_id, expires_in=600)


class ChecklistItemSerializer(serializers.ModelSerializer):
    """Serializer for checklist items."""
    
    package_name = serializers.CharField(source='package.name', read_only=True, allow_null=True)
    
    class Meta:
        model = ChecklistItem
        fields = [
            'id', 'label', 'category', 'is_required',
            'link_url', 'package_name'
        ]


class TripMilestoneSerializer(serializers.ModelSerializer):
    """Serializer for public or pilgrim-visible milestones."""

    package_name = serializers.CharField(source='package.name', read_only=True, allow_null=True)

    class Meta:
        model = TripMilestone
        fields = [
            'id', 'milestone_type', 'title', 'status',
            'target_date', 'actual_date', 'notes', 'package_name', 'updated_at'
        ]


class TripResourceSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim-facing trip resources."""

    package_name = serializers.CharField(source='package.name', read_only=True, allow_null=True)
    file_url_signed = serializers.SerializerMethodField()

    class Meta:
        model = TripResource
        fields = [
            'id', 'title', 'description', 'resource_type', 'viewer_mode',
            'is_pinned', 'published_at', 'file_format', 'metadata',
            'package_name', 'file_url_signed', 'updated_at'
        ]

    def get_file_url_signed(self, obj):
        """Get signed URL for the resource file."""
        if not obj.file_public_id:
            return None

        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.file_public_id, expires_in=600)


class PilgrimTripReadinessSerializer(serializers.ModelSerializer):
    """Serializer for a pilgrim's travel-readiness state."""

    booking_reference = serializers.CharField(source='booking.reference_number', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    trip_code = serializers.CharField(source='trip.code', read_only=True)
    payment_target_percent = serializers.IntegerField(default=PilgrimReadiness.PAYMENT_TARGET_PERCENT, read_only=True)
    checks = serializers.SerializerMethodField()
    missing_items = serializers.SerializerMethodField()
    blockers = serializers.SerializerMethodField()

    class Meta:
        model = PilgrimReadiness
        fields = [
            'id',
            'booking_reference',
            'trip_code',
            'package_name',
            'status',
            'ready_for_travel',
            'payment_progress_percent',
            'payment_target_percent',
            'validated_at',
            'checks',
            'missing_items',
            'blockers',
            'updated_at',
        ]

    def get_checks(self, obj):
        """Return the component checks that make up the readiness pass."""
        return {
            'profile_complete': obj.profile_complete,
            'passport_valid': obj.passport_valid,
            'visa_verified': obj.visa_verified,
            'documents_complete': obj.documents_complete,
            'payment_target_met': obj.payment_target_met,
            'ticket_issued': obj.ticket_issued,
            'darasa_one_completed': obj.darasa_one_completed,
            'darasa_two_completed': obj.darasa_two_completed,
            'send_off_completed': obj.send_off_completed,
        }

    def get_missing_items(self, obj):
        """Return the outstanding requirements for the pilgrim."""
        return obj.get_missing_requirements()

    def get_blockers(self, obj):
        """Return explicit blockers that need staff intervention."""
        return obj.get_blockers()


class EmergencyContactSerializer(serializers.ModelSerializer):
    """Serializer for emergency contacts."""
    
    class Meta:
        model = EmergencyContact
        fields = ['id', 'label', 'phone', 'hours', 'notes']


class TripFAQSerializer(serializers.ModelSerializer):
    """Serializer for trip FAQs."""
    
    class Meta:
        model = TripFAQ
        fields = ['id', 'question', 'answer', 'order']


class TripEssentialsSerializer(serializers.Serializer):
    """Composite serializer for trip essentials."""
    
    sections = GuideSectionSerializer(many=True)
    checklist = ChecklistItemSerializer(many=True)
    contacts = EmergencyContactSerializer(many=True)
    faqs = TripFAQSerializer(many=True)
    milestones = TripMilestoneSerializer(many=True)
    resources = TripResourceSerializer(many=True)


class DuaSerializer(serializers.ModelSerializer):
    """Serializer for duas."""
    
    class Meta:
        model = Dua
        fields = [
            'id', 'category', 'text_ar', 'text_en',
            'transliteration', 'source'
        ]


class PublicTripDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for public trip details."""
    
    packages = serializers.SerializerMethodField()
    itinerary = serializers.SerializerMethodField()
    faqs = TripFAQSerializer(many=True, read_only=True)
    guide_sections = GuideSectionSerializer(many=True, read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    has_itinerary = serializers.SerializerMethodField()
    milestones = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'family_code', 'commercial_month_label', 'name', 'slug', 'excerpt', 'seo_title', 'seo_description',
            'cities', 'status', 'default_nights', 'start_date', 'end_date',
            'cover_image', 'featured', 'packages', 'itinerary',
            'has_itinerary', 'faqs', 'guide_sections', 'emergency_contacts', 'milestones'
        ]
    
    def get_packages(self, obj):
        """Get public packages with their details."""
        packages = obj.packages.filter(visibility='PUBLIC')
        return TripPackageSerializer(packages, many=True).data
    
    def get_itinerary(self, obj):
        """Get itinerary items."""
        items = obj.itinerary_items.all().order_by('day_index', 'start_time')
        return ItineraryItemSerializer(items, many=True).data
    
    def get_has_itinerary(self, obj):
        """Check if trip has itinerary."""
        return obj.itinerary_items.exists()

    def get_milestones(self, obj):
        """Return only public milestones that can support truthful proof on the website."""
        milestones = obj.milestones.filter(is_public=True).order_by('target_date', 'order', 'created_at')
        return TripMilestoneSerializer(milestones, many=True).data


# ==================== Booking Serializers ====================

class PilgrimBookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for pilgrims to create bookings."""
    
    class Meta:
        model = Booking
        fields = ['id', 'package', 'special_needs']
        read_only_fields = ['id']
    
    def validate_package(self, value):
        """Validate package exists and is public."""
        if value.visibility != 'PUBLIC':
            raise serializers.ValidationError("This package is not available for booking.")
        
        # Check if package has capacity and is full
        if value.capacity:
            booked_count = Booking.objects.filter(
                package=value,
                status__in=['EOI', 'BOOKED', 'CONFIRMED']
            ).count()
            
            if booked_count >= value.capacity:
                raise serializers.ValidationError("This package is fully booked.")
        
        return value
    
    def create(self, validated_data):
        """Create booking with EOI status for authenticated user."""
        request = self.context.get('request')
        user = request.user
        
        # Get or create pilgrim profile
        from apps.accounts.models import PilgrimProfile
        pilgrim = PilgrimProfile.objects.filter(user=user).first()
        
        if not pilgrim:
            if user.role == 'STAFF':
                raise serializers.ValidationError(
                    "Staff users need a pilgrim profile to create bookings. "
                    "Please complete your profile or use the admin dashboard to create bookings."
                )
            else:
                raise serializers.ValidationError("You must complete your profile before booking.")
        
        # Check for duplicate booking (same pilgrim, same package, not cancelled)
        existing = Booking.objects.filter(
            pilgrim=pilgrim,
            package=validated_data['package'],
        ).exclude(status='CANCELLED').first()
        
        if existing:
            raise serializers.ValidationError(
                f"You already have a booking for this package (Reference: {existing.reference_number})."
            )
        
        # Create booking with EOI status
        booking = Booking.objects.create(
            pilgrim=pilgrim,
            status='EOI',  # Expression of Interest
            **validated_data
        )
        
        return booking


class PilgrimBookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for viewing booking details by pilgrims."""
    
    package_id = serializers.CharField(source='package.id', read_only=True)
    trip_id = serializers.CharField(source='package.trip.id', read_only=True)
    trip_name = serializers.CharField(source='package.trip.name', read_only=True)
    trip_code = serializers.CharField(source='package.trip.code', read_only=True)
    trip_date = serializers.DateField(source='package.trip.start_date', read_only=True)
    package_name = serializers.CharField(source='package.name', read_only=True)
    package_price = serializers.IntegerField(source='package.price_minor_units', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    balance_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference_number', 'package_id', 'trip_id', 'trip_name', 'trip_code', 'trip_date',
            'package_name', 'package_price', 'currency_code', 'status',
            'payment_status', 'amount_paid_minor_units', 'balance_due',
            'special_needs', 'ticket_number', 'room_assignment',
            'created_at', 'updated_at'
        ]
    
    def get_balance_due(self, obj):
        """Calculate balance due."""
        package_price = obj.package.price_minor_units or 0
        amount_paid = obj.amount_paid_minor_units or 0
        return max(0, package_price - amount_paid)
