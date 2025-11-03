"""
Serializers for admin/staff views.
These serializers are for the admin dashboard and include full CRUD operations.
"""
from rest_framework import serializers
from apps.trips.models import (
    Trip, TripPackage, PackageFlight, PackageHotel, ItineraryItem,
    TripUpdate, TripGuideSection, ChecklistItem, EmergencyContact, TripFAQ
)
from apps.bookings.models import Booking, Payment
from apps.accounts.models import Account, PilgrimProfile, StaffProfile
from apps.pilgrims.models import Passport, Visa
from apps.content.models import Dua
from apps.common.models import Currency


# ============================================================================
# CURRENCY SERIALIZERS
# ============================================================================

class CurrencySerializer(serializers.ModelSerializer):
    """Serializer for Currency model."""
    
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol', 'is_active']


# ============================================================================
# TRIP SERIALIZERS (Admin)
# ============================================================================

class AdminTripPackageListSerializer(serializers.ModelSerializer):
    """Serializer for packages in trip list/detail."""
    currency = CurrencySerializer(read_only=True)
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(),
        source='currency',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = TripPackage
        fields = [
            'id', 'name', 'price_minor_units', 'currency', 'currency_id',
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
    booking_stats = serializers.SerializerMethodField()
    itinerary = serializers.SerializerMethodField()
    guide_sections = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'code', 'name', 'cities', 'start_date', 'end_date',
            'cover_image', 'visibility', 'operator_notes', 'created_at', 'updated_at',
            'packages', 'booking_stats', 'itinerary', 'guide_sections'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def get_booking_stats(self, obj):
        """Get booking statistics for this trip."""
        from apps.bookings.models import Booking
        from django.db.models import Count, Q
        
        # Get all bookings for packages in this trip
        bookings = Booking.objects.filter(package__trip=obj)
        
        stats = bookings.aggregate(
            total=Count('id'),
            eoi_count=Count('id', filter=Q(status='EOI')),
            booked_count=Count('id', filter=Q(status='BOOKED')),
            confirmed_count=Count('id', filter=Q(status='CONFIRMED'))
        )
        
        return {
            'total': stats['total'] or 0,
            'eoiCount': stats['eoi_count'] or 0,
            'bookedCount': stats['booked_count'] or 0,
            'confirmedCount': stats['confirmed_count'] or 0
        }
    
    def get_itinerary(self, obj):
        """Get itinerary items for this trip."""
        from apps.trips.models import ItineraryItem
        items = ItineraryItem.objects.filter(trip=obj).order_by('day_index', 'start_time')
        return [{
            'id': str(item.id),
            'dayNumber': item.day_index,
            'startTime': item.start_time.strftime('%H:%M') if item.start_time else None,
            'endTime': item.end_time.strftime('%H:%M') if item.end_time else None,
            'title': item.title,
            'description': item.notes,
            'location': item.location
        } for item in items]
    
    def get_guide_sections(self, obj):
        """Get guide sections for this trip."""
        from apps.trips.models import TripGuideSection
        sections = TripGuideSection.objects.filter(trip=obj).order_by('order')
        return [{
            'id': str(section.id),
            'title': section.title,
            'content': section.content,
            'order': section.order
        } for section in sections]
    
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
            'bookingStats': data['booking_stats'],
            'itinerary': data['itinerary'],
            'guideSections': data['guide_sections'],
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
    full_name_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'user', 'full_name', 'passport_number', 'phone', 'full_name_display',
            'dob', 'gender', 'nationality', 'address',
            'emergency_name', 'emergency_phone', 'medical_conditions',
            'created_at', 'updated_at', 'bookings_count'
        ]
    
    def get_full_name_display(self, obj):
        """Get full name from profile or user."""
        return obj.full_name or obj.user.name
    
    def get_bookings_count(self, obj):
        from apps.bookings.models import Booking
        return Booking.objects.filter(pilgrim=obj).count()
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(instance.user_id),
            'user': data['user'],
            'fullName': data.get('full_name_display'),
            'passportNumber': data.get('passport_number'),
            'phone': data.get('phone'),
            'dateOfBirth': data.get('dob'),
            'gender': data.get('gender'),
            'nationality': data.get('nationality'),
            'address': data.get('address'),
            'emergencyName': data.get('emergency_name'),
            'emergencyPhone': data.get('emergency_phone'),
            'medicalConditions': data.get('medical_conditions'),
            'created_at': data['created_at'],
            'updated_at': data['updated_at'],
            'bookingsCount': data['bookings_count'],
        }


class AdminPilgrimCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating pilgrims (admin) - no user account required."""
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'full_name', 'passport_number', 'phone',
            'dob', 'gender', 'nationality', 'address',
            'emergency_name', 'emergency_phone', 'emergency_relationship',
            'medical_conditions'
        ]
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        field_mapping = {
            'fullName': 'full_name',
            'passportNumber': 'passport_number',
            'dateOfBirth': 'dob',
            'emergencyName': 'emergency_name',
            'emergencyPhone': 'emergency_phone',
            'emergencyRelationship': 'emergency_relationship',
            'medicalConditions': 'medical_conditions',
        }
        
        mapped_data = {}
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase) with proper ID."""
        from apps.accounts.models import Account
        user_data = None
        if instance.user:
            user_data = {
                'id': str(instance.user.id),
                'name': instance.user.name,
                'phone': instance.user.phone,
                'email': instance.user.email or None,
                'isActive': instance.user.is_active,
            }
        
        return {
            'id': str(instance.user_id),
            'user': user_data,
            'fullName': instance.full_name,
            'passportNumber': instance.passport_number,
            'phone': instance.phone,
            'dateOfBirth': str(instance.dob) if instance.dob else None,
            'gender': instance.gender,
            'nationality': instance.nationality,
            'address': instance.address,
            'emergencyName': instance.emergency_name,
            'emergencyPhone': instance.emergency_phone,
            'emergencyRelationship': instance.emergency_relationship,
            'medicalConditions': instance.medical_conditions,
            'createdAt': instance.created_at.isoformat() if instance.created_at else None,
            'updatedAt': instance.updated_at.isoformat() if instance.updated_at else None,
        }
    
    def create(self, validated_data):
        """Create pilgrim with created_by set to current user."""
        request = self.context.get('request')
        
        # Extract required fields
        full_name = validated_data.get('full_name')
        phone = validated_data.get('phone')
        
        if not full_name or not phone:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'full_name and phone are required'})
        
        # Set created_by
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        # Create a temporary user account for the pilgrim (for now)
        # This allows the pilgrim to exist in the system
        from apps.accounts.models import Account
        
        # Check if user already exists
        user, user_created = Account.objects.get_or_create(
            phone=phone,
            defaults={
                'name': full_name,
                'role': 'PILGRIM'
            }
        )
        
        # Create pilgrim profile
        pilgrim = PilgrimProfile.objects.create(
            user=user,
            **validated_data
        )
        
        return pilgrim


