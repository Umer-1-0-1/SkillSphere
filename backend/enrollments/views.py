"""Views for enrollments app."""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes as perm_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Count, Q

from .models import Enrollment, LessonProgress
from .serializers import (
    EnrollmentSerializer, EnrollmentCreateSerializer,
    LessonProgressSerializer, LessonProgressUpdateSerializer
)
from users.permissions import IsStudent
from users.authentication import JWTAuthentication as CustomJWTAuthentication
from courses.models import Course


class MockPaymentView(APIView):
    """Mock payment endpoint for course enrollment."""
    
    permission_classes = [IsStudent]
    authentication_classes = [CustomJWTAuthentication]
    
    def post(self, request):
        course_id = request.data.get('course')
        amount = request.data.get('amount')
        transaction_id = request.data.get('transaction_id')
        
        if not course_id:
            return Response({'error': 'Course ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment (mock payment always succeeds)
        enrollment = Enrollment.objects.create(
            student=request.user,
            course=course
        )
        
        return Response({
            'message': 'Payment successful',
            'enrollment': EnrollmentSerializer(enrollment).data,
            'transaction_id': transaction_id
        }, status=status.HTTP_201_CREATED)


class EnrollCourseView(APIView):
    """Enroll in a course (students only)."""
    
    permission_classes = [IsStudent]
    
    def post(self, request):
        serializer = EnrollmentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        course = serializer.validated_data['course']
        
        # Check if course is free
        if course.price > 0:
            return Response({
                'error': 'This course requires payment. Please use the payment endpoint.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=request.user,
            course=course
        )
        
        return Response({
            'message': 'Enrolled successfully',
            'enrollment': EnrollmentSerializer(enrollment).data
        }, status=status.HTTP_201_CREATED)


class MyEnrollmentsView(generics.ListAPIView):
    """List all enrollments for the current student."""
    
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]
    
    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related('course', 'course__instructor', 'course__category')


class EnrollmentDetailView(generics.RetrieveAPIView):
    """Get details of a specific enrollment."""
    
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user)


class CheckEnrollmentView(APIView):
    """Check if user is enrolled in a course."""
    
    permission_classes = [IsStudent]
    
    def get(self, request, course_id):
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course_id=course_id
        ).exists()
        
        enrollment = None
        if is_enrolled:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course_id=course_id
            )
        
        return Response({
            'is_enrolled': is_enrolled,
            'enrollment': EnrollmentSerializer(enrollment).data if enrollment else None
        })


class LessonProgressListView(generics.ListAPIView):
    """List lesson progress for an enrollment."""
    
    serializer_class = LessonProgressSerializer
    permission_classes = [IsStudent]
    
    def get_queryset(self):
        enrollment_id = self.kwargs['enrollment_id']
        return LessonProgress.objects.filter(
            enrollment_id=enrollment_id,
            enrollment__student=self.request.user
        )


class LessonProgressUpdateView(APIView):
    """Update lesson progress."""
    
    permission_classes = [IsStudent]
    
    def post(self, request, enrollment_id, lesson_id):
        try:
            enrollment = Enrollment.objects.get(
                id=enrollment_id,
                student=request.user
            )
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'Enrollment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create lesson progress
        lesson_progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson_id=lesson_id
        )
        
        serializer = LessonProgressUpdateSerializer(
            lesson_progress,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        # Mark as completed if indicated
        if request.data.get('completed') and not lesson_progress.completed:
            lesson_progress.completed = True
            lesson_progress.completed_at = timezone.now()
            lesson_progress.save()
        
        # Update overall enrollment progress
        total_lessons = enrollment.course.lessons.count()
        if total_lessons > 0:
            completed_lessons = enrollment.lesson_progress.filter(completed=True).count()
            progress = (completed_lessons / total_lessons) * 100
            enrollment.progress = progress
            enrollment.completed = progress == 100
            enrollment.save()
        
        return Response({
            'message': 'Progress updated successfully',
            'lesson_progress': LessonProgressSerializer(lesson_progress).data,
            'enrollment_progress': enrollment.progress
        })


@api_view(['GET'])
@perm_classes([IsStudent])
def student_dashboard_stats(request):
    """Get statistics for student dashboard."""
    
    enrollments = Enrollment.objects.filter(student=request.user)
    
    total_enrolled = enrollments.count()
    completed_courses = enrollments.filter(completed=True).count()
    in_progress = total_enrolled - completed_courses
    
    # Calculate total time spent
    total_time_spent = LessonProgress.objects.filter(
        enrollment__student=request.user
    ).aggregate(total=Sum('time_spent'))['total'] or 0
    
    # Convert seconds to hours
    total_hours = total_time_spent / 3600
    
    return Response({
        'total_enrolled': total_enrolled,
        'completed_courses': completed_courses,
        'in_progress': in_progress,
        'total_hours_spent': round(total_hours, 1)
    })
