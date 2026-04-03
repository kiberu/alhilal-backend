"""
Admin ViewSet for Pilgrim management.
Staff can create, read, update, delete pilgrims.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.models import PilgrimProfile
from apps.api.serializers.admin import (
    AdminPilgrimListSerializer, 
    AdminPilgrimCreateSerializer,
    AdminPilgrimDetailSerializer,
    AdminPilgrimReadinessSerializer,
)
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin, user_has_staff_role
from apps.pilgrims.models import Document, PilgrimReadiness


class AdminPilgrimViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing pilgrims (staff only).
    
    list:   GET /pilgrims - List all pilgrims with filters
    create: POST /pilgrims - Create a new pilgrim (no user account required)
    retrieve: GET /pilgrims/:id - Get pilgrim details
    update: PATCH /pilgrims/:id - Update pilgrim
    destroy: DELETE /pilgrims/:id - Delete pilgrim
    """
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['nationality', 'gender']
    search_fields = ['user__name', 'user__phone', 'user__email', 'full_name', 'passport_number', 'phone']
    ordering_fields = ['created_at', 'user__name', 'full_name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return pilgrims based on staff permission."""
        user = self.request.user

        if not user_has_staff_role(user, self.get_allowed_staff_roles(self.request)):
            return PilgrimProfile.objects.none()
        
        queryset = PilgrimProfile.objects.all().select_related('user')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'list':
            return AdminPilgrimListSerializer
        elif self.action == 'create':
            return AdminPilgrimCreateSerializer
        return AdminPilgrimDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """List pilgrims with pagination."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get pagination params
        page_size = request.query_params.get('page_size', 10)
        page = request.query_params.get('page', 1)
        
        try:
            page_size = int(page_size)
            page = int(page)
        except ValueError:
            page_size = 10
            page = 1
        
        # Manual pagination
        start = (page - 1) * page_size
        end = start + page_size
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size
        
        pilgrims = queryset[start:end]
        serializer = self.get_serializer(pilgrims, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new pilgrim."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a pilgrim."""
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a pilgrim."""
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def bookings(self, request, pk=None):
        """Get bookings for a specific pilgrim."""
        pilgrim = self.get_object()
        bookings = pilgrim.bookings.all().select_related('package__trip')
        
        from apps.api.serializers.admin import AdminBookingListSerializer
        serializer = AdminBookingListSerializer(bookings, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get documents for a specific pilgrim."""
        pilgrim = self.get_object()
        documents = Document.objects.filter(pilgrim=pilgrim).order_by('-created_at')

        def serialize_document(document):
            return {
                'id': str(document.id),
                'title': document.title,
                'number': document.document_number or '',
                'country': document.issuing_country or '',
                'status': document.status,
                'expiryDate': str(document.expiry_date) if document.expiry_date else None,
                'issueDate': str(document.issue_date) if document.issue_date else None,
                'fileUrl': document.file_url,
                'created_at': document.created_at,
                'updated_at': document.updated_at,
            }

        passports = [serialize_document(document) for document in documents if document.document_type == 'PASSPORT']
        visas = [
            {
                **serialize_document(document),
                'visaType': document.document_type,
                'number': document.document_number or '',
            }
            for document in documents
            if document.document_type == 'VISA'
        ]

        return Response({
            'passports': passports,
            'visas': visas,
        })


class AdminPilgrimReadinessViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing pilgrim travel-readiness records."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminPilgrimReadinessSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pilgrim', 'trip', 'package', 'booking', 'status', 'ready_for_travel', 'requires_follow_up']
    search_fields = [
        'pilgrim__full_name',
        'pilgrim__user__name',
        'booking__reference_number',
        'trip__code',
        'package__name',
    ]
    ordering_fields = ['created_at', 'updated_at', 'validated_at', 'payment_progress_percent']
    ordering = ['trip__start_date', 'pilgrim__full_name', 'created_at']

    def get_queryset(self):
        """Return all readiness records for staff."""
        return PilgrimReadiness.objects.all().select_related(
            'pilgrim__user',
            'booking',
            'trip',
            'package',
            'validated_by',
        )

    def list(self, request, *args, **kwargs):
        """List readiness records with the admin dashboard's pagination shape."""
        queryset = self.filter_queryset(self.get_queryset())

        page_size = request.query_params.get('page_size', 10)
        page = request.query_params.get('page', 1)

        try:
            page_size = int(page_size)
            page = int(page)
        except ValueError:
            page_size = 10
            page = 1

        start = (page - 1) * page_size
        end = start + page_size
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size

        serializer = self.get_serializer(queryset[start:end], many=True)
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })

    def perform_create(self, serializer):
        """Create the record and immediately synchronize its computed state."""
        readiness = serializer.save()
        readiness.refresh_status(save=True)

    def perform_update(self, serializer):
        """Update the record and synchronize its computed state."""
        readiness = serializer.save()
        readiness.refresh_status(save=True)

    @action(detail=True, methods=['post'], url_path='validate-ready')
    def validate_ready(self, request, pk=None):
        """Issue the travel-ready pass once all prerequisites are met."""
        readiness = self.get_object()
        readiness.refresh_status(save=True)

        if not readiness.is_ready_for_review:
            return Response(
                {
                    'error': 'This pilgrim is not ready for validation yet.',
                    'missingItems': readiness.get_missing_requirements(),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        readiness.validated_by = request.user
        readiness.validated_at = timezone.now()
        if request.data.get('validation_notes'):
            readiness.validation_notes = request.data['validation_notes']
        readiness.refresh_status(save=True)

        serializer = self.get_serializer(readiness)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='clear-validation')
    def clear_validation(self, request, pk=None):
        """Remove a previously issued travel-ready pass."""
        readiness = self.get_object()
        readiness.validated_by = None
        readiness.validated_at = None
        readiness.refresh_status(save=True)

        serializer = self.get_serializer(readiness)
        return Response(serializer.data)
