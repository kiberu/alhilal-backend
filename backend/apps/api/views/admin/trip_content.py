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
    EmergencyContact, TripFAQ, TripMilestone, TripResource
)
from apps.api.serializers.admin import (
    AdminTripUpdateSerializer,
    AdminTripGuideSectionSerializer,
    AdminChecklistItemSerializer,
    AdminEmergencyContactSerializer,
    AdminTripFAQSerializer,
    AdminTripMilestoneSerializer,
    AdminTripResourceSerializer
)
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin, user_has_staff_role


class AdminTripUpdateViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip updates/announcements."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripUpdateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'urgency', 'pinned']
    search_fields = ['title', 'body_md']
    ordering_fields = ['publish_at', 'created_at', 'pinned']
    ordering = ['-pinned', '-publish_at']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripUpdate.objects.none()
        return TripUpdate.objects.all().select_related('trip', 'package')
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pin status of update."""
        update = self.get_object()
        update.pinned = not update.pinned
        update.save()
        
        return Response({
            'success': True,
            'pinned': update.pinned
        })


class AdminTripGuideSectionViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip guide sections."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripGuideSectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['title', 'content_md']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripGuideSection.objects.none()
        return TripGuideSection.objects.all().select_related('trip')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder guide sections."""
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


class AdminChecklistItemViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing checklist items."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminChecklistItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'category', 'is_required']
    search_fields = ['label']
    ordering_fields = ['category', 'label']
    ordering = ['category', 'label']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return ChecklistItem.objects.none()
        return ChecklistItem.objects.all().select_related('trip', 'package')


class AdminEmergencyContactViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing emergency contacts."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminEmergencyContactSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['label', 'phone']
    ordering_fields = ['label']
    ordering = ['label']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return EmergencyContact.objects.none()
        return EmergencyContact.objects.all().select_related('trip')


class AdminTripFAQViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip FAQs."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripFAQSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip']
    search_fields = ['question', 'answer']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripFAQ.objects.none()
        return TripFAQ.objects.all().select_related('trip')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder FAQs."""
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


class AdminTripMilestoneViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip milestones."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripMilestoneSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'milestone_type', 'status', 'is_public']
    search_fields = ['title', 'notes']
    ordering_fields = ['target_date', 'actual_date', 'order', 'created_at']
    ordering = ['target_date', 'order']

    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripMilestone.objects.none()
        return TripMilestone.objects.all().select_related('trip', 'package', 'owner')


class AdminTripResourceViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip resources."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminTripResourceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'package', 'resource_type', 'viewer_mode', 'is_pinned']
    search_fields = ['title', 'description', 'file_public_id']
    ordering_fields = ['published_at', 'order', 'created_at']
    ordering = ['-is_pinned', 'order']

    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripResource.objects.none()
        return TripResource.objects.all().select_related('trip', 'package')
