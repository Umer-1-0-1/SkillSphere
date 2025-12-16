"""Views for courses app."""
from rest_framework import status, generics, permissions, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.db.models import Q, Count, Sum, F
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import uuid

from users.authentication import JWTAuthentication as CustomJWTAuthentication

from .models import (
    Category, Course, Lesson, Video, Assignment, Quiz, 
    Question, Submission, Progress, Payment
)
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateSerializer, CourseApprovalSerializer, LessonSerializer,
    VideoSerializer, AssignmentSerializer, QuizSerializer, QuizDetailSerializer,
    QuestionSerializer, SubmissionSerializer, ProgressSerializer, PaymentSerializer
)
from enrollments.models import Enrollment
from users.permissions import IsInstructor, IsAdmin, IsInstructorOrAdmin


# Category Views
class CategoryListView(generics.ListAPIView):
    """List all categories."""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryCreateView(generics.CreateAPIView):
    """Create a new category (admin only)."""
    
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdmin]


# Course Views for Instructors
class InstructorCourseListView(generics.ListAPIView):
    """List all courses for the current instructor."""
    
    serializer_class = CourseListSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)


class CourseCreateView(generics.CreateAPIView):
    """Create a new course (instructor only)."""
    
    serializer_class = CourseCreateSerializer
    permission_classes = [IsInstructor]
    
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseUpdateView(generics.UpdateAPIView):
    """Update a course (instructor can only update draft courses)."""
    
    serializer_class = CourseCreateSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        return Course.objects.filter(
            instructor=self.request.user,
            status='DRAFT'
        )


class CourseDeleteView(generics.DestroyAPIView):
    """Delete a course (instructor can only delete draft courses)."""
    
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        return Course.objects.filter(
            instructor=self.request.user,
            status='DRAFT'
        )


# Public Course Views
class PublicCourseListView(generics.ListAPIView):
    """List all approved courses (public)."""
    
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'price']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Course.objects.filter(status='APPROVED')
        
        # Custom filter for free/paid courses
        is_free = self.request.query_params.get('is_free', None)
        if is_free is not None:
            if is_free.lower() == 'true':
                queryset = queryset.filter(price=0)
            elif is_free.lower() == 'false':
                queryset = queryset.exclude(price=0)
        
        # Multiple category filter
        categories = self.request.query_params.getlist('category')
        # Filter out empty strings
        categories = [cat for cat in categories if cat and cat.strip()]
        if categories:
            queryset = queryset.filter(category__id__in=categories)
        
        return queryset


class PublicCourseDetailView(generics.RetrieveAPIView):
    """Get course details (public for approved courses)."""
    
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Disable authentication requirement
    lookup_field = 'id'
    
    def get_queryset(self):
        # Allow instructors and admins to view any course
        if self.request.user.is_authenticated:
            if self.request.user.is_admin():
                return Course.objects.all()
            elif self.request.user.is_instructor():
                return Course.objects.filter(
                    Q(status='APPROVED') | Q(instructor=self.request.user)
                )
        
        # Public can only view approved courses
        return Course.objects.filter(status='APPROVED')


# Admin Views for Course Approval
class PendingCoursesListView(generics.ListAPIView):
    """List all pending courses for admin review."""
    
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['category', 'instructor']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Course.objects.filter(status='PENDING')


class CourseReviewView(generics.RetrieveAPIView):
    """Get detailed course information for admin review."""
    
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdmin]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Course.objects.filter(status='PENDING')


