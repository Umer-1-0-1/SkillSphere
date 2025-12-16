"""Serializers for courses app."""
from rest_framework import serializers
from .models import (
    Category, Course, Lesson, Video, Assignment, Quiz, 
    Question, Submission, Progress, Payment
)
from users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'course_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_course_count(self, obj):
        """Get the number of approved courses in this category."""
        return obj.courses.filter(status='APPROVED').count()


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model."""
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'description', 'order', 'duration',
            'media_type', 'video_url', 'external_link', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Validate lesson media fields."""
        media_type = attrs.get('media_type')
        video_url = attrs.get('video_url')
        external_link = attrs.get('external_link')
        
        if media_type == 'VIDEO' and not video_url:
            raise serializers.ValidationError({
                'video_url': 'Video URL is required for video lessons'
            })
        
        if media_type == 'EXTERNAL' and not external_link:
            raise serializers.ValidationError({
                'external_link': 'External link is required for external lessons'
            })
        
        return attrs


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lessons."""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'order', 'duration',
            'media_type', 'video_url', 'external_link'
        ]


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view."""
    
    instructor_name = serializers.CharField(source='instructor.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    is_free = serializers.BooleanField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor_name', 'category_name',
            'price', 'is_free', 'thumbnail_url', 'status', 'lesson_count',
            'total_duration', 'enrollment_count', 'created_at'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for course detail view."""
    
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    is_free = serializers.BooleanField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'instructor', 'category', 'title', 'description', 'syllabus',
            'price', 'is_free', 'thumbnail_url', 'status', 'admin_comment',
            'lessons', 'lesson_count', 'total_duration', 'enrollment_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses."""
    
    lessons = LessonCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'syllabus', 'category', 'price',
            'thumbnail_url', 'status', 'lessons'
        ]
    
    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:  # Update
            current_status = self.instance.status
            
            # Only allow editing draft courses
            if current_status != 'DRAFT' and value != current_status:
                raise serializers.ValidationError(
                    "You can only edit courses in draft status"
                )
        
        return value
    
    def validate(self, attrs):
        """Validate course data."""
        status = attrs.get('status', 'DRAFT')
        
        # If submitting for approval, ensure all required fields are present
        if status == 'PENDING':
            required_fields = ['title', 'description', 'category', 'thumbnail_url']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: f'{field} is required when submitting for approval'
                    })
        
        return attrs
    
    def create(self, validated_data):
        """Create course with lessons."""
        lessons_data = validated_data.pop('lessons', [])
        course = Course.objects.create(**validated_data)
        
        # Create lessons
        for lesson_data in lessons_data:
            Lesson.objects.create(course=course, **lesson_data)
        
        return course
    
    def update(self, instance, validated_data):
        """Update course and lessons."""
        lessons_data = validated_data.pop('lessons', None)
        
        # Update course fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update lessons if provided
        if lessons_data is not None:
            # Delete existing lessons and create new ones
            instance.lessons.all().delete()
            for lesson_data in lessons_data:
                Lesson.objects.create(course=instance, **lesson_data)
        
        return instance


class CourseApprovalSerializer(serializers.ModelSerializer):
    """Serializer for admin course approval/rejection."""
    
    class Meta:
        model = Course
        fields = ['status', 'admin_comment']
    
    def validate_status(self, value):
        """Validate status value."""
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError(
                "Status must be either APPROVED or REJECTED"
            )
        return value
    
    def validate(self, attrs):
        """Validate that rejection has a comment."""
        status = attrs.get('status')
        admin_comment = attrs.get('admin_comment', '')
        
        if status == 'REJECTED' and not admin_comment:
            raise serializers.ValidationError({
                'admin_comment': 'Admin comment is required when rejecting a course'
            })
        
        return attrs


# Sprint 2 Serializers
class VideoSerializer(serializers.ModelSerializer):
    """Serializer for Video model."""
    
    class Meta:
        model = Video
        fields = [
            'id', 'lesson', 'video_url', 'video_type', 'duration',
            'thumbnail_url', 'storage_provider', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Assignment model."""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    submission_count = serializers.SerializerMethodField()
    has_submitted = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'instructions', 'deadline', 'max_score', 'submission_count',
            'has_submitted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_submission_count(self, obj):
        """Get number of submissions for this assignment."""
        return obj.submissions.count()
    
    def get_has_submitted(self, obj):
        """Check if current user has submitted this assignment."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.submissions.filter(student=request.user).exists()
        return False


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model."""
    
    class Meta:
        model = Question
        fields = [
            'id', 'quiz', 'question_text', 'option_a', 'option_b',
            'option_c', 'option_d', 'correct_answer', 'points', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionListSerializer(serializers.ModelSerializer):
    """Serializer for Question list (without correct answer for students)."""
    
    class Meta:
        model = Question
        fields = [
            'id', 'quiz', 'question_text', 'option_a', 'option_b',
            'option_c', 'option_d', 'points', 'order'
        ]
        read_only_fields = ['id']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for Quiz model."""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    question_count = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()
    has_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'duration', 'passing_score', 'max_attempts', 'question_count',
            'total_points', 'has_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        """Get number of questions in this quiz."""
        return obj.questions.count()
    
    def get_total_points(self, obj):
        """Get total points available in this quiz."""
        return sum(q.points for q in obj.questions.all())
    
    def get_has_completed(self, obj):
        """Check if the current user has completed this quiz."""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.sprint2_progress.filter(
                enrollment__student=request.user,
                completed=True
            ).exists()
        return False


class QuizDetailSerializer(QuizSerializer):
    """Serializer for Quiz detail with questions."""
    
    questions = QuestionListSerializer(many=True, read_only=True)
    
    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for Submission model."""
    
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'file_url', 'submission_date', 'grade', 'feedback', 'status',
            'graded_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'submission_date', 'created_at', 'updated_at']


class ProgressSerializer(serializers.ModelSerializer):
    """Serializer for Progress model."""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    
    class Meta:
        model = Progress
        fields = [
            'id', 'enrollment', 'lesson', 'lesson_title', 'quiz', 'quiz_title',
            'completed', 'completion_date', 'quiz_score', 'quiz_attempts',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_title',
            'amount', 'payment_method', 'transaction_id', 'status',
            'payment_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_date', 'created_at', 'updated_at']
