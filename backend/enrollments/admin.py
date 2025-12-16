"""Admin configuration for enrollments app."""
from django.contrib import admin
from .models import Enrollment, LessonProgress


class LessonProgressInline(admin.TabularInline):
    """Inline admin for lesson progress."""
    model = LessonProgress
    extra = 0
    fields = ['lesson', 'completed', 'time_spent', 'last_position']
    readonly_fields = ['time_spent', 'last_position']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin configuration for Enrollment model."""
    
    list_display = ['student', 'course', 'progress', 'completed', 'enrolled_at']
    list_filter = ['completed', 'enrolled_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'course__title']
    ordering = ['-enrolled_at']
    inlines = [LessonProgressInline]
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('student', 'course', 'enrolled_at')
        }),
        ('Progress', {
            'fields': ('progress', 'completed', 'last_accessed_at')
        }),
    )
    
    readonly_fields = ['enrolled_at', 'last_accessed_at']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    """Admin configuration for LessonProgress model."""
    
    list_display = ['enrollment', 'lesson', 'completed', 'time_spent', 'updated_at']
    list_filter = ['completed', 'updated_at']
    search_fields = ['enrollment__student__email', 'lesson__title']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('Progress Information', {
            'fields': ('enrollment', 'lesson', 'completed', 'completed_at')
        }),
        ('Tracking', {
            'fields': ('time_spent', 'last_position', 'updated_at')
        }),
    )
    
    readonly_fields = ['updated_at']
