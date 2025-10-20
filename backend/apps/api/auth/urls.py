from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RequestOTPView, VerifyOTPView

urlpatterns = [
    # OTP authentication
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    
    # JWT token refresh
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