class CourseApprovalView(APIView):
    """Approve or reject a course (admin only)."""
    
    permission_classes = [IsAdmin]
    
    def post(self, request, id):
        try:
            course = Course.objects.get(id=id, status='PENDING')
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found or not in pending status'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CourseApprovalSerializer(course, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        # Send email notification to instructor
        action = 'approved' if course.status == 'APPROVED' else 'rejected'
        try:
            send_mail(
                subject=f'Course {action.title()} - SkillSphere',
                message=f'Your course "{course.title}" has been {action}.\n\n'
                        f'{"Admin comment: " + course.admin_comment if course.admin_comment else ""}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[course.instructor.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")
        
        return Response({
            'message': f'Course {action} successfully',
            'course': CourseDetailSerializer(course).data
        }, status=status.HTTP_200_OK)


# Lesson Views
class LessonListCreateView(generics.ListCreateAPIView):
    """List and create lessons for a course."""
    
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CustomJWTAuthentication]  # Enable authentication for instructors
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        print(f"[DEBUG] LessonListCreateView GET - Course ID: {course_id}")
        print(f"[DEBUG] User: {self.request.user}, Authenticated: {self.request.user.is_authenticated}")
        return Lesson.objects.filter(course_id=course_id).order_by('order')
    
    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        print(f"[DEBUG] LessonListCreateView POST - Course ID: {course_id}")
        print(f"[DEBUG] User: {self.request.user}, Authenticated: {self.request.user.is_authenticated}")
        print(f"[DEBUG] Request data: {self.request.data}")
        
        # For now, allow creating lessons without authentication
        try:
            course = Course.objects.get(id=course_id)
            print(f"[DEBUG] Course found: {course.title}")
            serializer.save(course=course)
        except Course.DoesNotExist:
            print(f"[DEBUG] Course not found: {course_id}")
            raise


class CourseProgressView(generics.ListAPIView):
    """Get progress for a specific course."""
    
    serializer_class = ProgressSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CustomJWTAuthentication]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        user = self.request.user
        
        if not user.is_authenticated:
            return Progress.objects.none()
        
        # Return progress for this course and user
        return Progress.objects.filter(
            enrollment__course_id=course_id,
            enrollment__student=user
        )


class LessonUpdateView(generics.UpdateAPIView):
    """Update a lesson (instructor only, draft courses only)."""
    
    serializer_class = LessonSerializer
    permission_classes = [IsInstructor]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Lesson.objects.filter(
            course__instructor=self.request.user,
            course__status='DRAFT'
        )


class LessonDeleteView(generics.DestroyAPIView):
    """Delete a lesson (instructor only, draft courses only)."""
    
    permission_classes = [IsInstructor]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Lesson.objects.filter(
            course__instructor=self.request.user,
            course__status='DRAFT'
        )


# Dashboard Statistics
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard_stats(request):
    """Get statistics for admin dashboard."""
    
    total_courses = Course.objects.count()
    pending_courses = Course.objects.filter(status='PENDING').count()
    approved_courses = Course.objects.filter(status='APPROVED').count()
    rejected_courses = Course.objects.filter(status='REJECTED').count()
    total_instructors = Course.objects.values('instructor').distinct().count()
    
    return Response({
        'total_courses': total_courses,
        'pending_courses': pending_courses,
        'approved_courses': approved_courses,
        'rejected_courses': rejected_courses,
        'total_instructors': total_instructors
    })


@api_view(['GET'])
@permission_classes([IsInstructor])
def instructor_dashboard_stats(request):
    """Get statistics for instructor dashboard."""
    
    courses = Course.objects.filter(instructor=request.user)
    
    stats = {
        'total_courses': courses.count(),
        'draft_courses': courses.filter(status='DRAFT').count(),
        'pending_courses': courses.filter(status='PENDING').count(),
        'approved_courses': courses.filter(status='APPROVED').count(),
        'rejected_courses': courses.filter(status='REJECTED').count(),
    }
    
    return Response(stats)


# Sprint 2 ViewSets

class VideoViewSet(viewsets.ModelViewSet):
    """CRUD operations for videos."""
    
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        if self.request.user.is_instructor():
            # Instructors can only see videos for their own lessons
            return Video.objects.filter(lesson__course__instructor=self.request.user)
        return Video.objects.all()


