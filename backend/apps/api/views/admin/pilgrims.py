"""
Admin ViewSet for Pilgrim management.
Staff can create, read, update, delete pilgrims.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.models import PilgrimProfile
from apps.api.serializers.admin import AdminPilgrimListSerializer, AdminPilgrimDetailSerializer


class AdminPilgrimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pilgrims (staff only).
    
    list:   GET /pilgrims - List all pilgrims with filters
    create: POST /pilgrims - Create a new pilgrim
    retrieve: GET /pilgrims/:id - Get pilgrim details
    update: PATCH /pilgrims/:id - Update pilgrim
    destroy: DELETE /pilgrims/:id - Delete pilgrim
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['nationality', 'gender']
    search_fields = ['user__name', 'user__phone', 'user__email']
    ordering_fields = ['created_at', 'user__name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return pilgrims based on staff permission."""
        user = self.request.user
        
        if not user.is_staff:
            return PilgrimProfile.objects.none()
        
        queryset = PilgrimProfile.objects.all().select_related('user')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for list and detail."""
        if self.action == 'list':
            return AdminPilgrimListSerializer
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
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create pilgrims.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a pilgrim."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update pilgrims.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a pilgrim."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete pilgrims.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def bookings(self, request, pk=None):
        """Get bookings for a specific pilgrim."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can view pilgrim bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pilgrim = self.get_object()
        bookings = pilgrim.bookings.all().select_related('package__trip')
        
        from apps.api.serializers.admin import AdminBookingListSerializer
        serializer = AdminBookingListSerializer(bookings, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get documents for a specific pilgrim."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can view pilgrim documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pilgrim = self.get_object()
        
        # Get passports
        from apps.pilgrims.models import Passport
        passports = Passport.objects.filter(pilgrim=pilgrim)
        
        # Get visas
        from apps.pilgrims.models import Visa
        visas = Visa.objects.filter(pilgrim=pilgrim)
        
        from apps.api.serializers.admin import AdminPassportSerializer, AdminVisaSerializer
        
        return Response({
            'passports': AdminPassportSerializer(passports, many=True).data,
            'visas': AdminVisaSerializer(visas, many=True).data,
        })

