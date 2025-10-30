"""
Admin/Staff API views for managing all resources.
"""
from .trips import AdminTripViewSet
from .bookings import AdminBookingViewSet
from .pilgrims import AdminPilgrimViewSet
from .duas import AdminDuaViewSet
from .passports import AdminPassportViewSet
from .visas import AdminVisaViewSet

__all__ = [
    'AdminTripViewSet',
    'AdminBookingViewSet',
    'AdminPilgrimViewSet',
    'AdminDuaViewSet',
    'AdminPassportViewSet',
    'AdminVisaViewSet',
]

