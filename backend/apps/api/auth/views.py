"""
Authentication views for OTP and JWT.
"""
import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from apps.accounts.models import OTPCode, PilgrimProfile
from .serializers import RequestOTPSerializer, VerifyOTPSerializer, TokenResponseSerializer

Account = get_user_model()
logger = logging.getLogger(__name__)


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='post')
@method_decorator(ratelimit(key='user_or_ip', rate='10/h', method='POST'), name='post')
class RequestOTPView(APIView):
    """
    Request an OTP code for authentication.
    
    Rate limits:
    - 5 requests per minute per IP
    - 10 requests per hour per phone
    
    POST /api/v1/auth/request-otp
    {
        "phone": "+256712345678"
    }
    
    Returns:
    {
        "sent": true,
        "expires_in": 600
    }
    """
    
    permission_classes = [AllowAny]
    serializer_class = RequestOTPSerializer
    
    def post(self, request):
        """Generate and send OTP code."""
        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        
        # Check for recent OTP requests (prevent spam)
        recent_otp = OTPCode.objects.filter(
            phone=phone,
            created_at__gte=timezone.now() - timedelta(seconds=60)
        ).first()
        
        if recent_otp and not recent_otp.consumed_at:
            return Response(
                {
                    'error': {
                        'code': 'TOO_MANY_REQUESTS',
                        'message': 'Please wait before requesting another OTP code'
                    }
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Generate 6-digit OTP code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Calculate expiry
        expiry = timezone.now() + timedelta(seconds=settings.OTP_EXPIRY_SECONDS)
        
        # Save OTP code
        otp = OTPCode.objects.create(
            phone=phone,
            code=code,
            expires_at=expiry,
            attempts=0
        )
        
        # TODO: Send SMS in production
        # For MVP, we log the code
        logger.info(f"OTP for {phone}: {code}")
        if settings.DEBUG:
            # In development, return the code for testing
            return Response({
                'sent': True,
                'expires_in': settings.OTP_EXPIRY_SECONDS,
                'debug_code': code  # Remove in production!
            })
        
        return Response({
            'sent': True,
            'expires_in': settings.OTP_EXPIRY_SECONDS
        })


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class VerifyOTPView(APIView):
    """
    Verify OTP code and get JWT tokens.
    
    Creates a new pilgrim account if this is the first time logging in.
    
    POST /api/v1/auth/verify-otp
    {
        "phone": "+256712345678",
        "code": "123456"
    }
    
    Returns:
    {
        "access": "eyJ...",
        "refresh": "eyJ...",
        "user": {
            "id": "uuid",
            "name": "John Doe",
            "phone": "+256712345678",
            "role": "PILGRIM"
        }
    }
    """
    
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer
    
    def post(self, request):
        """Verify OTP and issue JWT tokens."""
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']
        
        # Find valid OTP
        try:
            otp = OTPCode.objects.filter(
                phone=phone,
                consumed_at__isnull=True,
                expires_at__gt=timezone.now()
            ).latest('created_at')
        except OTPCode.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'INVALID_OTP',
                        'message': 'Invalid or expired OTP code'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check attempts
        if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
            return Response(
                {
                    'error': {
                        'code': 'MAX_ATTEMPTS_EXCEEDED',
                        'message': 'Maximum OTP attempts exceeded. Please request a new code.'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify code
        if otp.code != code:
            otp.attempts += 1
            otp.save()
            
            remaining = settings.OTP_MAX_ATTEMPTS - otp.attempts
            return Response(
                {
                    'error': {
                        'code': 'INVALID_CODE',
                        'message': f'Invalid OTP code. {remaining} attempts remaining.'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark OTP as consumed
        otp.consumed_at = timezone.now()
        otp.save()
        
        # Get or create user account
        user, created = Account.objects.get_or_create(
            phone=phone,
            defaults={
                'role': 'PILGRIM',
                'name': f'Pilgrim {phone[-4:]}',  # Temporary name
                'is_active': True
            }
        )
        
        # Create pilgrim profile if new user
        if created:
            PilgrimProfile.objects.create(user=user)
            logger.info(f"Created new pilgrim account for {phone}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user
        }
        
        serializer = TokenResponseSerializer(response_data)
        return Response(serializer.data, status=status.HTTP_200_OK)

