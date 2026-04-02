"""Phase 3 mobile pilgrim support views."""

from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.common.permissions import HasPilgrimProfile
from apps.pilgrims.models import DeviceInstallation, NotificationPreference, TripFeedback
from apps.trips.models import ItineraryItem, TripResource
from apps.api.serializers.support import (
    DeviceInstallationSerializer,
    NotificationPreferenceSerializer,
    PilgrimTripFeedbackSerializer,
    PilgrimTripFeedbackStateSerializer,
    PilgrimTripFeedbackUpsertSerializer,
    TripDailyProgramSerializer,
)
from apps.api.serializers.trips import TripResourceSerializer


ACTIVE_BOOKING_STATUSES = ['EOI', 'BOOKED', 'CONFIRMED']
POST_TRIP_ELIGIBLE_STATUSES = {'RETURNED', 'POST_TRIP', 'ARCHIVED'}


def get_trip_booking_for_request(request, trip_id):
    """Return the authenticated pilgrim's booking for a trip or raise permission denied."""
    from rest_framework.exceptions import PermissionDenied

    try:
        return Booking.objects.select_related('package__trip').get(
            pilgrim=request.user.pilgrim_profile,
            package__trip_id=trip_id,
            status__in=ACTIVE_BOOKING_STATUSES,
        )
    except Booking.DoesNotExist as exc:
        raise PermissionDenied("You don't have access to this trip") from exc


def is_feedback_eligible(trip) -> tuple[bool, str]:
    """Return whether a trip is ready for post-trip feedback."""
    today = timezone.now().date()
    if trip.status in POST_TRIP_ELIGIBLE_STATUSES or trip.end_date < today:
        return True, ''
    return False, 'Feedback opens after the trip has returned or moved into its post-trip state.'


class NotificationPreferenceView(APIView):
    """Get and update pilgrim notification preferences."""

    permission_classes = [IsAuthenticated, HasPilgrimProfile]

    def get(self, request):
        preferences = NotificationPreference.get_for_pilgrim(request.user.pilgrim_profile)
        serializer = NotificationPreferenceSerializer(preferences)
        return Response(serializer.data)

    def put(self, request):
        preferences = NotificationPreference.get_for_pilgrim(request.user.pilgrim_profile)
        serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(NotificationPreferenceSerializer(preferences).data)


