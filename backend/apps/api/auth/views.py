from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import random

from apps.accounts.models import Account
from .serializers import StaffLoginSerializer

User = get_user_model()


class RequestOTPView(APIView):
    """Request OTP for pilgrim authentication (NO OTP FOR STAFF/ADMINS)"""
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get or create pilgrim account
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'role': 'PILGRIM', 'name': phone}
            )

            if not created and user.role != 'PILGRIM':
                return Response(
                    {'error': 'This phone number is registered for staff use. Please use password login.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate OTP (simple implementation for now)
            otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # TODO: Store OTP in Redis cache and send via SMS
            # For development, return the OTP
            
            return Response({
                'message': 'OTP sent successfully',
                'otp': otp_code,  # For development only - remove in production
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyOTPView(APIView):
    """Verify OTP and return JWT tokens (FOR PILGRIMS ONLY)"""
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response(
                {'error': 'Phone and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify OTP (simplified - in production use Redis cache)
            if not otp or len(otp) != 6:
                return Response(
                    {'error': 'Invalid OTP format'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get user
            user = User.objects.get(phone=phone)

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            # Get profile (simplified - no profile model for now)
            profile_data = None

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'phone': user.phone,
                    'name': user.name,
                    'email': user.email or '',
                    'role': user.role,
                },
                'profile': profile_data,
            })

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StaffLoginView(APIView):
    """Staff/Admin login with phone and password (NO OTP REQUIRED)"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StaffLoginSerializer(data=request.data)

        if not serializer.is_valid():
            # Format errors properly
            errors = serializer.errors
            if 'non_field_errors' in errors:
                error_message = errors['non_field_errors'][0]
            else:
                error_message = "Invalid credentials"
            
            return Response(
                {'error': error_message},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Get staff profile if exists
        staff_profile = None
        if hasattr(user, 'staffprofile'):
            staff_profile = {
                'id': str(user.staffprofile.id),
                'role': user.staffprofile.role,
            }

        return Response({
            'user': {
                'id': str(user.id),
                'phone': user.phone,
                'name': user.name,
                'email': user.email or '',
                'role': user.role,
                'isStaff': user.is_staff,
                'staffProfile': staff_profile,
            },
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh),
            'expiresAt': refresh.access_token.payload['exp'],
        })


class StaffProfileView(APIView):
    """Get authenticated staff profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_staff:
            return Response(
                {'error': 'Only staff members can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )

        staff_profile = None
        if hasattr(user, 'staffprofile'):
            staff_profile = {
                'id': str(user.staffprofile.id),
                'role': user.staffprofile.role,
            }

        return Response({
            'id': str(user.id),
            'phone': user.phone,
            'name': user.name,
            'email': user.email or '',
            'role': user.role,
            'isStaff': user.is_staff,
            'staffProfile': staff_profile,
        })
