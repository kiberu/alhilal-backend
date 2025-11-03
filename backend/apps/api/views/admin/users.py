"""
User management views (Admin).
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import Account
from apps.api.serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserCreateSerializer,
)
from apps.common.permissions import IsStaff


class AdminUserListView(APIView):
    """
    GET /admin/users - List all users
    POST /admin/users - Create a new user
    """
    permission_classes = [IsAuthenticated, IsStaff]

    def get(self, request):
        """List all users with optional filtering."""
        # Get query parameters
        role = request.query_params.get('role')
        is_active = request.query_params.get('isActive')
        search = request.query_params.get('search')
        
        # Base queryset
        queryset = Account.objects.all().select_related('staff_profile')
        
        # Apply filters
        if role:
            queryset = queryset.filter(role=role)
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                phone__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )
        
        # Order by creation date (newest first)
        queryset = queryset.order_by('-created_at')
        
        # Paginate
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        users = queryset[start:end]
        
        serializer = AdminUserListSerializer(users, many=True)
        
        return Response({
            'success': True,
            'items': serializer.data,
            'meta': {
                'page': page,
                'size': page_size,
                'total': total_count,
                'totalPages': (total_count + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        """Create a new user."""
        serializer = AdminUserCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    """
    GET /admin/users/:id - Get user details
    PATCH /admin/users/:id - Update user
    DELETE /admin/users/:id - Delete user
    """
    permission_classes = [IsAuthenticated, IsStaff]

    def get_object(self, user_id):
        """Get user by ID."""
        try:
            return Account.objects.select_related('staff_profile').get(id=user_id)
        except Account.DoesNotExist:
            return None

    def get(self, request, user_id):
        """Get user details."""
        user = self.get_object(user_id)
        
        if not user:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminUserDetailSerializer(user)
        
        return Response({
            'success': True,
            'data': serializer.data
        })

    def patch(self, request, user_id):
        """Update user."""
        user = self.get_object(user_id)
        
        if not user:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent non-superusers from modifying superusers
        if user.is_superuser and not request.user.is_superuser:
            return Response({
                'success': False,
                'error': 'You do not have permission to modify this user'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AdminUserDetailSerializer(user, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'User updated successfully'
        })

    def delete(self, request, user_id):
        """Delete user."""
        user = self.get_object(user_id)
        
        if not user:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response({
                'success': False,
                'error': 'You cannot delete your own account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent non-superusers from deleting superusers
        if user.is_superuser and not request.user.is_superuser:
            return Response({
                'success': False,
                'error': 'You do not have permission to delete this user'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        }, status=status.HTTP_200_OK)


class AdminUserChangePasswordView(APIView):
    """
    POST /admin/users/:id/change-password - Change user password (admin)
    """
    permission_classes = [IsAuthenticated, IsStaff]

    def post(self, request, user_id):
        """Change user password."""
        try:
            user = Account.objects.get(id=user_id)
        except Account.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Only superusers can change other users' passwords
        if not request.user.is_superuser:
            return Response({
                'success': False,
                'error': 'Only superusers can change other users\' passwords'
            }, status=status.HTTP_403_FORBIDDEN)
        
        new_password = request.data.get('newPassword')
        
        if not new_password or len(new_password) < 6:
            return Response({
                'success': False,
                'error': 'Password must be at least 6 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        })

