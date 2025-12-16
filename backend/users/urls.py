"""URL configuration for users app."""
from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, RefreshTokenView,
    CurrentUserView, PasswordResetRequestView, PasswordResetConfirmView,
    PasswordChangeView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh-token'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
]
