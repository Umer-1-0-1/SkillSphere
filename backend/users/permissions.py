"""Permissions for role-based access control."""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Permission check for student role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student()


class IsInstructor(permissions.BasePermission):
    """Permission check for instructor role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_instructor()


class IsAdmin(permissions.BasePermission):
    """Permission check for admin role."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsInstructorOrAdmin(permissions.BasePermission):
    """Permission check for instructor or admin role."""
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                (request.user.is_instructor() or request.user.is_admin()))


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission check for object owner or admin."""
    
    def has_object_permission(self, request, view, obj):
        # Admins can access everything
        if request.user.is_admin():
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        if hasattr(obj, 'student'):
            return obj.student == request.user
        
        return False
