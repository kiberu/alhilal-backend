"""
Admin ViewSets for Trip content: Updates, Guides, Checklists, Contacts, FAQs.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from apps.trips.models import (
    TripUpdate, TripGuideSection, ChecklistItem, 
    EmergencyContact, TripFAQ
)
from apps.api.serializers.admin import (
    AdminTripUpdateSerializer,
    AdminTripGuideSectionSerializer,
    AdminChecklistItemSerializer,
    AdminEmergencyContactSerializer,
    AdminTripFAQSerializer
)


class AdminTripUpdateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing trip updates/announcements."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminTripUpdateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'urgency', 'pinned']
    search_fields = ['title', 'body_md']
    ordering_fields = ['publish_at', 'created_at', 'pinned']
    ordering = ['-pinned', '-publish_at']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return TripUpdate.objects.none()
        return TripUpdate.objects.all().select_related('trip', 'package')
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pin status of update."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can pin updates.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        update = self.get_object()
        update.pinned = not update.pinned
        update.save()
        
        return Response({
            'success': True,
            'pinned': update.pinned
        })


class AdminTripGuideSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing trip guide sections."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminTripGuideSectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['title', 'content_md']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return TripGuideSection.objects.none()
        return TripGuideSection.objects.all().select_related('trip')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder guide sections."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can reorder sections.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        section_ids = request.data.get('sectionIds', [])
        
        if not section_ids:
            return Response(
                {'error': 'sectionIds is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for index, section_id in enumerate(section_ids):
            TripGuideSection.objects.filter(id=section_id).update(order=index)
        
        return Response({
            'success': True,
            'reordered': len(section_ids)
        })


class AdminChecklistItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing checklist items."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminChecklistItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'category', 'is_required']
    search_fields = ['label']
    ordering_fields = ['category', 'label']
    ordering = ['category', 'label']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return ChecklistItem.objects.none()
        return ChecklistItem.objects.all().select_related('trip', 'package')


class AdminEmergencyContactViewSet(viewsets.ModelViewSet):
    """ViewSet for managing emergency contacts."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminEmergencyContactSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['label', 'phone']
    ordering_fields = ['label']
    ordering = ['label']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return EmergencyContact.objects.none()
        return EmergencyContact.objects.all().select_related('trip')


class AdminTripFAQViewSet(viewsets.ModelViewSet):
    """ViewSet for managing trip FAQs."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = AdminTripFAQSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['question', 'answer']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        if not self.request.user.is_staff:
            return TripFAQ.objects.none()
        return TripFAQ.objects.all().select_related('trip')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder FAQs."""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can reorder FAQs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        faq_ids = request.data.get('faqIds', [])
        
        if not faq_ids:
            return Response(
                {'error': 'faqIds is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for index, faq_id in enumerate(faq_ids):
            TripFAQ.objects.filter(id=faq_id).update(order=index)
        
        return Response({
            'success': True,
            'reordered': len(faq_ids)
        })

