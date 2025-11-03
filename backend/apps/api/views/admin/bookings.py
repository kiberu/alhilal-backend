"""
Admin ViewSet for Booking management.
Staff can create, read, update, delete bookings.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.bookings.models import Booking, Payment
from apps.api.serializers.admin import AdminBookingListSerializer, AdminBookingDetailSerializer, AdminPaymentSerializer


class AdminBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings (staff only).
    
    list:   GET /bookings - List all bookings with filters
    create: POST /bookings - Create a new booking
    retrieve: GET /bookings/:id - Get booking details
    update: PATCH /bookings/:id - Update booking
    destroy: DELETE /bookings/:id - Cancel/delete booking
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'package', 'package__trip']
    search_fields = ['reference_number', 'pilgrim__user__name', 'pilgrim__user__phone']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return bookings based on staff permission."""
        user = self.request.user
        
        if not user.is_staff:
            return Booking.objects.none()
        
        queryset = Booking.objects.all().select_related(
            'pilgrim__user', 'package__trip'
        )
        
        # Filter by date range if provided
        created_after = self.request.query_params.get('created_after')
        created_before = self.request.query_params.get('created_before')
        
        if created_after:
            queryset = queryset.filter(created_at__gte=created_after)
        if created_before:
            queryset = queryset.filter(created_at__lte=created_before)
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for list and detail."""
        if self.action == 'list':
            return AdminBookingListSerializer
        return AdminBookingDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """List bookings with pagination."""
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
        
        bookings = queryset[start:end]
        serializer = self.get_serializer(bookings, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new booking."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a booking."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete/cancel a booking."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete bookings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'], url_path='bulk/convert-eoi')
    def bulk_convert_eoi(self, request):
        """Convert multiple EOI bookings to BOOKED."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking_ids = request.data.get('ids', [])
        updated = Booking.objects.filter(
            id__in=booking_ids,
            status='EOI'
        ).update(status='BOOKED')
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='bulk/cancel')
    def bulk_cancel(self, request):
        """Cancel multiple bookings."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking_ids = request.data.get('ids', [])
        updated = Booking.objects.filter(
            id__in=booking_ids
        ).update(status='CANCELLED')
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='bulk/assign-rooms')
    def bulk_assign_rooms(self, request):
        """Bulk assign rooms to bookings."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        assignments = request.data.get('assignments', [])
        updated = 0
        
        for assignment in assignments:
            booking_id = assignment.get('booking_id')
            room_number = assignment.get('room_number')
            
            if booking_id and room_number:
                Booking.objects.filter(id=booking_id).update(
                    notes=f"Room: {room_number}"
                )
                updated += 1
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='payments')
    def add_payment(self, request, pk=None):
        """Add a payment to a booking."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can add payments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        serializer = AdminPaymentSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(booking=booking)
            # Refresh booking to get updated payment status
            booking.refresh_from_db()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], url_path='payments/list')
    def list_payments(self, request, pk=None):
        """List all payments for a booking."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can view payments.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = self.get_object()
        payments = booking.payments.all()
        serializer = AdminPaymentSerializer(payments, many=True)
        
        return Response({
            'payments': serializer.data,
            'total_paid': booking.amount_paid_minor_units,
            'package_price': booking.package.price_minor_units,
            'balance': (booking.package.price_minor_units or 0) - booking.amount_paid_minor_units,
        }, status=status.HTTP_200_OK)

