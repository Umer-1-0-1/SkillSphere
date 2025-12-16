"""Models for enrollments app."""
from django.db import models
from users.models import User
from courses.models import Course
import uuid


class Enrollment(models.Model):
    """Enrollment model for student-course relationships."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'STUDENT'}
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text='Progress percentage (0-100)'
    )
    completed = models.BooleanField(default=False)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'enrollments'
        ordering = ['-enrolled_at']
        unique_together = ['student', 'course']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
            models.Index(fields=['student', 'course']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} enrolled in {self.course.title}"
    
    @property
    def progress_percentage(self):
        """Get progress as a formatted percentage string."""
        return f"{self.progress}%"


class LessonProgress(models.Model):
    """Track individual lesson progress within an enrollment."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson = models.ForeignKey(
        'courses.Lesson',
        on_delete=models.CASCADE,
        related_name='progress_records'
    )
    
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent = models.PositiveIntegerField(
        default=0,
        help_text='Time spent in seconds'
    )
    last_position = models.PositiveIntegerField(
        default=0,
        help_text='Last video position in seconds'
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lesson_progress'
        ordering = ['lesson__order']
        unique_together = ['enrollment', 'lesson']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['lesson']),
        ]
    
    def __str__(self):
        status = "Completed" if self.completed else "In Progress"
        return f"{self.enrollment.student.full_name} - {self.lesson.title} ({status})"
