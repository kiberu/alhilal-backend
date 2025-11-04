from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.profile import MeView, MyVisasView, MyBookingsView
from .views.trips import (
    TripListView, TripDetailView, TripItineraryView,
    TripUpdatesView, TripEssentialsView
)
from .views.packages import (
    PackageDetailView, PackageFlightsView, PackageHotelsView
)
from .views.content import DuaListView
from .views.dashboard import (
    DashboardStatsView, DashboardActivityView, DashboardUpcomingTripsView
)
from .views.admin import (
    AdminTripViewSet, AdminBookingViewSet, AdminPilgrimViewSet,
    AdminDuaViewSet, AdminPassportViewSet, AdminVisaViewSet,
    AdminPackageViewSet, AdminPackageFlightViewSet, AdminPackageHotelViewSet,
    AdminItineraryItemViewSet, AdminTripUpdateViewSet, AdminTripGuideSectionViewSet,
    AdminChecklistItemViewSet, AdminEmergencyContactViewSet, AdminTripFAQViewSet,
    AdminUserListView, AdminUserDetailView, AdminUserChangePasswordView
)
from .views.admin.pilgrim_import import download_template, validate_import, import_pilgrims

app_name = 'api'

# Router for admin ViewSets (with trailing slash disabled to match frontend)
router = DefaultRouter(trailing_slash=False)
router.register(r'trips', AdminTripViewSet, basename='admin-trip')
router.register(r'bookings', AdminBookingViewSet, basename='admin-booking')
router.register(r'pilgrims', AdminPilgrimViewSet, basename='admin-pilgrim')
router.register(r'duas', AdminDuaViewSet, basename='admin-dua')
router.register(r'passports', AdminPassportViewSet, basename='admin-passport')
router.register(r'visas', AdminVisaViewSet, basename='admin-visa')
router.register(r'packages', AdminPackageViewSet, basename='admin-package')
router.register(r'flights', AdminPackageFlightViewSet, basename='admin-flight')
router.register(r'hotels', AdminPackageHotelViewSet, basename='admin-hotel')
router.register(r'itinerary', AdminItineraryItemViewSet, basename='admin-itinerary')
router.register(r'updates', AdminTripUpdateViewSet, basename='admin-update')
router.register(r'guides', AdminTripGuideSectionViewSet, basename='admin-guide')
router.register(r'checklists', AdminChecklistItemViewSet, basename='admin-checklist')
router.register(r'contacts', AdminEmergencyContactViewSet, basename='admin-contact')
router.register(r'faqs', AdminTripFAQViewSet, basename='admin-faq')

urlpatterns = [
    # Authentication
    path('auth/', include('apps.api.auth.urls')),
    
    # Common utilities
    path('common/', include('apps.common.urls')),
    
    # Dashboard endpoints (staff only)
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activity/', DashboardActivityView.as_view(), name='dashboard-activity'),
    path('dashboard/upcoming-trips/', DashboardUpcomingTripsView.as_view(), name='dashboard-upcoming-trips'),
    
    # Profile endpoints (pilgrim-facing)
    path('me/', MeView.as_view(), name='me'),
    path('me/visas/', MyVisasView.as_view(), name='my-visas'),
    path('me/bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('me/trips/', TripListView.as_view(), name='my-trips'),
    path('me/trips/<uuid:pk>/', TripDetailView.as_view(), name='my-trip-detail'),
    path('me/trips/<uuid:trip_id>/itinerary/', TripItineraryView.as_view(), name='my-trip-itinerary'),
    path('me/trips/<uuid:trip_id>/updates/', TripUpdatesView.as_view(), name='my-trip-updates'),
    path('me/trips/<uuid:trip_id>/essentials/', TripEssentialsView.as_view(), name='my-trip-essentials'),
    
    # Package endpoints (pilgrim-facing)
    path('me/packages/<uuid:pk>/', PackageDetailView.as_view(), name='my-package-detail'),
    path('me/packages/<uuid:package_id>/flights/', PackageFlightsView.as_view(), name='my-package-flights'),
    path('me/packages/<uuid:package_id>/hotels/', PackageHotelsView.as_view(), name='my-package-hotels'),
    
    # Content endpoints (pilgrim-facing)
    path('me/duas/', DuaListView.as_view(), name='my-dua-list'),
    
    # Admin User Management (staff only)
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<uuid:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<uuid:user_id>/change-password/', AdminUserChangePasswordView.as_view(), name='admin-user-change-password'),
    
    # Admin Pilgrim Import (staff only)
    path('pilgrims/import/template/', download_template, name='pilgrim-import-template'),
    path('pilgrims/import/validate/', validate_import, name='pilgrim-import-validate'),
    path('pilgrims/import/', import_pilgrims, name='pilgrim-import'),
    
    # Admin ViewSets (staff only) - registered via router
    path('', include(router.urls)),
]

