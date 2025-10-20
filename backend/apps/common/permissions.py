"""
Custom permission classes for the API.
"""
from rest_framework import permissions


class IsPilgrim(permissions.BasePermission):
    """
    Permission class that allows access only to pilgrims.
    Staff users are denied access to pilgrim API endpoints.
    """
    
    message = "This endpoint is only accessible to pilgrims."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is a pilgrim."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role == 'PILGRIM'


class IsStaff(permissions.BasePermission):
    """
    Permission class that allows access only to staff members.
    Pilgrims are denied access to staff-only endpoints.
    """
    
    message = "This endpoint is only accessible to staff members."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is staff."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role == 'STAFF' and request.user.is_staff


class IsAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to admin staff.
    """
    
    message = "This endpoint is only accessible to administrators."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is admin."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role != 'STAFF' or not request.user.is_staff:
            return False
        
        try:
            return request.user.staff_profile.role == 'ADMIN'
        except AttributeError:
            return False


class IsOwnData(permissions.BasePermission):
    """
    Object-level permission to only allow pilgrims to access their own data.
    
    Usage:
        permission_classes = [IsAuthenticated, IsPilgrim, IsOwnData]
        
    The object must have a 'pilgrim' or 'user' attribute linking to the owner.
    """
    
    message = "You can only access your own data."
    
    def has_object_permission(self, request, view, obj):
        """Check if the object belongs to the requesting user."""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For models with direct user reference
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # For models with pilgrim reference
        if hasattr(obj, 'pilgrim'):
            try:
                return obj.pilgrim.user == request.user
            except AttributeError:
                return False
        
        # For pilgrim profile itself
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.id
        
        return False


class ReadOnly(permissions.BasePermission):
    """
    Permission class that allows read-only access.
    Only GET, HEAD, and OPTIONS methods are allowed.
    """
    
    message = "This endpoint is read-only."
    
    def has_permission(self, request, view):
        """Allow only safe methods."""
        return request.method in permissions.SAFE_METHODS

