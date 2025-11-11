"""
Admin/Staff API views for managing all resources.
"""
from .trips import AdminTripViewSet
from .bookings import AdminBookingViewSet
from .pilgrims import AdminPilgrimViewSet
from .duas import AdminDuaViewSet
from .packages import (
    AdminPackageViewSet,
    AdminPackageFlightViewSet,
    AdminPackageHotelViewSet
)
from .itinerary import AdminItineraryItemViewSet
from .trip_content import (
    AdminTripUpdateViewSet,
    AdminTripGuideSectionViewSet,
    AdminChecklistItemViewSet,
    AdminEmergencyContactViewSet,
    AdminTripFAQViewSet
)
from .users import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserChangePasswordView
)

__all__ = [
    'AdminTripViewSet',
    'AdminBookingViewSet',
    'AdminPilgrimViewSet',
    'AdminDuaViewSet',
    'AdminPackageViewSet',
    'AdminPackageFlightViewSet',
    'AdminPackageHotelViewSet',
    'AdminItineraryItemViewSet',
    'AdminTripUpdateViewSet',
    'AdminTripGuideSectionViewSet',
    'AdminChecklistItemViewSet',
    'AdminEmergencyContactViewSet',
    'AdminTripFAQViewSet',
    'AdminUserListView',
    'AdminUserDetailView',
    'AdminUserChangePasswordView',
]

