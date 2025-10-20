"""
Serializers for trips, packages, and related data.
"""
from rest_framework import serializers
from apps.trips.models import (
    Trip, TripPackage, PackageFlight, PackageHotel,
    ItineraryItem, TripUpdate, TripGuideSection,
    ChecklistItem, EmergencyContact, TripFAQ
)
from apps.content.models import Dua


class TripListSerializer(serializers.ModelSerializer):
    """Serializer for trip list."""
    
    class Meta:
        model = Trip
        fields = ['id', 'code', 'name', 'cities', 'start_date', 'end_date']


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

