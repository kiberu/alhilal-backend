"""
Custom permission classes for the API.
"""
from rest_framework import permissions

STAFF_READ_ROLES = ('ADMIN', 'AGENT', 'AUDITOR')
STAFF_WRITE_ROLES = ('ADMIN', 'AGENT')
ADMIN_ONLY_ROLES = ('ADMIN',)


def get_staff_role(user):
    """Return the staff role for an authenticated staff user."""
    return getattr(getattr(user, 'staff_profile', None), 'role', None)


def user_has_staff_role(user, allowed_roles):
    """Check whether a user has one of the allowed staff roles."""
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    if user.role != 'STAFF' or not user.is_staff:
        return False

    staff_role = get_staff_role(user)
    return bool(staff_role and staff_role in allowed_roles)


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


class HasPilgrimProfile(permissions.BasePermission):
    """
    Permission class for pilgrim-facing endpoints.

    Grants access to any authenticated user who has an attached pilgrim profile,
    including staff accounts that are also represented as pilgrims.
    """

    message = "This endpoint requires a pilgrim profile."

    def has_permission(self, request, view):
        """Check whether the authenticated user has a pilgrim profile."""
        if not request.user or not request.user.is_authenticated:
            return False

        return hasattr(request.user, 'pilgrim_profile')


class IsStaff(permissions.BasePermission):
    """
    Permission class that allows access only to staff members.
    Pilgrims are denied access to staff-only endpoints.
    """
    
    message = "This endpoint is only accessible to staff members."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is staff."""
        return user_has_staff_role(request.user, STAFF_READ_ROLES)


class IsAdmin(permissions.BasePermission):
    """
    Permission class that allows access only to admin staff.
    """
    
    message = "This endpoint is only accessible to administrators."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and is admin."""
        return user_has_staff_role(request.user, ADMIN_ONLY_ROLES)


class StaffActionRolePermission(permissions.BasePermission):
    """Permission class that enforces explicit staff-role maps on views."""

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        """Check whether the authenticated staff role is allowed on this action."""
        allowed_roles = None

        if hasattr(view, 'get_allowed_staff_roles'):
            allowed_roles = view.get_allowed_staff_roles(request)
        elif hasattr(view, 'allowed_staff_roles'):
            allowed_roles = getattr(view, 'allowed_staff_roles')

        if allowed_roles is None:
            allowed_roles = STAFF_READ_ROLES

        return user_has_staff_role(request.user, allowed_roles)


class StaffRoleAccessMixin:
    """Mixin that provides explicit role maps for APIViews and ViewSets."""

    read_staff_roles = STAFF_READ_ROLES
    write_staff_roles = STAFF_WRITE_ROLES
    action_staff_roles = {}
    method_staff_roles = {}

    def get_allowed_staff_roles(self, request):
        """Resolve allowed staff roles for the current request."""
        action = getattr(self, 'action', None)
        if action and action in self.action_staff_roles:
            return self.action_staff_roles[action]

        if request.method in self.method_staff_roles:
            return self.method_staff_roles[request.method]

        if request.method in permissions.SAFE_METHODS:
            return self.read_staff_roles

        return self.write_staff_roles


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
