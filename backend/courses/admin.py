"""Admin configuration for courses app."""
from django.contrib import admin
from .models import Category, Course, Lesson, Video, Assignment, Quiz, Question, Submission, Progress, Payment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model."""
    
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


class LessonInline(admin.TabularInline):
    """Inline admin for lessons."""
    model = Lesson
    extra = 1
    fields = ['title', 'order', 'duration', 'media_type']
    ordering = ['order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin configuration for Course model."""
    
    list_display = ['title', 'instructor', 'category', 'price', 'status', 'lesson_count', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['title', 'description', 'instructor__email']
    ordering = ['-created_at']
    inlines = [LessonInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('instructor', 'title', 'description', 'category', 'price', 'thumbnail_url')
        }),
        ('Content', {
            'fields': ('syllabus',)
        }),
        ('Status & Review', {
            'fields': ('status', 'admin_comment')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin configuration for Lesson model."""
    
    list_display = ['title', 'course', 'order', 'duration', 'media_type', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['course', 'order']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('course', 'title', 'description', 'order', 'duration')
        }),
        ('Media Content', {
            'fields': ('media_type', 'video_url', 'external_link')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


# Sprint 2 Admin Models

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """Admin configuration for Video model."""
    
    list_display = ['lesson', 'video_type', 'storage_provider', 'created_at']
    list_filter = ['video_type', 'storage_provider', 'created_at']
    search_fields = ['lesson__title', 'lesson__course__title']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Lesson', {
            'fields': ('lesson',)
        }),
        ('Video Details', {
            'fields': ('video_url', 'video_type', 'storage_provider')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


class QuestionInline(admin.TabularInline):
    """Inline admin for quiz questions."""
    model = Question
    extra = 1
    fields = ['question_text', 'correct_answer', 'points', 'order']
    ordering = ['order']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """Admin configuration for Assignment model."""
    
    list_display = ['title', 'course', 'deadline', 'max_score', 'created_at']
    list_filter = ['deadline', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['-deadline']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('course', 'title', 'description')
        }),
        ('Assignment Details', {
            'fields': ('instructions', 'deadline', 'max_score', 'file_url')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin configuration for Quiz model."""
    
    list_display = ['title', 'course', 'duration', 'passing_score', 'max_attempts', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['-created_at']
    inlines = [QuestionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('course', 'title', 'description')
        }),
        ('Quiz Settings', {
            'fields': ('duration', 'passing_score', 'max_attempts')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin configuration for Question model."""
    
    list_display = ['question_text', 'quiz', 'correct_answer', 'points', 'order']
    list_filter = ['quiz', 'correct_answer']
    search_fields = ['question_text', 'quiz__title']
    ordering = ['quiz', 'order']
    
    fieldsets = (
        ('Quiz', {
            'fields': ('quiz', 'order')
        }),
        ('Question', {
            'fields': ('question_text', 'points')
        }),
        ('Options', {
            'fields': ('option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """Admin configuration for Submission model."""
    
    list_display = ['assignment', 'student', 'status', 'grade', 'submission_date', 'graded_at']
    list_filter = ['status', 'submission_date', 'graded_at']
    search_fields = ['assignment__title', 'student__email', 'student__first_name', 'student__last_name']
    ordering = ['-submission_date']
    
    fieldsets = (
        ('Submission Details', {
            'fields': ('assignment', 'student', 'file_url', 'status')
        }),
        ('Grading', {
            'fields': ('grade', 'feedback', 'graded_at')
        }),
        ('Metadata', {
            'fields': ('submission_date', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['submission_date', 'updated_at', 'graded_at']


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    """Admin configuration for Progress model."""
    
    list_display = ['enrollment', 'lesson', 'quiz', 'completed', 'quiz_score', 'completion_date']
    list_filter = ['completed', 'completion_date']
    search_fields = ['enrollment__student__email', 'lesson__title', 'quiz__title']
    ordering = ['-completion_date']
    
    fieldsets = (
        ('Progress Details', {
            'fields': ('enrollment', 'lesson', 'quiz', 'completed', 'completion_date')
        }),
        ('Quiz Details', {
            'fields': ('quiz_score', 'quiz_attempts')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""
    
    list_display = ['transaction_id', 'student', 'course', 'amount', 'payment_method', 'status', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['transaction_id', 'student__email', 'course__title']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Payment Details', {
            'fields': ('student', 'course', 'amount', 'payment_method')
        }),
        ('Transaction', {
            'fields': ('transaction_id', 'status')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
