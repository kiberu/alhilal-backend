"""
Views for pilgrim profile and related data.
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.accounts.models import PilgrimProfile
from apps.common.permissions import IsPilgrim
from apps.api.serializers.profile import (
    PilgrimProfileSerializer,
    BookingSummarySerializer
)
from apps.api.serializers.trips import PilgrimBookingCreateSerializer, PilgrimBookingDetailSerializer


class MeView(generics.RetrieveAPIView):
    """
    Get user profile information.
    
    GET /api/v1/me
    
    Returns pilgrim profile with masked passport information.
    Works for both pilgrims and staff with pilgrim profiles.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimProfileSerializer
    
    def get_object(self):
        """Return the pilgrim profile for the current user."""
        try:
            return self.request.user.pilgrim_profile
        except:
            # For users without pilgrim profile, return None or raise 404
            from rest_framework.exceptions import NotFound
            raise NotFound("User does not have a pilgrim profile. Please complete your profile first.")


class UpdateProfileView(APIView):
    """
    Update user profile information.
    
    PUT /api/v1/profile/update
    
    Updates basic profile information for the authenticated user.
    Works for both pilgrims and staff with pilgrim profiles.
    """
    
    permission_classes = [IsAuthenticated]
    
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


class MyBookingsView(generics.ListAPIView):
    """
    Get user's bookings.
    
    GET /api/v1/me/bookings
    
    Returns all bookings with trip and package information.
    Works for both pilgrims and staff with pilgrim profiles.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimBookingDetailSerializer
    pagination_class = None  # Disable pagination for user's own bookings
    
    def get_queryset(self):
        """Return bookings for the current user."""
        try:
            pilgrim = self.request.user.pilgrim_profile
            return Booking.objects.filter(
                pilgrim=pilgrim
            ).select_related(
                'package__trip', 'currency'
            ).order_by('-created_at')
        except:
            # User doesn't have a pilgrim profile, return empty queryset
            return Booking.objects.none()


class MyBookingDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific booking.
    
    GET /api/v1/me/bookings/{id}
    
    Returns detailed information about a single booking.
    Works for both pilgrims and staff with pilgrim profiles.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = PilgrimBookingDetailSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return bookings for the current user only."""
        try:
            pilgrim = self.request.user.pilgrim_profile
            return Booking.objects.filter(
                pilgrim=pilgrim
            ).select_related(
                'package__trip', 'currency'
            )
        except:
            # User doesn't have a pilgrim profile, return empty queryset
            return Booking.objects.none()


class CreateBookingView(APIView):
    """
    Create a new booking.
    
    POST /api/v1/bookings/create
    
    Creates a booking for the authenticated user (pilgrim or staff).
    Staff users need a pilgrim profile to create bookings.
    """
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a new booking."""
        serializer = PilgrimBookingCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                booking = serializer.save()
                # Return detailed booking info
                detail_serializer = PilgrimBookingDetailSerializer(booking)
                return Response(
                    detail_serializer.data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



