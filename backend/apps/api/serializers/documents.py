from rest_framework import serializers
from apps.pilgrims.models import Document
from apps.common.cloudinary import signed_delivery


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model with signed URL for file access."""
    
    file_url = serializers.SerializerMethodField()
    pilgrim_name = serializers.CharField(source='pilgrim.user.name', read_only=True)
    trip_name = serializers.CharField(source='trip.name', read_only=True, allow_null=True)
    booking_reference = serializers.CharField(source='booking.reference_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'pilgrim', 'pilgrim_name', 'document_type', 'title', 'document_number',
            'issuing_country', 'file_public_id', 'file_format', 'file_url', 'issue_date', 'expiry_date',
            'status', 'rejection_reason', 'notes', 'trip', 'trip_name', 'booking', 
            'booking_reference', 'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pilgrim_name', 'trip_name', 'booking_reference', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """Return signed Cloudinary URL for the document file."""
        if obj.file_public_id:
            return signed_delivery(obj.file_public_id, expires_in=600, file_format=obj.file_format)
        return None


class PilgrimDocumentSerializer(serializers.ModelSerializer):
    """Simplified serializer for pilgrims to view their own documents via mobile app."""
    
    file_url = serializers.SerializerMethodField()
    trip_name = serializers.CharField(source='trip.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'document_type', 'title', 'document_number', 'issuing_country',
            'file_url', 'file_format', 'issue_date', 'expiry_date', 'status', 'trip', 'trip_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trip_name', 'file_format', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """Return signed Cloudinary URL for the document file."""
        if obj.file_public_id:
            return signed_delivery(obj.file_public_id, expires_in=600, file_format=obj.file_format)
        return None


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new documents (pilgrim or admin upload)."""
    
    class Meta:
        model = Document
        fields = [
            'pilgrim', 'document_type', 'title', 'document_number', 'issuing_country',
            'file_public_id', 'file_format', 'issue_date', 'expiry_date', 'trip', 'booking', 'notes'
        ]
    
    def validate_file_public_id(self, value):
        """Ensure file public ID is provided."""
        if not value or not value.strip():
            raise serializers.ValidationError("Document file is required.")
        return value
    
    def create(self, validated_data):
        """Create document and set uploaded_by if staff member."""
        request = self.context.get('request')
        if request and request.user and request.user.is_staff:
            validated_data['uploaded_by'] = request.user
        return super().create(validated_data)


class DocumentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating documents."""
    
    class Meta:
        model = Document
        fields = [
            'title', 'document_number', 'issuing_country', 'file_public_id',
            'issue_date', 'expiry_date', 'status', 'rejection_reason', 'notes',
            'trip', 'booking'
        ]
    
    def validate(self, data):
        """Validate status changes."""
        if 'status' in data and data['status'] == 'REJECTED':
            if not data.get('rejection_reason') and not self.instance.rejection_reason:
                raise serializers.ValidationError({
                    'rejection_reason': 'Rejection reason is required when rejecting a document.'
                })
        return data

