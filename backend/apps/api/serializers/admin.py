"""
Serializers for admin/staff views.
These serializers are for the admin dashboard and include full CRUD operations.
"""
from rest_framework import serializers
from apps.trips.models import Trip, TripPackage, PackageFlight, PackageHotel, ItineraryItem
from apps.bookings.models import Booking
from apps.accounts.models import Account, PilgrimProfile
from apps.pilgrims.models import Passport, Visa
from apps.content.models import Dua


# ============================================================================
# TRIP SERIALIZERS (Admin)
# ============================================================================

class AdminTripPackageListSerializer(serializers.ModelSerializer):
    """Serializer for packages in trip list/detail."""
    
    class Meta:
        model = TripPackage
        fields = [
            'id', 'name', 'price_minor_units', 'currency',
            'capacity', 'visibility', 'created_at', 'updated_at'
        ]


class AdminTripListSerializer(serializers.ModelSerializer):
    """Serializer for trip list view (admin)."""
    
    packages = AdminTripPackageListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'name', 'cities', 'start_date', 'end_date',
            'visibility', 'created_at', 'updated_at', 'packages'
        ]


class AdminTripDetailSerializer(serializers.ModelSerializer):
    """Serializer for trip detail/create/update (admin)."""
    
    packages = AdminTripPackageListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'name', 'cities', 'start_date', 'end_date',
            'cover_image', 'visibility', 'operator_notes', 'created_at', 'updated_at',
            'packages'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'code': data['code'],
            'name': data['name'],
            'cities': data['cities'],
            'startDate': data['start_date'],
            'endDate': data['end_date'],
            'coverImage': data.get('cover_image'),
            'visibility': data['visibility'],
            'operatorNotes': data.get('operator_notes'),
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
            'packages': data['packages'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        # Map camelCase keys to snake_case
        mapped_data = {}
        field_mapping = {
            'startDate': 'start_date',
            'endDate': 'end_date',
            'coverImage': 'cover_image',
            'operatorNotes': 'operator_notes',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


# ============================================================================
# BOOKING SERIALIZERS (Admin)
# ============================================================================

class BookingPilgrimUserSerializer(serializers.ModelSerializer):
    """Nested user serializer for bookings."""
    
    class Meta:
        model = Account
        fields = ['id', 'name', 'phone', 'email']


class BookingPilgrimSerializer(serializers.ModelSerializer):
    """Nested pilgrim serializer for bookings."""
    
    user = BookingPilgrimUserSerializer(read_only=True)
    
    class Meta:
        model = PilgrimProfile
        fields = ['user', 'dob', 'gender', 'nationality']
    
    def to_representation(self, instance):
        """Convert to frontend format with id."""
        data = super().to_representation(instance)
        return {
            'id': str(instance.user_id),
            'user': data['user'],
            'dateOfBirth': data.get('dob'),
            'gender': data.get('gender'),
            'nationality': data.get('nationality'),
        }


class BookingPackageSerializer(serializers.ModelSerializer):
    """Nested package serializer for bookings."""
    
    trip = serializers.SerializerMethodField()
    
    class Meta:
        model = TripPackage
        fields = ['id', 'name', 'price_minor_units', 'currency', 'trip']
    
    def get_trip(self, obj):
        return {
            'id': str(obj.trip.id),
            'code': obj.trip.code,
            'name': obj.trip.name,
        }


class AdminBookingListSerializer(serializers.ModelSerializer):
    """Serializer for booking list view (admin)."""
    
    pilgrim_details = BookingPilgrimSerializer(source='pilgrim', read_only=True)
    package_details = BookingPackageSerializer(source='package', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference_number', 'pilgrim', 'package',
            'status', 'payment_status', 'amount_paid_minor_units',
            'currency', 'created_at', 'updated_at',
            'pilgrim_details', 'package_details'
        ]
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'referenceNumber': data['reference_number'],
            'pilgrim': str(data['pilgrim']),
            'package': str(data['package']),
            'status': data['status'],
            'paymentStatus': data['payment_status'],
            'amountPaidMinorUnits': data['amount_paid_minor_units'],
            'currency': data['currency'],
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
            'pilgrimDetails': data['pilgrim_details'],
            'packageDetails': data['package_details'],
        }


class AdminBookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for booking detail/create/update (admin)."""
    
    pilgrim_details = BookingPilgrimSerializer(source='pilgrim', read_only=True)
    package_details = BookingPackageSerializer(source='package', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference_number', 'pilgrim', 'package',
            'status', 'payment_status', 'amount_paid_minor_units',
            'currency', 'notes', 'created_at', 'updated_at',
            'pilgrim_details', 'package_details'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'reference_number': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'referenceNumber': data['reference_number'],
            'pilgrim': str(data['pilgrim']),
            'package': str(data['package']),
            'status': data['status'],
            'paymentStatus': data['payment_status'],
            'amountPaidMinorUnits': data['amount_paid_minor_units'],
            'currency': data['currency'],
            'notes': data.get('notes'),
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
            'pilgrimDetails': data['pilgrim_details'],
            'packageDetails': data['package_details'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'referenceNumber': 'reference_number',
            'paymentStatus': 'payment_status',
            'amountPaidMinorUnits': 'amount_paid_minor_units',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


# ============================================================================
# PILGRIM SERIALIZERS (Admin)
# ============================================================================

class PilgrimUserSerializer(serializers.ModelSerializer):
    """User data for pilgrim."""
    
    class Meta:
        model = Account
        fields = ['id', 'name', 'phone', 'email', 'is_active']


class AdminPilgrimListSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim list view (admin)."""
    
    user = PilgrimUserSerializer(read_only=True)
    bookings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'user', 'dob', 'gender', 'nationality', 'address',
            'emergency_name', 'emergency_phone', 'medical_conditions',
            'created_at', 'updated_at', 'bookings_count'
        ]
    
    def get_bookings_count(self, obj):
        from apps.bookings.models import Booking
        return Booking.objects.filter(pilgrim=obj).count()
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(instance.user_id),
            'user': data['user'],
            'dateOfBirth': data.get('dob'),
            'gender': data.get('gender'),
            'nationality': data.get('nationality'),
            'address': data.get('address'),
            'emergencyName': data.get('emergency_name'),
            'emergencyPhone': data.get('emergency_phone'),
            'medicalConditions': data.get('medical_conditions'),
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
            'bookingsCount': data['bookings_count'],
        }


class AdminPilgrimDetailSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim detail/update (admin)."""
    
    user = PilgrimUserSerializer(read_only=True)
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'user', 'dob', 'gender', 'nationality', 'address',
            'emergency_name', 'emergency_phone', 'medical_conditions',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(instance.user_id),
            'user': data['user'],
            'dateOfBirth': data.get('dob'),
            'gender': data.get('gender'),
            'nationality': data.get('nationality'),
            'address': data.get('address'),
            'emergencyName': data.get('emergency_name'),
            'emergencyPhone': data.get('emergency_phone'),
            'medicalConditions': data.get('medical_conditions'),
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        # Map camelCase keys to snake_case
        mapped_data = {}
        field_mapping = {
            'dateOfBirth': 'dob',
            'emergencyName': 'emergency_name',
            'emergencyPhone': 'emergency_phone',
            'medicalConditions': 'medical_conditions',
        }
        
        for key, value in data.items():
            # Skip read-only fields
            if key in ['id', 'user', 'createdAt', 'updatedAt']:
                continue
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


# ============================================================================
# DUA SERIALIZERS (Admin)
# ============================================================================

class AdminDuaSerializer(serializers.ModelSerializer):
    """Serializer for Dua CRUD (admin)."""
    
    class Meta:
        model = Dua
        fields = [
            'id', 'category', 'text_ar', 'text_en',
            'transliteration', 'source', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'category': data['category'],
            'textAr': data['text_ar'],
            'textEn': data['text_en'],
            'transliteration': data['transliteration'],
            'source': data['source'],
            'createdAt': data.get('created_at'),
            'updatedAt': data.get('updated_at'),
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'textAr': 'text_ar',
            'textEn': 'text_en',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


# ============================================================================
# PASSPORT & VISA SERIALIZERS (Admin)
# ============================================================================

class AdminPassportSerializer(serializers.ModelSerializer):
    """Serializer for passport CRUD (admin)."""
    
    class Meta:
        model = Passport
        fields = [
            'id', 'pilgrim', 'passport_no', 'issue_date', 'expiry_date',
            'issue_country', 'scanned_copy_public_id', 'created_at', 'updated_at'
        ]


class AdminVisaSerializer(serializers.ModelSerializer):
    """Serializer for visa CRUD (admin)."""
    
    class Meta:
        model = Visa
        fields = [
            'id', 'pilgrim', 'trip', 'status', 'visa_no', 'issue_date',
            'expiry_date', 'scanned_copy_public_id', 'created_at', 'updated_at'
        ]

