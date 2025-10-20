"""
Views for content (duas).
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from apps.content.models import Dua
from apps.common.permissions import IsPilgrim
from apps.api.serializers.trips import DuaSerializer


class DuaListView(generics.ListAPIView):
    """
    List duas.
    
    GET /api/v1/duas?category=TAWAF|SAI|ARAFAT|GENERAL
    
    Query parameters:
    - category: Filter by category (optional)
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = DuaSerializer
    
    def get_queryset(self):
        """Return duas, optionally filtered by category."""
        queryset = Dua.objects.all()
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category and category in dict(Dua.CATEGORY_CHOICES):
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('category', 'id')

