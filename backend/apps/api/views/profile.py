"""
Views for pilgrim profile and related data.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.pilgrims.models import Visa
from apps.bookings.models import Booking
from apps.common.permissions import IsPilgrim
from apps.api.serializers.profile import (
    PilgrimProfileSerializer,
    VisaSerializer,
    BookingSummarySerializer
)


class MeView(generics.RetrieveAPIView):
    """
    Get pilgrim profile information.
    
    GET /api/v1/me
    
    Returns pilgrim profile with masked passport information.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = PilgrimProfileSerializer
    
    def get_object(self):
        """Return the pilgrim profile for the current user."""
        return self.request.user.pilgrim_profile


class MyVisasView(generics.ListAPIView):
    """
    Get pilgrim's visas.
    
    GET /api/v1/me/visas?trip_id=<uuid>
    
    Optional query parameters:
    - trip_id: Filter by specific trip
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = VisaSerializer
    
    def get_queryset(self):
        """Return visas for the current user."""
        queryset = Visa.objects.filter(
            pilgrim=self.request.user.pilgrim_profile
        ).select_related('trip').order_by('-created_at')
        
        # Filter by trip if specified
        trip_id = self.request.query_params.get('trip_id')
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        
        return queryset


class MyBookingsView(generics.ListAPIView):
    """
    Get pilgrim's bookings.
    
    GET /api/v1/me/bookings
    
    Returns all bookings with trip and package information.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = BookingSummarySerializer
    
    def get_queryset(self):
        """Return bookings for the current user."""
        return Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile
        ).select_related(
            'package__trip'
        ).order_by('-created_at')

