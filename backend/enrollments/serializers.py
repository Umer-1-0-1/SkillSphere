"""Serializers for enrollments app."""
from rest_framework import serializers
from .models import Enrollment, LessonProgress
from courses.serializers import CourseListSerializer, LessonSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model."""
    
    course = CourseListSerializer(read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    progress_percentage = serializers.CharField(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'enrolled_at',
            'progress', 'progress_percentage', 'completed', 'last_accessed_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'last_accessed_at']


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating enrollments."""
    
    class Meta:
        model = Enrollment
        fields = ['course']
    
    def validate_course(self, value):
        """Validate that course is approved."""
        if value.status != 'APPROVED':
            raise serializers.ValidationError('Cannot enroll in a course that is not approved')
        return value
    
    def validate(self, attrs):
        """Validate that student is not already enrolled."""
        student = self.context['request'].user
        course = attrs['course']
        
        if Enrollment.objects.filter(student=student, course=course).exists():
            raise serializers.ValidationError('You are already enrolled in this course')
        
        return attrs


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer for LessonProgress model."""
    
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'enrollment', 'lesson', 'completed', 'completed_at',
            'time_spent', 'last_position', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class LessonProgressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating lesson progress."""
    
    class Meta:
        model = LessonProgress
        fields = ['completed', 'time_spent', 'last_position']
