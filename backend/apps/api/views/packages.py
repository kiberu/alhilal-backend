"""
Views for trip packages.
"""
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

from apps.trips.models import TripPackage, PackageFlight, PackageHotel
from apps.bookings.models import Booking
from apps.common.permissions import IsPilgrim
from rest_framework.permissions import IsAuthenticated
from apps.api.serializers.trips import (
    TripPackageSerializer,
    FlightSerializer,
    HotelSerializer
)


class PackageDetailView(generics.RetrieveAPIView):
    """
    Get package details including flights and hotels.
    
    GET /api/v1/packages/{id}
    
    Returns package details if user has a booking for this package.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = TripPackageSerializer
    
    def get_queryset(self):
        """Return packages where user has bookings."""
        package_ids = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            status__in=['EOI', 'BOOKED']
        ).values_list('package_id', flat=True).distinct()
        
        return TripPackage.objects.filter(id__in=package_ids)


class PackageFlightsView(generics.ListAPIView):
    """
    Get package flights.
    
    GET /api/v1/packages/{package_id}/flights
    
    Returns all flights for the package.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = FlightSerializer
    
    def get_queryset(self):
        """Return flights for the package."""
        package_id = self.kwargs['package_id']
        
        # Verify user has booking for this package
        has_booking = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            package_id=package_id,
            status__in=['EOI', 'BOOKED']
        ).exists()
        
        if not has_booking:
            raise PermissionDenied("You don't have access to this package")
        
        return PackageFlight.objects.filter(
            package_id=package_id
        ).order_by('dep_dt')


class PackageHotelsView(generics.ListAPIView):
    """
    Get package hotels.
    
    GET /api/v1/packages/{package_id}/hotels
    
    Returns all hotels for the package.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = HotelSerializer
    
    def get_queryset(self):
        """Return hotels for the package."""
        package_id = self.kwargs['package_id']
        
        # Verify user has booking for this package
        has_booking = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            package_id=package_id,
            status__in=['EOI', 'BOOKED']
        ).exists()
        
        if not has_booking:
            raise PermissionDenied("You don't have access to this package")
        
        return PackageHotel.objects.filter(
            package_id=package_id
        ).order_by('check_in')

