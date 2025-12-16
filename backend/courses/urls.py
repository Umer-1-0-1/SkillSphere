"""URL configuration for courses app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryListView, CategoryCreateView,
    InstructorCourseListView, CourseCreateView, CourseUpdateView, CourseDeleteView,
    PublicCourseListView, PublicCourseDetailView,
    PendingCoursesListView, CourseReviewView, CourseApprovalView,
    LessonListCreateView, LessonUpdateView, LessonDeleteView, CourseProgressView,
    admin_dashboard_stats, instructor_dashboard_stats,
    # Sprint 2 ViewSets
    VideoViewSet, AssignmentViewSet, SubmissionViewSet,
    QuizViewSet, QuestionViewSet, ProgressViewSet, PaymentViewSet
)

# Router for Sprint 2 ViewSets
router = DefaultRouter()
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'progress', ProgressViewSet, basename='progress')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/create/', CategoryCreateView.as_view(), name='category-create'),
    
    # Instructor course management
    path('instructor/my-courses/', InstructorCourseListView.as_view(), name='instructor-courses'),
    path('instructor/create/', CourseCreateView.as_view(), name='course-create'),
    path('instructor/<uuid:pk>/update/', CourseUpdateView.as_view(), name='course-update'),
    path('instructor/<uuid:pk>/delete/', CourseDeleteView.as_view(), name='course-delete'),
    path('instructor/dashboard/stats/', instructor_dashboard_stats, name='instructor-dashboard-stats'),
    
    # Public course catalog
    path('catalog/', PublicCourseListView.as_view(), name='public-course-list'),
    path('catalog/<uuid:id>/', PublicCourseDetailView.as_view(), name='public-course-detail'),
    
    # Course detail (for enrolled students and instructors)
    path('<uuid:id>/', PublicCourseDetailView.as_view(), name='course-detail'),
    
    # Admin course approval
    path('admin/pending/', PendingCoursesListView.as_view(), name='pending-courses'),
    path('admin/review/<uuid:id>/', CourseReviewView.as_view(), name='course-review'),
    path('admin/approve/<uuid:id>/', CourseApprovalView.as_view(), name='course-approval'),
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
    
    # Lessons - Combined view for GET (list) and POST (create)
    path('<uuid:course_id>/lessons/', LessonListCreateView.as_view(), name='lesson-list-create'),
    path('lessons/<uuid:id>/update/', LessonUpdateView.as_view(), name='lesson-update'),
    path('lessons/<uuid:id>/delete/', LessonDeleteView.as_view(), name='lesson-delete'),
    
    # Progress for a specific course
    path('<uuid:course_id>/progress/', CourseProgressView.as_view(), name='course-progress'),
    
    # Sprint 2 Router URLs
    path('', include(router.urls)),
]
