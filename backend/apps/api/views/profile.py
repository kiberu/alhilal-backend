"""
Views for pilgrim profile and related data.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.pilgrims.models import Visa
from apps.bookings.models import Booking
from apps.accounts.models import PilgrimProfile
from apps.common.permissions import IsPilgrim
from apps.api.serializers.profile import (
    PilgrimProfileSerializer,
    VisaSerializer,
    BookingSummarySerializer
)


class MeView(generics.RetrieveAPIView):
    """
    Get pilgrim profile information.
    
    GET /api/v1/me
    
    Returns pilgrim profile with masked passport information.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = PilgrimProfileSerializer
    
    def get_object(self):
        """Return the pilgrim profile for the current user."""
        return self.request.user.pilgrim_profile


class UpdateProfileView(APIView):
    """
    Update pilgrim profile information.
    
    PUT /api/v1/profile/update
    
    Updates basic profile information for the authenticated pilgrim.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    
    def put(self, request):
        """Update pilgrim profile."""
        try:
            user = request.user
            
            # Ensure profile exists - for OneToOneField, use try-except
            try:
                profile = user.pilgrim_profile
            except PilgrimProfile.DoesNotExist:
                return Response(
                    {'error': 'Pilgrim profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Update user name if provided
            if 'full_name' in request.data:
                full_name = request.data.get('full_name')
                profile.full_name = full_name
                # Also update the user's name field
                user.name = full_name
                user.save()
            
            # Update profile fields
            if 'dob' in request.data:
                profile.dob = request.data.get('dob')
            
            if 'gender' in request.data:
                profile.gender = request.data.get('gender')
            
            if 'nationality' in request.data:
                profile.nationality = request.data.get('nationality')
            
            if 'passport_number' in request.data:
                profile.passport_number = request.data.get('passport_number')
            
            if 'address' in request.data:
                profile.address = request.data.get('address')
            
            if 'emergency_name' in request.data:
                profile.emergency_name = request.data.get('emergency_name')
            
            if 'emergency_phone' in request.data:
                profile.emergency_phone = request.data.get('emergency_phone')
            
            if 'emergency_relationship' in request.data:
                profile.emergency_relationship = request.data.get('emergency_relationship')
            
            profile.save()
            
            # Return updated profile
            serializer = PilgrimProfileSerializer(profile)
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
            
        except AttributeError as e:
            return Response(
                {'error': 'Pilgrim profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MyVisasView(generics.ListAPIView):
    """
    Get pilgrim's visas.
    
    GET /api/v1/me/visas?trip_id=<uuid>
    
    Optional query parameters:
    - trip_id: Filter by specific trip
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = VisaSerializer
    
    def get_queryset(self):
        """Return visas for the current user."""
        queryset = Visa.objects.filter(
            pilgrim=self.request.user.pilgrim_profile
        ).select_related('trip').order_by('-created_at')
        
        # Filter by trip if specified
        trip_id = self.request.query_params.get('trip_id')
        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        
        return queryset


class MyBookingsView(generics.ListAPIView):
    """
    Get pilgrim's bookings.
    
    GET /api/v1/me/bookings
    
    Returns all bookings with trip and package information.
    """
    
    permission_classes = [IsAuthenticated, IsPilgrim]
    serializer_class = BookingSummarySerializer
    
    def get_queryset(self):
        """Return bookings for the current user."""
        return Booking.objects.filter(
            pilgrim=self.request.user.pilgrim_profile
        ).select_related(
            'package__trip'
        ).order_by('-created_at')

