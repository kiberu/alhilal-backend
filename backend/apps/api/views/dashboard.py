"""
Dashboard API views for staff users.
Provides statistics, recent activity, and quick insights.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import Account, PilgrimProfile
from apps.trips.models import Trip
from apps.bookings.models import Booking
from apps.pilgrims.models import Visa


class DashboardStatsView(APIView):
    """
    Get dashboard statistics overview.
    Returns key metrics for trips, bookings, pilgrims, and visas.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_staff:
            return Response(
                {'error': 'Only staff members can access dashboard statistics.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Trip statistics
            total_trips = Trip.objects.count()
            active_trips = Trip.objects.filter(
                visibility='PUBLIC',
                end_date__gte=timezone.now().date()
            ).count()
            
            # Booking statistics
            total_bookings = Booking.objects.count()
            active_bookings = Booking.objects.filter(
                status__in=['BOOKED', 'CONFIRMED']
            ).count()
            eoi_bookings = Booking.objects.filter(status='EOI').count()
            
            # Pilgrim statistics
            total_pilgrims = PilgrimProfile.objects.count()
            
            # Visa statistics
            pending_visas = Visa.objects.filter(status='PENDING').count()
            approved_visas = Visa.objects.filter(status='APPROVED').count()
            
            # Revenue (in minor units)
            total_revenue = Booking.objects.filter(
                status__in=['BOOKED', 'CONFIRMED']
            ).aggregate(
                total=Sum('amount_paid_minor_units')
            )['total'] or 0

            return Response({
                'trips': {
                    'total': total_trips,
                    'active': active_trips,
                },
                'bookings': {
                    'total': total_bookings,
                    'active': active_bookings,
                    'eoi': eoi_bookings,
                },
                'pilgrims': {
                    'total': total_pilgrims,
                },
                'visas': {
                    'pending': pending_visas,
                    'approved': approved_visas,
                },
                'revenue': {
                    'totalMinorUnits': total_revenue,
                },
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch dashboard statistics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardActivityView(APIView):
    """
    Get recent activity feed.
    Returns the latest bookings, visa updates, and trip changes.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_staff:
            return Response(
                {'error': 'Only staff members can access dashboard activity.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            activities = []
            
            # Recent bookings (last 7 days)
            recent_bookings = Booking.objects.select_related(
                'pilgrim__user', 'package__trip'
            ).filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).order_by('-created_at')[:10]

            for booking in recent_bookings:
                activities.append({
                    'id': str(booking.id),
                    'type': 'booking',
                    'title': f'New {booking.status} booking',
                    'description': f'{booking.pilgrim.user.name} - {booking.package.trip.name}',
                    'timestamp': booking.created_at.isoformat(),
                    'relatedId': str(booking.id),
                    'status': booking.status,
                })

            # Sort by timestamp descending
            activities.sort(key=lambda x: x['timestamp'], reverse=True)

            return Response(activities[:15], status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch activity feed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardUpcomingTripsView(APIView):
    """
    Get upcoming trips with booking counts.
    Returns trips starting within the next 90 days.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_staff:
            return Response(
                {'error': 'Only staff members can access upcoming trips.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get trips starting within next 90 days
            today = timezone.now().date()
            ninety_days_later = today + timedelta(days=90)
            
            upcoming_trips = Trip.objects.filter(
                start_date__gte=today,
                start_date__lte=ninety_days_later,
                visibility='PUBLIC'
            ).prefetch_related('packages').order_by('start_date')[:10]

            trips_data = []
            for trip in upcoming_trips:
                # Count bookings for this trip
                booking_count = Booking.objects.filter(
                    package__trip=trip,
                    status__in=['BOOKED', 'CONFIRMED']
                ).count()

                # Calculate total capacity across all packages
                total_capacity = sum(pkg.capacity for pkg in trip.packages.all())

                trips_data.append({
                    'id': str(trip.id),
                    'code': trip.code,
                    'name': trip.name,
                    'cities': trip.cities,
                    'startDate': str(trip.start_date),
                    'endDate': str(trip.end_date),
                    'coverImage': trip.cover_image,
                    'visibility': trip.visibility,
                    'bookingCount': booking_count,
                    'totalCapacity': total_capacity,
                    'packages': [{
                        'id': str(pkg.id),
                        'name': pkg.name,
                        'priceMinorUnits': pkg.price_minor_units,
                        'currency': pkg.currency,
                        'capacity': pkg.capacity,
                    } for pkg in trip.packages.all()],
                })

            return Response(trips_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Failed to fetch upcoming trips: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

