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

app_name = 'api'

router = DefaultRouter()

urlpatterns = [
    # Authentication
    path('auth/', include('apps.api.auth.urls')),
    
    # Profile endpoints
    path('me/', MeView.as_view(), name='me'),
    path('me/visas/', MyVisasView.as_view(), name='my-visas'),
    path('me/bookings/', MyBookingsView.as_view(), name='my-bookings'),
    
    # Trip endpoints
    path('trips/', TripListView.as_view(), name='trip-list'),
    path('trips/<uuid:pk>/', TripDetailView.as_view(), name='trip-detail'),
    path('trips/<uuid:trip_id>/itinerary/', TripItineraryView.as_view(), name='trip-itinerary'),
    path('trips/<uuid:trip_id>/updates/', TripUpdatesView.as_view(), name='trip-updates'),
    path('trips/<uuid:trip_id>/essentials/', TripEssentialsView.as_view(), name='trip-essentials'),
    
    # Package endpoints
    path('packages/<uuid:pk>/', PackageDetailView.as_view(), name='package-detail'),
    path('packages/<uuid:package_id>/flights/', PackageFlightsView.as_view(), name='package-flights'),
    path('packages/<uuid:package_id>/hotels/', PackageHotelsView.as_view(), name='package-hotels'),
    
    # Content endpoints
    path('duas/', DuaListView.as_view(), name='dua-list'),
    
    # Router URLs (for future ViewSets)
    path('', include(router.urls)),
]

