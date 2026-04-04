"""Views for public and pilgrim content endpoints."""

from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.api.serializers.platform import GuidanceArticleDetailSerializer, GuidanceArticleListSerializer
from apps.content.models import Dua, GuidanceArticle
from apps.common.permissions import HasPilgrimProfile
from apps.api.serializers.trips import DuaSerializer


class DuaListView(generics.ListAPIView):
    """
    List duas.
    
    GET /api/v1/duas?category=TAWAF|SAI|ARAFAT|GENERAL
    
    Query parameters:
    - category: Filter by category (optional)
    """
    
    permission_classes = [IsAuthenticated, HasPilgrimProfile]
    serializer_class = DuaSerializer
    
    def get_queryset(self):
        """Return duas, optionally filtered by category."""
        queryset = Dua.objects.all()
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category and category in dict(Dua.CATEGORY_CHOICES):
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('category', 'id')


class PublicGuidanceArticleListView(generics.ListAPIView):
    """List published guidance articles for public website and mobile surfaces."""

    permission_classes = [AllowAny]
    serializer_class = GuidanceArticleListSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = GuidanceArticle.objects.filter(
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        ).select_related('author')

        featured_param = self.request.query_params.get('featured')
        if featured_param:
            normalized = featured_param.strip().lower()
            if normalized in {'true', '1', 'yes'}:
                queryset = queryset.filter(featured=True)
            elif normalized in {'false', '0', 'no'}:
                queryset = queryset.filter(featured=False)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category.strip())

        queryset = queryset.order_by('-featured', 'featured_order', '-published_at', '-created_at')
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                parsed_limit = max(1, min(int(limit), 50))
                queryset = queryset[:parsed_limit]
            except (TypeError, ValueError):
                pass

        return queryset


class PublicGuidanceArticleDetailView(generics.RetrieveAPIView):
    """Retrieve one published guidance article by slug."""

    permission_classes = [AllowAny]
    serializer_class = GuidanceArticleDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return GuidanceArticle.objects.filter(
            published_at__isnull=False,
            published_at__lte=timezone.now(),
        ).select_related('author')
