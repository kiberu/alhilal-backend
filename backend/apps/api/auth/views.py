from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from apps.accounts.models import Account, OTPCode
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
            # Check for recent OTP requests (rate limiting)
            recent_otp = OTPCode.objects.filter(
                phone=phone,
                created_at__gte=timezone.now() - timedelta(seconds=60)
            ).first()
            
            if recent_otp:
                return Response(
                    {'error': 'OTP already sent. Please wait before requesting again.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

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

            # Generate OTP
            otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            expires_at = timezone.now() + timedelta(minutes=10)
            
            # Create OTP record
            OTPCode.objects.create(
                phone=phone,
                code=otp_code,
                expires_at=expires_at,
                attempts=0
            )
            
            # TODO: Send OTP via SMS in production
            # For development, the OTP is stored in database
            
            return Response({
                'sent': True,
                'expires_in': 600,  # 10 minutes in seconds
                'message': 'OTP sent successfully',
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
            # Get the most recent OTP for this phone
            otp_record = OTPCode.objects.filter(
                phone=phone,
                consumed_at__isnull=True
            ).order_by('-created_at').first()

            if not otp_record:
                return Response(
                    {'error': 'No OTP found. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if OTP has expired
            if timezone.now() > otp_record.expires_at:
                return Response(
                    {'error': 'OTP has expired. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check max attempts
            if otp_record.attempts >= 5:
                return Response(
                    {'error': 'Maximum verification attempts exceeded. Please request a new OTP.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify OTP code
            if otp_record.code != otp:
                otp_record.attempts += 1
                otp_record.save()
                return Response(
                    {'error': 'Invalid OTP code.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark OTP as consumed
            otp_record.consumed_at = timezone.now()
            otp_record.save()

            # Get or create user
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults={'role': 'PILGRIM', 'name': phone}
            )

            # Create pilgrim profile if new user
            if created:
                from apps.accounts.models import PilgrimProfile
                PilgrimProfile.objects.create(user=user)

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            # Get profile data
            profile_data = None
            if hasattr(user, 'pilgrim_profile'):
                profile_data = {
                    'id': str(user.pilgrim_profile.id),
                    'dob': str(user.pilgrim_profile.dob) if user.pilgrim_profile.dob else None,
                    'nationality': user.pilgrim_profile.nationality,
                }

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
