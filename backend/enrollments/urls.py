"""URL configuration for enrollments app."""
from django.urls import path
from .views import (
    EnrollCourseView, MyEnrollmentsView, EnrollmentDetailView,
    CheckEnrollmentView, LessonProgressListView, LessonProgressUpdateView,
    student_dashboard_stats, MockPaymentView
)

urlpatterns = [
    # Enrollment
    path('enroll/', EnrollCourseView.as_view(), name='enroll-course'),
    path('payment/', MockPaymentView.as_view(), name='mock-payment'),
    path('my-courses/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('<uuid:id>/', EnrollmentDetailView.as_view(), name='enrollment-detail'),
    path('check/<uuid:course_id>/', CheckEnrollmentView.as_view(), name='check-enrollment'),
    
    # Lesson Progress
    path('<uuid:enrollment_id>/progress/', LessonProgressListView.as_view(), name='lesson-progress-list'),
    path('<uuid:enrollment_id>/progress/<uuid:lesson_id>/', LessonProgressUpdateView.as_view(), name='lesson-progress-update'),
    
    # Dashboard
    path('dashboard/stats/', student_dashboard_stats, name='student-dashboard-stats'),
]
