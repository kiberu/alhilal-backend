"""
Admin ViewSet for Visa management.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.pilgrims.models import Visa
from apps.api.serializers.admin import AdminVisaSerializer


class AdminVisaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visas (staff only).
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminVisaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pilgrim', 'trip', 'status']
    search_fields = ['visa_no', 'pilgrim__user__name']
    ordering_fields = ['created_at', 'issue_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return visas based on staff permission."""
        user = self.request.user
        
        if not user.is_staff:
            return Visa.objects.none()
        
        return Visa.objects.all().select_related('pilgrim__user', 'trip')
    
    def create(self, request, *args, **kwargs):
        """Create a new visa."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create visas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update a visa."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update visas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a visa."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete visas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'], url_path='bulk/submit')
    def bulk_submit(self, request):
        """Mark multiple visas as submitted."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        visa_ids = request.data.get('ids', [])
        updated = Visa.objects.filter(id__in=visa_ids).update(status='SUBMITTED')
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='bulk/approve')
    def bulk_approve(self, request):
        """Approve multiple visas."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        visa_ids = request.data.get('ids', [])
        updated = Visa.objects.filter(id__in=visa_ids).update(status='APPROVED')
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='bulk/reject')
    def bulk_reject(self, request):
        """Reject multiple visas."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can perform bulk actions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        visa_ids = request.data.get('ids', [])
        updated = Visa.objects.filter(id__in=visa_ids).update(status='REJECTED')
        
        return Response({'updated': updated}, status=status.HTTP_200_OK)

