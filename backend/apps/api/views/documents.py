from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.pilgrims.models import Document
from apps.api.serializers.documents import (
    DocumentSerializer,
    DocumentCenterSerializer,
    PilgrimDocumentSerializer,
    DocumentCreateSerializer,
    DocumentUpdateSerializer
)
from apps.common.permissions import HasPilgrimProfile, StaffActionRolePermission, StaffRoleAccessMixin
from apps.common.cloudinary import signed_delivery


class DocumentViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing documents (staff only).
    
    Staff can manage all documents across all pilgrims.
    """
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pilgrim', 'document_type', 'status', 'trip', 'booking']
    search_fields = ['title', 'document_number', 'pilgrim__user__name', 'pilgrim__user__phone']
    ordering_fields = ['created_at', 'expiry_date', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return all documents for staff."""
        return Document.objects.all().select_related(
            'pilgrim__user', 'trip', 'booking', 'uploaded_by'
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return DocumentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DocumentUpdateSerializer
        return DocumentSerializer
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get documents expiring within specified days (default 30)."""
        from datetime import date, timedelta
        
        days = int(request.query_params.get('days', 30))
        expiry_threshold = date.today() + timedelta(days=days)
        
        documents = self.get_queryset().filter(
            expiry_date__lte=expiry_threshold,
            expiry_date__gte=date.today(),
            status='VERIFIED'
        )
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expired(self, request):
        """Get expired documents."""
        from datetime import date
        
        documents = self.get_queryset().filter(
            expiry_date__lt=date.today()
        )
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark document as verified."""
        document = self.get_object()
        document.status = 'VERIFIED'
        document.rejection_reason = None
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Mark document as rejected."""
        document = self.get_object()
        rejection_reason = request.data.get('rejection_reason')
        
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document.status = 'REJECTED'
        document.rejection_reason = rejection_reason
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)


class MyDocumentsListView(generics.ListAPIView):
    """
    List all documents for the authenticated user (mobile app).
    
    GET /api/v1/me/documents/
    
    Returns all documents as a direct array (no pagination).
    Works for both pilgrims and staff with pilgrim profiles.
    """
    
    permission_classes = [IsAuthenticated, HasPilgrimProfile]
    serializer_class = DocumentCenterSerializer
    pagination_class = None  # Disable pagination for user's own documents

    @staticmethod
    def _build_missing_row(document_type: str):
        """Return a synthetic missing row for the document center."""
        title_map = {
            'PASSPORT': 'Passport',
            'VISA': 'Visa',
            'VACCINATION': 'Vaccination Certificate',
        }
        label = title_map.get(document_type, document_type.replace('_', ' ').title())
        required_for_travel = document_type in Document.REQUIRED_FOR_TRAVEL_TYPES
        return {
            'id': f'missing-{document_type.lower()}',
            'document_type': document_type,
            'title': label,
            'document_number': None,
            'issuing_country': None,
            'file_url': None,
            'file_format': None,
            'issue_date': None,
            'expiry_date': None,
            'status': 'MISSING',
            'verification_status': 'MISSING',
            'required_for_travel': required_for_travel,
            'missing_item': required_for_travel,
            'is_expired': False,
            'is_expiring_soon': False,
            'support_next_step': f'Contact Al Hilal support to provide your {label.lower()} for review.',
            'trip': None,
            'trip_name': None,
            'booking_reference': None,
            'last_reviewed_at': None,
            'last_changed_at': None,
        }

    @staticmethod
    def _serialize_document(document: Document):
        """Return a document-center row for an existing document."""
        trip = document.trip or (document.booking.package.trip if document.booking_id else None)
        file_url = None
        if document.file_public_id:
            file_url = signed_delivery(
                document.file_public_id,
                expires_in=600,
                file_format=document.file_format,
            )

        return {
            'id': str(document.id),
            'document_type': document.document_type,
            'title': document.title,
            'document_number': document.document_number,
            'issuing_country': document.issuing_country,
            'file_url': file_url,
            'file_format': document.file_format,
            'issue_date': document.issue_date,
            'expiry_date': document.expiry_date,
            'status': document.status,
            'verification_status': document.status,
            'required_for_travel': document.is_required_for_travel,
            'missing_item': document.is_missing_for_travel,
            'is_expired': document.is_expired,
            'is_expiring_soon': document.is_expiring_soon,
            'support_next_step': document.get_support_next_step(),
            'trip': str(trip.id) if trip else None,
            'trip_name': trip.name if trip else None,
            'booking_reference': document.booking.reference_number if document.booking_id else None,
            'last_reviewed_at': document.reviewed_at,
            'last_changed_at': document.updated_at,
        }

    def list(self, request, *args, **kwargs):
        """Return a truthful, read-only document center payload."""
        try:
            pilgrim = self.request.user.pilgrim_profile
        except Exception:
            return Response([])

        documents = list(
            Document.objects.filter(pilgrim=pilgrim)
            .select_related('trip', 'booking__package__trip')
            .order_by('document_type', '-updated_at', '-created_at')
        )

        latest_by_type = {}
        for document in documents:
            latest_by_type.setdefault(document.document_type, document)

        rows = []
        for document_type in ['PASSPORT', 'VISA', 'VACCINATION']:
            document = latest_by_type.pop(document_type, None)
            rows.append(
                self._serialize_document(document)
                if document
                else self._build_missing_row(document_type)
            )

        for document in latest_by_type.values():
            rows.append(self._serialize_document(document))

        serializer = self.get_serializer(rows, many=True)
        return Response(serializer.data)


class MyDocumentDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single document for the authenticated user (mobile app).
    
    GET /api/v1/me/documents/{id}/
    
    Returns detailed information about a single document.
    """
    
    permission_classes = [IsAuthenticated, HasPilgrimProfile]
    serializer_class = PilgrimDocumentSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return documents for the authenticated user's pilgrim profile."""
        try:
            pilgrim = self.request.user.pilgrim_profile
            return Document.objects.filter(pilgrim=pilgrim).select_related('trip')
        except Exception:
            # User doesn't have a pilgrim profile, return empty queryset
            return Document.objects.none()