class AdminPilgrimDetailSerializer(serializers.ModelSerializer):
    """Serializer for pilgrim detail/update (admin)."""
    
    user = PilgrimUserSerializer(read_only=True)
    bookings = serializers.SerializerMethodField()
    passport = serializers.SerializerMethodField()
    visas = serializers.SerializerMethodField()
    
    class Meta:
        model = PilgrimProfile
        fields = [
            'user', 'full_name', 'passport_number', 'phone',
            'dob', 'gender', 'nationality', 'address',
            'emergency_name', 'emergency_phone', 'emergency_relationship',
            'medical_conditions',
            'created_at', 'updated_at', 'bookings', 'passport', 'visas'
        ]
        extra_kwargs = {
            'passport_number': {'read_only': True},  # Cannot change passport number
            'phone': {'read_only': True},  # Cannot change phone
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def get_bookings(self, obj):
        """Get bookings for this pilgrim."""
        from apps.bookings.models import Booking
        bookings = Booking.objects.filter(pilgrim=obj).select_related('package__trip')
        return AdminBookingListSerializer(bookings, many=True).data
    
    def get_passport(self, obj):
        """Get passport for this pilgrim."""
        from apps.pilgrims.models import Passport
        try:
            passport = Passport.objects.filter(pilgrim=obj).first()
            if passport:
                return {
                    'id': str(passport.id),
                    'number': passport.passport_no,
                    'expiryDate': str(passport.expiry_date) if passport.expiry_date else None,
                    'country': passport.issue_country or None,
                }
        except:
            pass
        return None
    
    def get_visas(self, obj):
        """Get visas for this pilgrim."""
        from apps.pilgrims.models import Visa
        visas = Visa.objects.filter(pilgrim=obj)
        visa_list = []
        for visa in visas:
            visa_list.append({
                'id': str(visa.id),
                'number': visa.visa_no,
                'visaType': visa.status,  # Note: The model has 'status' field for visa type
                'status': visa.status,
                'expiryDate': str(visa.expiry_date) if visa.expiry_date else None,
            })
        return visa_list
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        
        # Prepare userDetails that matches frontend expectations
        user_details = None
        if data.get('user'):
            user_details = {
                'id': data['user']['id'],
                'name': data.get('full_name') or data['user']['name'],
                'phone': data.get('phone') or data['user']['phone'],
                'email': data['user'].get('email'),
                'isActive': data['user'].get('is_active', True),  # Access snake_case field
            }
        
        return {
            'id': str(instance.user_id),
            'user': data['user'],
            'userDetails': user_details,  # Add this for compatibility with frontend
            'fullName': data.get('full_name'),
            'passportNumber': data.get('passport_number'),
            'phone': data.get('phone'),
            'dateOfBirth': data.get('dob'),
            'gender': data.get('gender'),
            'nationality': data.get('nationality'),
            'address': data.get('address'),
            'emergencyName': data.get('emergency_name'),
            'emergencyPhone': data.get('emergency_phone'),
            'emergencyRelationship': data.get('emergency_relationship'),
            'emergencyContact': f"{data.get('emergency_name')} ({data.get('emergency_phone')})" if data.get('emergency_name') and data.get('emergency_phone') else None,
            'medicalConditions': data.get('medical_conditions'),
            'medicalInfo': data.get('medical_conditions'),  # Alias for compatibility
            'created_at': data['created_at'],
            'updated_at': data['updated_at'],
            'bookings': data.get('bookings', []),
            'passport': data.get('passport'),
            'visas': data.get('visas', []),
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        # Map camelCase keys to snake_case
        mapped_data = {}
        field_mapping = {
            'fullName': 'full_name',
            'passportNumber': 'passport_number',
            'dateOfBirth': 'dob',
            'emergencyName': 'emergency_name',
            'emergencyPhone': 'emergency_phone',
            'emergencyRelationship': 'emergency_relationship',
            'medicalConditions': 'medical_conditions',
        }
        
        for key, value in data.items():
            # Skip read-only fields
            if key in ['id', 'user', 'passportNumber', 'phone', 'createdAt', 'updatedAt']:
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
            'pilgrim': str(data['pilgrim']),
            'passportNumber': data.get('passport_no'),
            'issueDate': data.get('issue_date'),
            'expiryDate': data.get('expiry_date'),
            'issueCountry': data.get('issue_country'),
            'scannedCopyPublicId': data.get('scanned_copy_public_id'),
            'documentPublicId': data.get('scanned_copy_public_id'),  # Alias
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'passportNumber': 'passport_no',
            'issueDate': 'issue_date',
            'expiryDate': 'expiry_date',
            'issueCountry': 'issue_country',
            'scannedCopyPublicId': 'scanned_copy_public_id',
            'documentPublicId': 'scanned_copy_public_id',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


class AdminVisaSerializer(serializers.ModelSerializer):
    """Serializer for visa CRUD (admin)."""
    
    class Meta:
        model = Visa
        fields = [
            'id', 'pilgrim', 'trip', 'status', 'visa_no', 'issue_date',
            'expiry_date', 'scanned_copy_public_id', 'created_at', 'updated_at'
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
            'pilgrim': str(data['pilgrim']),
            'trip': str(data['trip']),
            'status': data['status'],
            'visaNumber': data.get('visa_no'),
            'issueDate': data.get('issue_date'),
            'expiryDate': data.get('expiry_date'),
            'scannedCopyPublicId': data.get('scanned_copy_public_id'),
            'documentPublicId': data.get('scanned_copy_public_id'),  # Alias
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'visaNumber': 'visa_no',
            'issueDate': 'issue_date',
            'expiryDate': 'expiry_date',
            'scannedCopyPublicId': 'scanned_copy_public_id',
            'documentPublicId': 'scanned_copy_public_id',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)


# ============================================================================
# PACKAGE SERIALIZERS (Admin)
# ============================================================================

class AdminPackageSerializer(serializers.ModelSerializer):
    """Serializer for trip package CRUD (admin)."""
    currency = CurrencySerializer(read_only=True)
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(),
        source='currency',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = TripPackage
        fields = [
            'id', 'trip', 'name', 'price_minor_units', 'currency', 'currency_id',
            'capacity', 'visibility', 'created_at', 'updated_at'
        ]


class AdminPackageFlightSerializer(serializers.ModelSerializer):
    """Serializer for package flight CRUD (admin)."""
    
    class Meta:
        model = PackageFlight
        fields = [
            'id', 'package', 'leg', 'carrier', 'flight_no',
            'dep_airport', 'dep_dt', 'arr_airport', 'arr_dt',
            'group_pnr', 'created_at', 'updated_at'
        ]


class AdminPackageHotelSerializer(serializers.ModelSerializer):
    """Serializer for package hotel CRUD (admin)."""
    
    class Meta:
        model = PackageHotel
        fields = [
            'id', 'package', 'name', 'address', 'room_type',
            'check_in', 'check_out', 'group_confirmation_no',
            'created_at', 'updated_at'
        ]


# ============================================================================
# ITINERARY SERIALIZERS (Admin)
# ============================================================================

class AdminItineraryItemSerializer(serializers.ModelSerializer):
    """Serializer for itinerary item CRUD (admin)."""
    
    class Meta:
        model = ItineraryItem
        fields = [
            'id', 'trip', 'day_index', 'start_time', 'end_time',
            'title', 'location', 'notes', 'attach_public_id', 'attach_url',
            'created_at', 'updated_at'
        ]


# ============================================================================
# TRIP CONTENT SERIALIZERS (Admin)
# ============================================================================

class AdminTripUpdateSerializer(serializers.ModelSerializer):
    """Serializer for trip update CRUD (admin)."""
    
    class Meta:
        model = TripUpdate
        fields = [
            'id', 'trip', 'package', 'title', 'body_md', 'urgency',
            'pinned', 'publish_at', 'attach_public_id', 'attach_url',
            'created_at', 'updated_at'
        ]


class AdminTripGuideSectionSerializer(serializers.ModelSerializer):
    """Serializer for trip guide section CRUD (admin)."""
    
    class Meta:
        model = TripGuideSection
        fields = [
            'id', 'trip', 'order', 'title', 'content_md',
            'attach_public_id', 'attach_url', 'created_at', 'updated_at'
        ]


class AdminChecklistItemSerializer(serializers.ModelSerializer):
    """Serializer for checklist item CRUD (admin)."""
    
    class Meta:
        model = ChecklistItem
        fields = [
            'id', 'trip', 'package', 'label', 'category', 'is_required',
            'link_url', 'attach_public_id', 'created_at', 'updated_at'
        ]


class AdminEmergencyContactSerializer(serializers.ModelSerializer):
    """Serializer for emergency contact CRUD (admin)."""
    
    class Meta:
        model = EmergencyContact
        fields = [
            'id', 'trip', 'label', 'phone', 'hours', 'notes',
            'created_at', 'updated_at'
        ]


class AdminTripFAQSerializer(serializers.ModelSerializer):
    """Serializer for trip FAQ CRUD (admin)."""
    
    class Meta:
        model = TripFAQ
        fields = [
            'id', 'trip', 'question', 'answer', 'order',
            'created_at', 'updated_at'
        ]


# ============================================================================
# USER MANAGEMENT SERIALIZERS (Admin)
# ============================================================================

class AdminStaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for staff profile details."""
    
    class Meta:
        model = StaffProfile
        fields = ['role']


class AdminUserListSerializer(serializers.ModelSerializer):
    """Serializer for user list view (admin)."""
    
    staff_profile = AdminStaffProfileSerializer(read_only=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'phone', 'email', 'name', 'role',
            'is_active', 'is_staff', 'is_superuser',
            'created_at', 'updated_at', 'staff_profile'
        ]
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        staff_role = None
        if hasattr(instance, 'staff_profile'):
            staff_role = instance.staff_profile.role
        
        return {
            'id': str(data['id']),
            'phone': data['phone'],
            'email': data.get('email'),
            'name': data['name'],
            'role': data['role'],
            'isActive': data['is_active'],
            'isStaff': data['is_staff'],
            'isSuperuser': data['is_superuser'],
            'staffRole': staff_role,
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
        }


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Serializer for user detail/update view (admin)."""
    
    staff_profile = AdminStaffProfileSerializer(read_only=True)
    staff_role = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Account
        fields = [
            'id', 'phone', 'email', 'name', 'role',
            'is_active', 'is_staff', 'is_superuser',
            'created_at', 'updated_at', 'staff_profile', 'staff_role'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        staff_role = None
        if hasattr(instance, 'staff_profile'):
            staff_role = instance.staff_profile.role
        
        return {
            'id': str(data['id']),
            'phone': data['phone'],
            'email': data.get('email'),
            'name': data['name'],
            'role': data['role'],
            'isActive': data['is_active'],
            'isStaff': data['is_staff'],
            'isSuperuser': data['is_superuser'],
            'staffRole': staff_role,
            'createdAt': data['created_at'],
            'updatedAt': data['updated_at'],
        }
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'isActive': 'is_active',
            'isStaff': 'is_staff',
            'isSuperuser': 'is_superuser',
            'staffRole': 'staff_role',
        }
        
        for key, value in data.items():
            if key in ['id', 'createdAt', 'updatedAt']:
                continue
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)
    
    def update(self, instance, validated_data):
        """Update user and staff profile."""
        staff_role = validated_data.pop('staff_role', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create staff profile if role is STAFF
        if instance.role == 'STAFF' and staff_role:
            StaffProfile.objects.update_or_create(
                user=instance,
                defaults={'role': staff_role}
            )
        
        return instance


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users (admin)."""
    
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    staff_role = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Account
        fields = [
            'phone', 'email', 'name', 'role', 'password',
            'is_active', 'is_staff', 'is_superuser', 'staff_role'
        ]
    
    def to_internal_value(self, data):
        """Convert from frontend format (camelCase) to Django format (snake_case)."""
        mapped_data = {}
        field_mapping = {
            'isActive': 'is_active',
            'isStaff': 'is_staff',
            'isSuperuser': 'is_superuser',
            'staffRole': 'staff_role',
        }
        
        for key, value in data.items():
            mapped_key = field_mapping.get(key, key)
            mapped_data[mapped_key] = value
        
        return super().to_internal_value(mapped_data)
    
    def create(self, validated_data):
        """Create user with hashed password and staff profile if needed."""
        password = validated_data.pop('password')
        staff_role = validated_data.pop('staff_role', None)
        
        # Create user
        user = Account.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create staff profile if role is STAFF
        if user.role == 'STAFF' and staff_role:
            StaffProfile.objects.create(user=user, role=staff_role)
        
        return user
    
    def to_representation(self, instance):
        """Convert to frontend format."""
        return AdminUserDetailSerializer(instance).data


# ============================================================================
# BOOKING & PAYMENT SERIALIZERS (Admin)
# ============================================================================

class AdminPaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment CRUD."""
    
    recorded_by_name = serializers.CharField(source='recorded_by.name', read_only=True)
    currency = CurrencySerializer(read_only=True)
    currency_id = serializers.PrimaryKeyRelatedField(
        queryset=Currency.objects.all(),
        source='currency',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'amount_minor_units', 'currency', 'currency_id',
            'payment_method', 'payment_date', 'reference_number',
            'notes', 'recorded_by', 'recorded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking', 'recorded_by', 'recorded_by_name', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Set recorded_by to current user."""
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)


class AdminBookingListSerializer(serializers.ModelSerializer):
    """Serializer for booking list."""
    
    pilgrim_details = serializers.SerializerMethodField()
    package_details = serializers.SerializerMethodField()
    currency = CurrencySerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference_number', 'pilgrim', 'pilgrim_details',
            'package', 'package_details',
            'status', 'payment_status', 'amount_paid_minor_units', 'currency',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference_number', 'amount_paid_minor_units', 'currency', 'created_at', 'updated_at']
    
    def get_pilgrim_details(self, obj):
        """Get pilgrim summary for list view."""
        pilgrim = obj.pilgrim
        return {
            'user': {
                'id': str(pilgrim.user_id),
                'name': pilgrim.user.name,
                'email': pilgrim.user.email,
                'phone': pilgrim.user.phone,
            }
        }
    
    def get_package_details(self, obj):
        """Get package summary for list view."""
        package = obj.package
        trip = package.trip
        return {
            'id': str(package.id),
            'name': package.name,
            'price_minor_units': package.price_minor_units,
            'currency': CurrencySerializer(package.currency).data if package.currency else None,
            'trip': {
                'id': str(trip.id),
                'code': trip.code,
                'name': trip.name,
                'startDate': str(trip.start_date) if trip.start_date else None,
                'endDate': str(trip.end_date) if trip.end_date else None,
            }
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'reference_number': data['reference_number'],
            'pilgrim': str(data['pilgrim']),
            'pilgrimDetails': data['pilgrim_details'],
            'package': str(data['package']),
            'packageDetails': data['package_details'],
            'status': data['status'],
            'payment_status': data['payment_status'],
            'amount_paid_minor_units': data['amount_paid_minor_units'],
            'currency': data['currency'],
            'created_at': data['created_at'],
            'updated_at': data['updated_at'],
        }


class AdminBookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for booking detail and CRUD."""
    
    pilgrim_details = serializers.SerializerMethodField()
    package_details = serializers.SerializerMethodField()
    payments = AdminPaymentSerializer(many=True, read_only=True)
    total_paid = serializers.IntegerField(source='amount_paid_minor_units', read_only=True)
    currency = CurrencySerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'reference_number', 'pilgrim', 'pilgrim_details',
            'package', 'package_details', 'status', 'payment_status',
            'amount_paid_minor_units', 'total_paid', 'currency',
            'payment_note', 'ticket_number', 'room_assignment',
            'special_needs', 'notes', 'payments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference_number', 'amount_paid_minor_units', 'total_paid', 'currency', 'payment_status', 'created_at', 'updated_at']
    
    def get_pilgrim_details(self, obj):
        """Get pilgrim summary."""
        pilgrim = obj.pilgrim
        return {
            'id': str(pilgrim.user_id),
            'user': {
                'id': str(pilgrim.user_id),
                'name': pilgrim.user.name,
                'email': pilgrim.user.email,
                'phone': pilgrim.user.phone,
                'isActive': pilgrim.user.is_active,
            },
            'dob': pilgrim.dob,
            'nationality': pilgrim.nationality,
        }
    
    def get_package_details(self, obj):
        """Get package summary."""
        package = obj.package
        trip = package.trip
        return {
            'id': str(package.id),
            'name': package.name,
            'price_minor_units': package.price_minor_units,
            'currency': CurrencySerializer(package.currency).data if package.currency else None,
            'trip': {
                'id': str(trip.id),
                'code': trip.code,
                'name': trip.name,
                'startDate': str(trip.start_date) if trip.start_date else None,
                'endDate': str(trip.end_date) if trip.end_date else None,
            }
        }
    
    def to_representation(self, instance):
        """Convert to frontend format (camelCase)."""
        data = super().to_representation(instance)
        return {
            'id': str(data['id']),
            'reference_number': data['reference_number'],
            'pilgrim': str(data['pilgrim']),
            'pilgrimDetails': data['pilgrim_details'],
            'package': str(data['package']),
            'packageDetails': data['package_details'],
            'status': data['status'],
            'payment_status': data['payment_status'],
            'amount_paid_minor_units': data['amount_paid_minor_units'],
            'total_paid': data['total_paid'],
            'currency': data['currency'],
            'payment_note': data.get('payment_note'),
            'ticket_number': data.get('ticket_number'),
            'room_assignment': data.get('room_assignment'),
            'special_needs': data.get('special_needs'),
            'specialRequests': data.get('special_needs'),  # Alias for frontend
            'notes': data.get('notes'),
            'payments': data.get('payments', []),
            'created_at': data['created_at'],
            'updated_at': data['updated_at'],
        }

