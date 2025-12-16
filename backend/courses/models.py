"""Models for courses app."""
from django.db import models
from django.core.validators import MinValueValidator, FileExtensionValidator
from users.models import User
import uuid


class Category(models.Model):
    """Category model for course classification."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Course(models.Model):
    """Course model."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='courses_teaching',
        limit_choices_to={'role': 'INSTRUCTOR'}
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    syllabus = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0
    )
    thumbnail_url = models.ImageField(
        upload_to='course_thumbnails/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])]
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        db_index=True
    )
    admin_comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.instructor.full_name}"
    
    @property
    def is_free(self):
        """Check if course is free."""
        return self.price == 0
    
    @property
    def lesson_count(self):
        """Get total number of lessons."""
        return self.lessons.count()
    
    @property
    def total_duration(self):
        """Get total duration of all lessons in minutes."""
        return self.lessons.aggregate(
            total=models.Sum('duration')
        )['total'] or 0
    
    @property
    def enrollment_count(self):
        """Get total number of enrollments."""
        return self.enrollments.count()


class Lesson(models.Model):
    """Lesson model for course content."""
    
    MEDIA_TYPE_CHOICES = [
        ('VIDEO', 'Video'),
        ('EXTERNAL', 'External Link'),
        ('DOCUMENT', 'Document'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(
        default=0,
        help_text='Duration in minutes'
    )
    
    # Media fields
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default='VIDEO'
    )
    video_url = models.FileField(
        upload_to='lesson_videos/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['mp4', 'mov', 'avi', 'mkv'])]
    )
    external_link = models.URLField(blank=True, max_length=500)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lessons'
        ordering = ['course', 'order']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - Lesson {self.order}: {self.title}"


class Video(models.Model):
    """Video model for storing video content information."""
    
    VIDEO_TYPE_CHOICES = [
        ('UPLOAD', 'Upload'),
        ('YOUTUBE', 'YouTube'),
        ('GOOGLE_DRIVE', 'Google Drive'),
        ('ONE_DRIVE', 'OneDrive'),
        ('VIMEO', 'Vimeo'),
    ]
    
    STORAGE_PROVIDER_CHOICES = [
        ('LOCAL', 'Local'),
        ('YOUTUBE', 'YouTube'),
        ('GOOGLE_DRIVE', 'Google Drive'),
        ('ONE_DRIVE', 'OneDrive'),
        ('VIMEO', 'Vimeo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='videos'
    )
    
    video_url = models.URLField(max_length=1000)
    video_type = models.CharField(
        max_length=20,
        choices=VIDEO_TYPE_CHOICES,
        default='UPLOAD'
    )
    duration = models.PositiveIntegerField(
        default=0,
        help_text='Duration in seconds'
    )
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    storage_provider = models.CharField(
        max_length=20,
        choices=STORAGE_PROVIDER_CHOICES,
        default='LOCAL'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'videos'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lesson']),
        ]
    
    def __str__(self):
        return f"Video for {self.lesson.title}"


class Assignment(models.Model):
    """Assignment model for course assignments."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField()
    deadline = models.DateTimeField()
    max_score = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=100
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['deadline']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Quiz(models.Model):
    """Quiz model for storing quiz information."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(
        default=30,
        help_text='Duration in minutes'
    )
    passing_score = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=70,
        help_text='Passing score as percentage'
    )
    max_attempts = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=3
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'quizzes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['course']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(models.Model):
    """Question model for quiz questions."""
    
    CORRECT_ANSWER_CHOICES = [
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(
        max_length=1,
        choices=CORRECT_ANSWER_CHOICES
    )
    points = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=1
    )
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['quiz', 'order']
        indexes = [
            models.Index(fields=['quiz', 'order']),
        ]
        unique_together = ['quiz', 'order']
    
    def __str__(self):
        return f"{self.quiz.title} - Question {self.order}"


class Submission(models.Model):
    """Submission model for student assignment submissions."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('GRADED', 'Graded'),
        ('LATE', 'Late'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submissions',
        limit_choices_to={'role': 'STUDENT'}
    )
    
    file_url = models.FileField(
        upload_to='submissions/',
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'txt', 'zip'])]
    )
    submission_date = models.DateTimeField(auto_now_add=True)
    grade = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    feedback = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    graded_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'submissions'
        ordering = ['-submission_date']
        indexes = [
            models.Index(fields=['assignment']),
            models.Index(fields=['student']),
            models.Index(fields=['status']),
        ]
        unique_together = ['assignment', 'student']
    
    def __str__(self):
        return f"{self.student.full_name} - {self.assignment.title}"


class Progress(models.Model):
    """Progress model for tracking student learning progress."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        'enrollments.Enrollment',
        on_delete=models.CASCADE,
        related_name='progress_records'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='sprint2_progress',
        null=True,
        blank=True
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='sprint2_progress',
        null=True,
        blank=True
    )
    
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    quiz_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Quiz score as percentage'
    )
    quiz_attempts = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'progress'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['enrollment']),
            models.Index(fields=['lesson']),
            models.Index(fields=['quiz']),
        ]
    
    def __str__(self):
        return f"{self.enrollment.student.full_name} - Progress"


class Payment(models.Model):
    """Payment model for mock payment records."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('MOCK_WALLET', 'Mock Wallet'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        limit_choices_to={'role': 'STUDENT'}
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )
    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    payment_date = models.DateTimeField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} - ${self.amount}"
