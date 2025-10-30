"""
Admin ViewSet for Dua management.
Staff can create, read, update, delete duas.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.content.models import Dua
from apps.api.serializers.admin import AdminDuaSerializer


class AdminDuaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing duas (staff only).
    
    list:   GET /duas - List all duas with filters
    create: POST /duas - Create a new dua
    retrieve: GET /duas/:id - Get dua details
    update: PATCH /duas/:id - Update dua
    destroy: DELETE /duas/:id - Delete dua
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminDuaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['text_ar', 'text_en', 'transliteration']
    ordering_fields = ['created_at', 'category']
    ordering = ['category', 'id']
    
    def get_queryset(self):
        """Return duas based on staff permission."""
        user = self.request.user
        
        if not user.is_staff:
            return Dua.objects.none()
        
        return Dua.objects.all()
    
    def list(self, request, *args, **kwargs):
        """List duas with pagination."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get pagination params
        page_size = request.query_params.get('page_size', 20)
        page = request.query_params.get('page', 1)
        
        try:
            page_size = int(page_size)
            page = int(page)
        except ValueError:
            page_size = 20
            page = 1
        
        # Manual pagination
        start = (page - 1) * page_size
        end = start + page_size
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size
        
        duas = queryset[start:end]
        serializer = self.get_serializer(duas, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'totalPages': total_pages,
            'page': page,
            'pageSize': page_size,
        })
    
    def create(self, request, *args, **kwargs):
        """Create a new dua."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can create duas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update a dua."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can update duas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a dua."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can delete duas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder duas."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff members can reorder duas.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # This is a placeholder - implement based on your ordering logic
        return Response({'message': 'Reorder not yet implemented'}, status=status.HTTP_501_NOT_IMPLEMENTED)

