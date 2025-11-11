"""
API views for pilgrim bookings.
Authenticated pilgrims can create and view their own bookings.
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.bookings.models import Booking
from apps.api.serializers.trips import PilgrimBookingCreateSerializer, PilgrimBookingDetailSerializer


class PilgrimBookingCreateView(generics.CreateAPIView):
    """
    POST /api/v1/my-bookings
    Create a new booking for the authenticated pilgrim.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimBookingCreateSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a booking."""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Return detailed booking info
        detail_serializer = PilgrimBookingDetailSerializer(booking)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class PilgrimBookingListView(generics.ListAPIView):
    """
    GET /api/v1/my-bookings
    List all bookings for the authenticated pilgrim.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimBookingDetailSerializer
    
    def get_queryset(self):
        """Return bookings for the authenticated pilgrim."""
        user = self.request.user
        
        # Get pilgrim profile
        try:
            pilgrim = user.pilgrim_profile
        except:
            return Booking.objects.none()
        
        return Booking.objects.filter(
            pilgrim=pilgrim
        ).select_related(
            'package__trip', 'currency'
        ).order_by('-created_at')


class PilgrimBookingDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/my-bookings/{id}
    Get details of a specific booking.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimBookingDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return bookings for the authenticated pilgrim only."""
        user = self.request.user
        
        # Get pilgrim profile
        try:
            pilgrim = user.pilgrim_profile
        except:
            return Booking.objects.none()
        
        return Booking.objects.filter(
            pilgrim=pilgrim
        ).select_related(
            'package__trip', 'currency'
        )

