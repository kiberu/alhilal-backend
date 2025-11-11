"""
Serializers for trips, packages, and related data.
"""
from rest_framework import serializers
from apps.trips.models import (
    Trip, TripPackage, PackageFlight, PackageHotel,
    ItineraryItem, TripUpdate, TripGuideSection,
    ChecklistItem, EmergencyContact, TripFAQ
)
from apps.bookings.models import Booking
from apps.content.models import Dua


class TripListSerializer(serializers.ModelSerializer):
    """Serializer for trip list."""
    
    packages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = ['id', 'code', 'name', 'cities', 'start_date', 'end_date', 'cover_image', 'featured', 'packages_count']
    
    def get_packages_count(self, obj):
        """Get count of available packages."""
        return obj.packages.filter(visibility='PUBLIC').count()


class TripDetailSerializer(serializers.ModelSerializer):
    """Serializer for trip details."""
    
    packages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'name', 'cities',
            'start_date', 'end_date', 'visibility',
            'packages_count'
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
    
    class Meta:
        model = TripPackage
        fields = [
            'id', 'name', 'price_minor_units', 'currency',
            'capacity', 'flights', 'hotels'
        ]


class ItineraryItemSerializer(serializers.ModelSerializer):
    """Serializer for itinerary items."""
    
    attach_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = ItineraryItem
        fields = [
            'id', 'day_index', 'start_time', 'end_time',
            'title', 'location', 'notes', 'attach_url_signed'
        ]
    
    def get_attach_url_signed(self, obj):
        """Get signed URL for attachment."""
        if not obj.attach_public_id:
            return None
        
        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.attach_public_id, expires_in=600)


class TripUpdateSerializer(serializers.ModelSerializer):
    """Serializer for trip updates."""
    
    package_name = serializers.CharField(source='package.name', read_only=True, allow_null=True)
    attach_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = TripUpdate
        fields = [
            'id', 'title', 'body_md', 'urgency', 'pinned',
            'publish_at', 'package_name', 'attach_url_signed',
            'created_at'
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
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'name', 'cities', 'start_date', 'end_date',
            'cover_image', 'featured', 'packages', 'itinerary',
            'has_itinerary', 'faqs', 'guide_sections', 'emergency_contacts'
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
            'id', 'reference_number', 'package_id', 'trip_name', 'trip_code', 'trip_date',
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

