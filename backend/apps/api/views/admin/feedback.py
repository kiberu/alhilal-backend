"""Admin review surface for post-trip pilgrim feedback."""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from apps.api.serializers.admin import AdminTripFeedbackSerializer
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin
from apps.pilgrims.models import TripFeedback


class AdminTripFeedbackViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for staff review of post-trip feedback."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripFeedbackSerializer
    http_method_names = ['get', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'trip', 'follow_up_requested', 'testimonial_opt_in']
    search_fields = [
        'booking__reference_number',
        'pilgrim__full_name',
        'pilgrim__user__name',
        'trip__code',
        'trip__name',
        'highlights',
        'improvements',
    ]
    ordering_fields = ['submitted_at', 'updated_at', 'reviewed_at', 'overall_rating']
    ordering = ['-submitted_at', '-updated_at']

    def get_queryset(self):
        """Return all feedback rows for staff review."""
        return TripFeedback.objects.select_related(
            'pilgrim__user',
            'booking',
            'trip',
            'reviewed_by',
        )

    def list(self, request, *args, **kwargs):
        """List feedback with the manual admin pagination shape."""
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
        return Response(
            {
                'results': serializer.data,
                'count': total_count,
                'totalPages': total_pages,
                'page': page,
                'pageSize': page_size,
            }
        )

    def perform_update(self, serializer):
        """Record reviewer identity when staff adds review state."""
        update_fields = serializer.validated_data
        if any(field in update_fields for field in ['review_notes', 'reviewed_by', 'reviewed_at']):
            serializer.save(reviewed_by=self.request.user, reviewed_at=timezone.now())
            return
        serializer.save()
