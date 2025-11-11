"""
Views for trips and related data.
"""
from django.utils import timezone
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.trips.models import Trip, ItineraryItem, TripUpdate
from apps.bookings.models import Booking
from apps.common.permissions import IsPilgrim
from apps.api.serializers.trips import (
    TripListSerializer,
    TripDetailSerializer,
    PublicTripDetailSerializer,
    ItineraryItemSerializer,
    TripUpdateSerializer,
    TripEssentialsSerializer
)


class TripListView(generics.ListAPIView):
    """
    List trips where the user has a booking.
    
    GET /api/v1/trips?scope=mine&when=upcoming|past
    
    Query parameters:
    - scope: Always 'mine' (only trips with user bookings)
    - when: 'upcoming' or 'past' (filter by date)
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = TripListSerializer
    
    def get_queryset(self):
        """Return trips where user has bookings."""
        # Get trip IDs from user's bookings
        trip_ids = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            status__in=['EOI', 'BOOKED']
        ).values_list('package__trip_id', flat=True).distinct()
        
        queryset = Trip.objects.filter(id__in=trip_ids)
        
        # Filter by date if specified
        when = self.request.query_params.get('when')
        today = timezone.now().date()
        
        if when == 'upcoming':
            queryset = queryset.filter(start_date__gte=today)
        elif when == 'past':
            queryset = queryset.filter(end_date__lt=today)
        
        return queryset.order_by('start_date')


class TripDetailView(generics.RetrieveAPIView):
    """
    Get trip details.
    
    GET /api/v1/trips/{id}
    
    Returns trip details if user has a booking for this trip.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = TripDetailSerializer
    
    def get_queryset(self):
        """Return trips where user has bookings."""
        trip_ids = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            status__in=['EOI', 'BOOKED']
        ).values_list('package__trip_id', flat=True).distinct()
        
        return Trip.objects.filter(id__in=trip_ids)


class TripItineraryView(generics.ListAPIView):
    """
    Get trip itinerary.
    
    GET /api/v1/trips/{trip_id}/itinerary
    
    Returns ordered list of itinerary items.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = ItineraryItemSerializer
    
    def get_queryset(self):
        """Return itinerary for the trip."""
        trip_id = self.kwargs['trip_id']
        
        # Verify user has booking for this trip
        has_booking = Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile,
            package__trip_id=trip_id,
            status__in=['EOI', 'BOOKED']
        ).exists()
        
        if not has_booking:
            return ItineraryItem.objects.none()
        
        return ItineraryItem.objects.filter(
            trip_id=trip_id
        ).order_by('day_index', 'start_time')


class TripUpdatesView(generics.ListAPIView):
    """
    Get trip updates.
    
    GET /api/v1/trips/{trip_id}/updates?since=<ISO-datetime>
    
    Query parameters:
    - since: ISO datetime to filter updates (optional)
    
    Returns trip-level updates and package-specific updates for user's package.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = TripUpdateSerializer
    
    def get_queryset(self):
        """Return updates for the trip."""
        trip_id = self.kwargs['trip_id']
        
        # Get user's booking for this trip
        try:
            booking = Booking.objects.get(
                pilgrim=self.request.user.pilgrim_profile,
                package__trip_id=trip_id,
                status__in=['EOI', 'BOOKED']
            )
        except Booking.DoesNotExist:
            return TripUpdate.objects.none()
        
        # Get trip-level updates and package-specific updates
        from django.db.models import Q
        queryset = TripUpdate.objects.filter(
            Q(trip_id=trip_id, package__isnull=True) |  # Trip-level updates
            Q(trip_id=trip_id, package=booking.package)  # Package-specific updates
        ).filter(
            publish_at__lte=timezone.now()  # Only published updates
        ).order_by('-pinned', '-publish_at')
        
        # Filter by since parameter if provided
        since = self.request.query_params.get('since')
        if since:
            try:
                from django.utils.dateparse import parse_datetime
                since_dt = parse_datetime(since)
                if since_dt:
                    queryset = queryset.filter(publish_at__gte=since_dt)
            except (ValueError, TypeError):
                pass
        
        return queryset


class TripEssentialsView(generics.RetrieveAPIView):
    """
    Get trip essentials (guide, checklist, contacts, FAQs).
    
    GET /api/v1/trips/{trip_id}/essentials
    
    Returns composite data: sections, checklist, contacts, FAQs.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = TripEssentialsSerializer
    
    def get_object(self):
        """Return essentials for the trip."""
        trip_id = self.kwargs['trip_id']
        
        # Verify user has booking for this trip
        try:
            booking = Booking.objects.get(
                pilgrim=self.request.user.pilgrim_profile,
                package__trip_id=trip_id,
                status__in=['EOI', 'BOOKED']
            )
        except Booking.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have access to this trip")
        
        trip = Trip.objects.get(id=trip_id)
        
        # Get all essentials
        from django.db.models import Q
        from apps.trips.models import ChecklistItem, EmergencyContact, TripFAQ, TripGuideSection
        
        sections = TripGuideSection.objects.filter(trip=trip).order_by('order', 'title')
        
        # Get trip-level and package-specific checklist items
        checklist = ChecklistItem.objects.filter(
            Q(trip=trip, package__isnull=True) |
            Q(trip=trip, package=booking.package)
        ).order_by('category', 'label')
        
        contacts = EmergencyContact.objects.filter(trip=trip)
        faqs = TripFAQ.objects.filter(trip=trip).order_by('order')
        
        return {
            'sections': sections,
            'checklist': checklist,
            'contacts': contacts,
            'faqs': faqs
        }


# ============================================================================
# PUBLIC ENDPOINTS (No authentication required)
# ============================================================================

class PublicTripListView(generics.ListAPIView):
    """
    List public trips (accessible by guests).
    
    GET /api/v1/public/trips?featured=true
    
    Query parameters:
    - featured: true/false (filter featured trips only)
    
    Returns public trips ordered by start date.
    """
    
    permission_classes = [AllowAny]
    serializer_class = TripListSerializer
    
    def get_queryset(self):
        """Return public trips."""
        queryset = Trip.objects.filter(visibility='PUBLIC')
        
        # Filter by featured if requested
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(featured=True)
        
        # Only show trips with at least one public package
        from django.db.models import Count, Q
        queryset = queryset.annotate(
            public_packages_count=Count('packages', filter=Q(packages__visibility='PUBLIC'))
        ).filter(public_packages_count__gt=0)
        
        return queryset.order_by('-featured', 'start_date')


class PublicTripDetailView(generics.RetrieveAPIView):
    """
    Get public trip details (accessible by guests).
    
    GET /api/v1/public/trips/{id}
    
    Returns comprehensive trip details including packages, itinerary, FAQs, etc.
    """
    
    permission_classes = [AllowAny]
    serializer_class = PublicTripDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return public trips only."""
        return Trip.objects.filter(visibility='PUBLIC')

