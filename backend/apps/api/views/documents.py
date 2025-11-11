from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.pilgrims.models import Document
from apps.api.serializers.documents import (
    DocumentSerializer,
    PilgrimDocumentSerializer,
    DocumentCreateSerializer,
    DocumentUpdateSerializer
)
from apps.common.permissions import IsStaff


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing documents (staff only).
    
    Staff can manage all documents across all pilgrims.
    """
    
    permission_classes = [IsAuthenticated, IsStaff]
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
    
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimDocumentSerializer
    pagination_class = None  # Disable pagination for user's own documents
    
    def get_queryset(self):
        """Return documents for the authenticated user's pilgrim profile."""
        try:
            pilgrim = self.request.user.pilgrim_profile
            return Document.objects.filter(pilgrim=pilgrim).select_related('trip').order_by('-created_at')
        except Exception:
            # User doesn't have a pilgrim profile, return empty queryset
            return Document.objects.none()


class MyDocumentDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single document for the authenticated user (mobile app).
    
    GET /api/v1/me/documents/{id}/
    
    Returns detailed information about a single document.
    """
    
    permission_classes = [IsAuthenticated]
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

