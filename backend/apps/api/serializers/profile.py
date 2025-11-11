"""
Serializers for pilgrim profile and related data.
"""
from rest_framework import serializers
from apps.accounts.models import PilgrimProfile
from apps.bookings.models import Booking


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
    emergency_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'name', 'phone', 'email',
            'full_name', 'dob', 'gender', 'nationality',
            'passport_number', 'address',
            'emergency_name', 'emergency_phone', 'emergency_relationship',
            'emergency_contact'
        ]
    
    def get_emergency_contact(self, obj):
        """Get emergency contact as a dict."""
        if obj.emergency_name or obj.emergency_phone:
            return {
                'name': obj.emergency_name,
                'phone': obj.emergency_phone,
                'relationship': obj.emergency_relationship,
            }
        return None
