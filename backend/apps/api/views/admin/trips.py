"""
Admin ViewSet for Trip management.
Staff can create, read, update, delete trips.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.trips.models import Trip
from apps.api.serializers.admin import AdminTripListSerializer, AdminTripDetailSerializer
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin, user_has_staff_role


class AdminTripViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing trips (staff only).
    
    list:   GET /trips - List all trips with filters
    create: POST /trips - Create a new trip
    retrieve: GET /trips/:id - Get trip details
    update: PATCH /trips/:id - Update trip
    destroy: DELETE /trips/:id - Delete trip
    """
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['visibility', 'status']  # Removed 'cities' - JSONField not supported by django-filter
    search_fields = ['name', 'code', 'family_code', 'commercial_month_label']
    ordering_fields = ['start_date', 'sales_open_date', 'created_at', 'name']
    ordering = ['-start_date']
    
    def get_queryset(self):
        """Return trips based on staff permission."""
        user = self.request.user

        if not user_has_staff_role(user, self.get_allowed_staff_roles(self.request)):
            return Trip.objects.none()
        
        queryset = Trip.objects.all().prefetch_related('packages')
        
        # Filter by date range if provided
        start_date_after = self.request.query_params.get('start_date_after')
        start_date_before = self.request.query_params.get('start_date_before')
        
        if start_date_after:
            queryset = queryset.filter(start_date__gte=start_date_after)
        if start_date_before:
            queryset = queryset.filter(start_date__lte=start_date_before)
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for list and detail."""
        if self.action == 'list':
            return AdminTripListSerializer
        return AdminTripDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """List trips with pagination."""
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
        
        trips = queryset[start:end]
        serializer = self.get_serializer(trips, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new trip."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a trip."""
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a trip."""
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a trip."""
        trip = self.get_object()
        
        # Create a copy
        new_trip = Trip.objects.create(
            code=f"{trip.code}-COPY",
            family_code=trip.family_code,
            commercial_month_label=trip.commercial_month_label,
            name=f"{trip.name} (Copy)",
            excerpt=trip.excerpt,
            seo_title=trip.seo_title,
            seo_description=trip.seo_description,
            cities=trip.cities,
            status='DRAFT',
            sales_open_date=trip.sales_open_date,
            start_date=trip.start_date,
            end_date=trip.end_date,
            default_nights=trip.default_nights,
            cover_image=trip.cover_image,
            featured=False,
            visibility='PRIVATE',  # Set to private by default
        )
        
        serializer = self.get_serializer(new_trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
