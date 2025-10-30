"""
Admin ViewSet for Passport management.
"""
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.pilgrims.models import Passport
from apps.api.serializers.admin import AdminPassportSerializer


class AdminPassportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing passports (staff only).
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminPassportSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pilgrim', 'issue_country']
    search_fields = ['passport_no', 'pilgrim__user__name']
    ordering_fields = ['created_at', 'expiry_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return passports based on staff permission."""
        user = self.request.user
        
        if not user.is_staff:
            return Passport.objects.none()
        
        return Passport.objects.all().select_related('pilgrim__user')
    
    def create(self, request, *args, **kwargs):
        """Create a new passport."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create passports.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update a passport."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update passports.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a passport."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete passports.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

