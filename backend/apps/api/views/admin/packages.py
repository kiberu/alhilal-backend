"""
Admin ViewSet for Trip Package management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from apps.trips.models import TripPackage, PackageFlight, PackageHotel
from apps.api.serializers.admin import (
    AdminPackageSerializer,
    AdminPackageFlightSerializer,
    AdminPackageHotelSerializer
)
from apps.common.permissions import StaffActionRolePermission, StaffRoleAccessMixin, user_has_staff_role


class AdminPackageViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing trip packages."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminPackageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['trip', 'visibility']
    search_fields = ['name']
    ordering_fields = ['created_at', 'name', 'price_minor_units']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return TripPackage.objects.none()
        return TripPackage.objects.all().select_related('trip')
    
    @action(detail=True, methods=['get'])
    def flights(self, request, pk=None):
        """Get flights for this package."""
        package = self.get_object()
        flights = package.flights.all()
        serializer = AdminPackageFlightSerializer(flights, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def hotels(self, request, pk=None):
        """Get hotels for this package."""
        package = self.get_object()
        hotels = package.hotels.all()
        serializer = AdminPackageHotelSerializer(hotels, many=True)
        return Response(serializer.data)


class AdminPackageFlightViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing package flights."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminPackageFlightSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['package', 'leg']
    ordering_fields = ['dep_dt', 'arr_dt']
    ordering = ['dep_dt']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return PackageFlight.objects.none()
        return PackageFlight.objects.all().select_related('package__trip')


class AdminPackageHotelViewSet(StaffRoleAccessMixin, viewsets.ModelViewSet):
    """ViewSet for managing package hotels."""
    
    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    serializer_class = AdminPackageHotelSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['package']
    ordering_fields = ['check_in', 'check_out']
    ordering = ['check_in']
    
    def get_queryset(self):
        if not user_has_staff_role(self.request.user, self.get_allowed_staff_roles(self.request)):
            return PackageHotel.objects.none()
        return PackageHotel.objects.all().select_related('package__trip')