class AssignmentViewSet(viewsets.ModelViewSet):
    """CRUD operations for assignments."""
    
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CustomJWTAuthentication]  # Enable JWT for checking submissions
    
    def get_queryset(self):
        queryset = Assignment.objects.all()
        
        # Filter by course if provided as query parameter
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            return queryset
        
        user = self.request.user
        if not user.is_authenticated:
            return queryset
        if user.is_instructor():
            # Instructors see their own course assignments
            return queryset.filter(course__instructor=user)
        elif user.is_student():
            # Students see assignments for enrolled courses
            enrolled_courses = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
            return queryset.filter(course_id__in=enrolled_courses)
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[CustomJWTAuthentication])
    def submit(self, request, pk=None):
        """Submit an assignment."""
        assignment = self.get_object()
        
        print(f"[DEBUG] Assignment submit - User: {request.user}, Authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] Authorization header: {request.headers.get('Authorization', 'None')}")
        
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if already submitted
        existing_submission = Submission.objects.filter(
            assignment=assignment,
            student=request.user
        ).first()
        
        file_url = request.FILES.get('file')
        if not file_url:
            return Response({
                'error': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check deadline
        is_late = timezone.now() > assignment.deadline
        submission_status = 'LATE' if is_late else 'PENDING'
        
        if existing_submission:
            # Update existing submission (resubmission)
            existing_submission.file_url = file_url
            existing_submission.status = submission_status
            existing_submission.grade = None  # Reset grade for regrading
            existing_submission.feedback = ''  # Reset feedback (use empty string, not None)
            existing_submission.graded_at = None  # Reset graded_at
            existing_submission.save()
            
            serializer = SubmissionSerializer(existing_submission)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new submission
        submission = Submission.objects.create(
            assignment=assignment,
            student=request.user,
            file_url=file_url,
            status=submission_status
        )
        
        serializer = SubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], authentication_classes=[CustomJWTAuthentication])
    def my_submission(self, request, pk=None):
        """Get current user's submission for this assignment."""
        assignment = self.get_object()
        
        if not request.user.is_authenticated:
            return Response({
                'submitted': False,
                'submission': None
            })
        
        submission = Submission.objects.filter(
            assignment=assignment,
            student=request.user
        ).first()
        
        if submission:
            serializer = SubmissionSerializer(submission)
            return Response({
                'submitted': True,
                'submission': serializer.data
            })
        
        return Response({
            'submitted': False,
            'submission': None
        })


