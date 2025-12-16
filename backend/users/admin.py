from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Session


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model."""
    
    list_display = ['email', 'full_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Password Reset', {'fields': ('reset_token', 'reset_token_expiry')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    """Admin configuration for Session model."""
    
    list_display = ['session_key', 'user', 'expire_date', 'last_activity', 'ip_address']
    list_filter = ['expire_date', 'created_at']
    search_fields = ['user__email', 'session_key', 'ip_address']
    ordering = ['-last_activity']
    readonly_fields = ['session_key', 'created_at', 'last_activity']
