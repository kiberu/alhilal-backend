"""
Admin ViewSet for website lead management.
"""
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.api.serializers.admin import AdminWebsiteLeadSerializer
from apps.common.models import WebsiteLead
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin, user_has_staff_role


class AdminWebsiteLeadViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for staff visibility and follow-up on website leads."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminWebsiteLeadSerializer
    http_method_names = ['get', 'patch', 'head', 'options']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'interest_type', 'source', 'trip']
    search_fields = [
        'name',
        'phone',
        'email',
        'notes',
        'follow_up_notes',
        'page_path',
        'context_label',
        'cta_label',
        'trip__name',
        'trip__code',
    ]
    ordering_fields = ['created_at', 'contacted_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return leads within the caller's staff permissions."""
        user = self.request.user
        if not user_has_staff_role(user, self.get_allowed_staff_roles(self.request)):
            return WebsiteLead.objects.none()

        queryset = WebsiteLead.objects.all().select_related('trip', 'assigned_to')

        created_after = parse_date(self.request.query_params.get('created_after', ''))
        created_before = parse_date(self.request.query_params.get('created_before', ''))

        if created_after:
            queryset = queryset.filter(created_at__date__gte=created_after)
        if created_before:
            queryset = queryset.filter(created_at__date__lte=created_before)

        return queryset

    def list(self, request, *args, **kwargs):
        """List leads with the same manual pagination shape used elsewhere in admin."""
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
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })
