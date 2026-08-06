from rest_framework.permissions import BasePermission


class IsAdminOrReadOnly(BasePermission):
    """
    Allow full access to admin users.
    Read-only access for non-admin users.
    """

    def has_permission(self, request, view):
        # SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        # Write operations require admin
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'is_admin', False) or user.is_staff or user.is_superuser


class IsAdminUser(BasePermission):
    """
    Only admin users can access the view.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'is_admin', False) or user.is_staff or user.is_superuser
