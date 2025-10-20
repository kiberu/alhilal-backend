"""
Serializers for pilgrim profile and related data.
"""
from rest_framework import serializers
from apps.accounts.models import PilgrimProfile
from apps.pilgrims.models import Passport, Visa
from apps.bookings.models import Booking
from apps.common.encryption import mask_value


class PassportSerializer(serializers.ModelSerializer):
    """Serializer for passport with masked number."""
    
    number_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = Passport
        fields = ['id', 'country', 'expiry_date', 'number_masked', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_number_masked(self, obj):
        """Return masked passport number."""
        try:
            # Get the actual number (will be decrypted by the field)
            number = obj.number
            return mask_value(number, visible_chars=4)
        except Exception:
            return "****"


class VisaSerializer(serializers.ModelSerializer):
    """Serializer for visa information."""
    
    trip_code = serializers.CharField(source='trip.code', read_only=True)
    trip_name = serializers.CharField(source='trip.name', read_only=True)
    doc_url_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = Visa
        fields = [
            'id', 'trip_code', 'trip_name', 'status', 
            'ref_no', 'issue_date', 'expiry_date',
            'doc_url_signed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_doc_url_signed(self, obj):
        """Get signed URL for visa document."""
        if not obj.doc_public_id:
            return None
        
        from apps.common.cloudinary import signed_delivery
        return signed_delivery(obj.doc_public_id, expires_in=600)


class BookingSummarySerializer(serializers.ModelSerializer):
    """Serializer for booking summary."""
    
    trip = serializers.SerializerMethodField()
    package = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'trip', 'package', 'status',
            'ticket_number', 'room_assignment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_trip(self, obj):
        """Get trip summary."""
        trip = obj.package.trip
        return {
            'id': str(trip.id),
            'code': trip.code,
            'name': trip.name,
            'start_date': trip.start_date,
            'end_date': trip.end_date,
            'cities': trip.cities
        }
    
    def get_package(self, obj):
        """Get package summary."""
        package = obj.package
        return {
            'id': str(package.id),
            'name': package.name,
            'price_minor_units': package.price_minor_units,
            'currency': package.currency
        }


class PilgrimProfileSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim profile."""
    
    name = serializers.CharField(source='user.name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    passport = serializers.SerializerMethodField()
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'name', 'phone', 'email',
            'dob', 'nationality',
            'emergency_name', 'emergency_phone',
            'passport'
        ]
    
    def get_passport(self, obj):
        """Get passport summary (if exists)."""
        passport = obj.passports.first()
        if passport:
            return PassportSerializer(passport).data
        return None