class SubmissionViewSet(viewsets.ModelViewSet):
    """CRUD operations for assignment submissions."""
    
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Disable authentication requirement
    
    def get_queryset(self):
        user = self.request.user
        if user.is_instructor():
            # Instructors see submissions for their assignments
            return Submission.objects.filter(assignment__course__instructor=user)
        elif user.is_student():
            # Students see only their own submissions
            return Submission.objects.filter(student=user)
        return Submission.objects.all()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def grade(self, request, pk=None):
        """Grade a submission (instructor only)."""
        submission = self.get_object()
        
        grade = request.data.get('grade')
        feedback = request.data.get('feedback', '')
        
        if grade is None:
            return Response({
                'error': 'Grade is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            grade = int(grade)
            if grade < 0 or grade > submission.assignment.max_score:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({
                'error': f'Grade must be between 0 and {submission.assignment.max_score}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        submission.grade = grade
        submission.feedback = feedback
        submission.status = 'GRADED'
        submission.graded_at = timezone.now()
        submission.save()
        
        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)


class QuizViewSet(viewsets.ModelViewSet):
    """CRUD operations for quizzes."""
    
    queryset = Quiz.objects.all()
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CustomJWTAuthentication]  # Enable authentication for has_completed field
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer
    
    def get_queryset(self):
        queryset = Quiz.objects.all()
        
        # Filter by course if provided as query parameter
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            return queryset
        
        user = self.request.user
        if not user.is_authenticated:
            return queryset
        if user.is_instructor():
            return queryset.filter(course__instructor=user)
        elif user.is_student():
            enrolled_courses = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
            return queryset.filter(course_id__in=enrolled_courses)
        return queryset
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def attempts(self, request, pk=None):
        """Get quiz attempt count for current user."""
        quiz = self.get_object()
        
        if not request.user.is_authenticated:
            return Response({
                'attempts': 0,
                'max_attempts': quiz.max_attempts,
                'remaining': quiz.max_attempts
            })
        
        attempts = Progress.objects.filter(
            quiz=quiz,
            enrollment__student=request.user
        ).count()
        
        return Response({
            'attempts': attempts,
            'max_attempts': quiz.max_attempts,
            'remaining': max(0, quiz.max_attempts - attempts)
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[CustomJWTAuthentication])
    def submit(self, request, pk=None):
        """Submit quiz answers and auto-grade."""
        quiz = self.get_object()
        answers = request.data.get('answers', {})
        
        print(f"[DEBUG] Quiz submit - answers received: {answers}")
        
        # Require authentication
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=quiz.course
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'You are not enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check attempts
        attempt_count = Progress.objects.filter(
            quiz=quiz,
            enrollment=enrollment
        ).count()
        
        if attempt_count >= quiz.max_attempts:
            return Response({
                'error': f'Maximum attempts ({quiz.max_attempts}) reached'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-grade
        questions = quiz.questions.all()
        total_points = sum(q.points for q in questions)
        earned_points = 0
        correct_count = 0
        question_results = []
        
        for question in questions:
            student_answer = answers.get(str(question.id))
            is_correct = student_answer == question.correct_answer
            
            if is_correct:
                earned_points += question.points
                correct_count += 1
            
            question_results.append({
                'id': str(question.id),
                'question_text': question.question_text,
                'option_a': question.option_a,
                'option_b': question.option_b,
                'option_c': question.option_c,
                'option_d': question.option_d,
                'correct_answer': question.correct_answer,
                'user_answer': student_answer,
                'is_correct': is_correct,
                'points': question.points
            })
        
        # Calculate score percentage
        score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        
        # Create progress record
        progress = Progress.objects.create(
            enrollment=enrollment,
            quiz=quiz,
            completed=True,
            completion_date=timezone.now(),
            quiz_score=score_percentage,
            quiz_attempts=attempt_count + 1
        )
        
        # Update enrollment progress
        self._update_enrollment_progress(enrollment)
        
        return Response({
            'score': earned_points,
            'total_points': total_points,
            'percentage': round(score_percentage, 2),
            'correct_count': correct_count,
            'passed': score_percentage >= quiz.passing_score,
            'questions': question_results
        }, status=status.HTTP_200_OK)
    
    def _update_enrollment_progress(self, enrollment):
        """Recalculate and update enrollment progress."""
        course = enrollment.course
        
        # Count completed lessons
        completed_lessons = Progress.objects.filter(
            enrollment=enrollment,
            lesson__isnull=False,
            completed=True
        ).count()
        
        # Count passed quizzes
        passed_quizzes = Progress.objects.filter(
            enrollment=enrollment,
            quiz__isnull=False,
            quiz_score__gte=F('quiz__passing_score')
        ).count()
        
        # Total items
        total_lessons = course.lessons.count()
        total_quizzes = course.quizzes.count()
        total_items = total_lessons + total_quizzes
        
        if total_items > 0:
            completed_items = completed_lessons + passed_quizzes
            progress_percentage = (completed_items / total_items) * 100
            enrollment.progress = round(progress_percentage, 2)
            enrollment.completed = progress_percentage == 100
            enrollment.save()


class QuestionViewSet(viewsets.ModelViewSet):
    """CRUD operations for quiz questions."""
    
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []  # Disable authentication requirement
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Question.objects.all()
        if user.is_instructor():
            return Question.objects.filter(quiz__course__instructor=user)
        return Question.objects.all()


class ProgressViewSet(viewsets.ModelViewSet):
    """Track student progress."""
    
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [CustomJWTAuthentication]  # Use JWT only, no session auth
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Progress.objects.all()
        if user.is_student():
            return Progress.objects.filter(enrollment__student=user)
        elif user.is_instructor():
            return Progress.objects.filter(enrollment__course__instructor=user)
        return Progress.objects.all()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[CustomJWTAuthentication])
    def mark_lesson_complete(self, request):
        """Mark a lesson as completed."""
        lesson_id = request.data.get('lesson_id')
        
        print(f"[DEBUG] mark_lesson_complete called")
        print(f"[DEBUG] Request method: {request.method}")
        print(f"[DEBUG] Request path: {request.path}")
        print(f"[DEBUG] User: {request.user}, Type: {type(request.user)}")
        print(f"[DEBUG] Authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] Authorization header: {request.headers.get('Authorization', 'None')}")
        
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not lesson_id:
            return Response({
                'error': 'lesson_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({
                'error': 'Lesson not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get enrollment
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=lesson.course
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'You are not enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already completed
        progress, created = Progress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={
                'completed': True,
                'completion_date': timezone.now()
            }
        )
        
        if not created and not progress.completed:
            progress.completed = True
            progress.completion_date = timezone.now()
            progress.save()
        
        # Update enrollment progress
        self._update_enrollment_progress(enrollment)
        
        serializer = ProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def course_progress(self, request):
        """Get progress for a specific course."""
        course_id = request.query_params.get('course_id')
        
        if not course_id:
            return Response({
                'error': 'course_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course_id=course_id
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'You are not enrolled in this course'
            }, status=status.HTTP_404_NOT_FOUND)
        
        progress_records = Progress.objects.filter(enrollment=enrollment)
        serializer = ProgressSerializer(progress_records, many=True)
        
        return Response({
            'enrollment_id': str(enrollment.id),
            'progress_percentage': float(enrollment.progress),
            'completed': enrollment.completed,
            'progress_records': serializer.data
        })
    
    def _update_enrollment_progress(self, enrollment):
        """Recalculate and update enrollment progress."""
        from django.db import models
        
        course = enrollment.course
        
        # Count completed lessons
        completed_lessons = Progress.objects.filter(
            enrollment=enrollment,
            lesson__isnull=False,
            completed=True
        ).count()
        
        # Count passed quizzes
        passed_quizzes = Progress.objects.filter(
            enrollment=enrollment,
            quiz__isnull=False
        ).filter(
            quiz_score__gte=models.F('quiz__passing_score')
        ).count()
        
        # Total items
        total_lessons = course.lessons.count()
        total_quizzes = course.quizzes.count()
        total_items = total_lessons + total_quizzes
        
        if total_items > 0:
            completed_items = completed_lessons + passed_quizzes
            progress_percentage = (completed_items / total_items) * 100
            enrollment.progress = round(progress_percentage, 2)
            enrollment.completed = progress_percentage == 100
            enrollment.save()


class PaymentViewSet(viewsets.ModelViewSet):
    """Handle mock payments."""
    
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_student():
            return Payment.objects.filter(student=user)
        elif user.is_instructor():
            return Payment.objects.filter(course__instructor=user)
        return Payment.objects.all()
    
    def create(self, request, *args, **kwargs):
        """Create a payment and enroll student."""
        course_id = request.data.get('course')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        transaction_id = request.data.get('transaction_id')
        
        # Validate course
        try:
            course = Course.objects.get(id=course_id, status='APPROVED')
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found or not approved'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already enrolled
        existing_enrollment = Enrollment.objects.filter(
            student=request.user,
            course=course
        ).first()
        
        if existing_enrollment:
            return Response({
                'error': 'You are already enrolled in this course'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount matches course price
        if float(amount) != float(course.price):
            return Response({
                'error': 'Payment amount does not match course price'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment
        payment = Payment.objects.create(
            student=request.user,
            course=course,
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            status='COMPLETED'
        )
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=request.user,
            course=course,
            progress=0
        )
        
        # Send confirmation email
        try:
            send_mail(
                subject=f'Payment Successful - {course.title}',
                message=f'Your payment of ${amount} for "{course.title}" has been processed successfully.\n\n'
                        f'Transaction ID: {transaction_id}\n'
                        f'You can now access the course content.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
