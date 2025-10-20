from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RequestOTPView, VerifyOTPView, StaffLoginView, StaffProfileView

urlpatterns = [
    # OTP authentication (for pilgrims)
    path('otp/request/', RequestOTPView.as_view(), name='request-otp'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify-otp'),
    
    # Staff authentication
    path('staff/login/', StaffLoginView.as_view(), name='staff-login'),
    path('staff/profile/', StaffProfileView.as_view(), name='staff-profile'),
    
    # JWT token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