class DeviceInstallationListView(generics.ListCreateAPIView):
    """List and register pilgrim device installations."""

    permission_classes = [IsAuthenticated, HasPilgrimProfile]
    serializer_class = DeviceInstallationSerializer
    pagination_class = None

    def get_queryset(self):
        return DeviceInstallation.objects.filter(
            pilgrim=self.request.user.pilgrim_profile
        ).order_by('-last_seen_at', '-updated_at')

    def create(self, request, *args, **kwargs):
        installation_id = str(request.data.get('installation_id', '')).strip()
        if not installation_id:
            return Response({'installation_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        existing = DeviceInstallation.objects.filter(installation_id=installation_id).first()
        payload = request.data.copy()
        payload['installation_id'] = installation_id

        if existing:
            serializer = self.get_serializer(existing, data=payload, partial=True)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(
                pilgrim=request.user.pilgrim_profile,
                last_seen_at=timezone.now(),
            )
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(
            pilgrim=request.user.pilgrim_profile,
            last_seen_at=timezone.now(),
        )
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)


class DeviceInstallationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update or remove a pilgrim device installation."""

    permission_classes = [IsAuthenticated, HasPilgrimProfile]
    serializer_class = DeviceInstallationSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return DeviceInstallation.objects.filter(pilgrim=self.request.user.pilgrim_profile)

    def perform_update(self, serializer):
        serializer.save(last_seen_at=timezone.now())


class TripDailyProgramView(APIView):
    """Return a booked pilgrim's daily program and pinned file resource."""

    permission_classes = [IsAuthenticated, HasPilgrimProfile]

    def get(self, request, trip_id):
        booking = get_trip_booking_for_request(request, trip_id)
        trip = booking.package.trip

        itinerary_items = list(
            ItineraryItem.objects.filter(trip_id=trip_id).order_by('day_index', 'start_time', 'created_at')
        )
        pinned_resource = TripResource.objects.filter(
            trip_id=trip_id,
            resource_type='DAILY_PROGRAM',
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        ).order_by('-is_pinned', 'order', 'title').first()

        grouped_days: dict[int, dict] = {}
        updated_candidates = [trip.updated_at]

        for item in itinerary_items:
            date_value = trip.start_date + timedelta(days=max(item.day_index - 1, 0))
            grouped_days.setdefault(
                item.day_index,
                {
                    'id': f'{trip.id}:day:{item.day_index}',
                    'day_index': item.day_index,
                    'label': f'Day {item.day_index}',
                    'date': date_value,
                    'items': [],
                },
            )
            grouped_days[item.day_index]['items'].append(
                {
                    'id': str(item.id),
                    'day_index': item.day_index,
                    'title': item.title,
                    'location': item.location,
                    'notes': item.notes,
                    'start_time': item.start_time,
                    'end_time': item.end_time,
                }
            )
            updated_candidates.append(item.updated_at)

        if pinned_resource:
            updated_candidates.append(pinned_resource.updated_at)

        total_days = max((trip.end_date - trip.start_date).days + 1, 1)
        today = timezone.now().date()
        current_day_index = min(max((today - trip.start_date).days + 1, 1), total_days)

        payload = {
            'trip_id': trip.id,
            'trip_code': trip.code,
            'trip_name': trip.name,
            'trip_status': trip.status,
            'current_day_index': current_day_index,
            'is_trip_live': trip.start_date <= today <= trip.end_date,
            'pinned_resource': TripResourceSerializer(pinned_resource).data if pinned_resource else None,
            'days': list(grouped_days.values()),
            'updated_at': max(updated_candidates) if updated_candidates else None,
        }
        serializer = TripDailyProgramSerializer(payload)
        return Response(serializer.data)


class TripFeedbackView(APIView):
    """Return and update post-trip feedback for a booked pilgrim."""

    permission_classes = [IsAuthenticated, HasPilgrimProfile]

    def get(self, request, trip_id):
        booking = get_trip_booking_for_request(request, trip_id)
        eligible, reason = is_feedback_eligible(booking.package.trip)
        feedback = TripFeedback.objects.filter(booking=booking).first()

        serializer = PilgrimTripFeedbackStateSerializer(
            {
                'eligible': eligible,
                'reason': reason,
                'feedback': feedback,
            }
        )
        return Response(serializer.data)

    def post(self, request, trip_id):
        booking = get_trip_booking_for_request(request, trip_id)
        trip = booking.package.trip
        eligible, reason = is_feedback_eligible(trip)
        if not eligible:
            return Response({'error': reason}, status=status.HTTP_400_BAD_REQUEST)

        feedback = TripFeedback.objects.filter(booking=booking).first()
        if feedback and feedback.status == 'SUBMITTED':
            return Response(
                {'error': 'Feedback for this trip has already been submitted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PilgrimTripFeedbackUpsertSerializer(feedback, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        target_status = serializer.validated_data.get('status', feedback.status if feedback else 'DRAFT')
        submitted_at = feedback.submitted_at if feedback else None
        if target_status == 'SUBMITTED' and submitted_at is None:
            submitted_at = timezone.now()

        instance = serializer.save(
            pilgrim=request.user.pilgrim_profile,
            booking=booking,
            trip=trip,
            status=target_status,
            submitted_at=submitted_at,
        )
        response_status = status.HTTP_200_OK if feedback else status.HTTP_201_CREATED
        return Response(PilgrimTripFeedbackSerializer(instance).data, status=response_status)
