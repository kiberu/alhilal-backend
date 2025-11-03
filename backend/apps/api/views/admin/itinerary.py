"""
Admin ViewSet for Itinerary management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from apps.trips.models import ItineraryItem
from apps.api.serializers.admin import AdminItineraryItemSerializer


class AdminItineraryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing itinerary items."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminItineraryItemSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['trip']
    ordering_fields = ['day_index', 'start_time']
    ordering = ['day_index', 'start_time']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return ItineraryItem.objects.none()
        return ItineraryItem.objects.all().select_related('trip')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder itinerary items."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can reorder items.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        item_ids = request.data.get('itemIds', [])
        
        if not item_ids:
            return Response(
                {'error': 'itemIds is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update day_index for each item
        for index, item_id in enumerate(item_ids, start=1):
            ItineraryItem.objects.filter(id=item_id).update(day_index=index)
        
        return Response({
            'success': True,
            'reordered': len(item_ids)
        })

