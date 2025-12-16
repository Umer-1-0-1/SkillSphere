"""Views for user authentication and management."""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from datetime import timedelta
import secrets

from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordChangeSerializer
)
from .authentication import generate_access_token, generate_refresh_token, verify_refresh_token


class RegisterView(APIView):
    """Handle user registration."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'access_token': access_token,
                'refresh_token': refresh_token
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Handle user login."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.check_password(password):
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is inactive'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        access_token = generate_access_token(user)
        refresh_token = generate_refresh_token(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Handle user logout."""
    
    def post(self, request):
        # In a JWT system, logout is handled client-side by removing tokens
        # Here we can add token to a blacklist if needed
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    """Handle token refresh."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payload = verify_refresh_token(refresh_token)
            user = User.objects.get(id=payload['user_id'])
            
            # Generate new access token
            access_token = generate_access_token(user)
            
            return Response({
                'access_token': access_token
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)


class CurrentUserView(APIView):
    """Get current authenticated user."""
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update current user profile."""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Handle password reset request."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            user.reset_token = reset_token
            user.reset_token_expiry = timezone.now() + timedelta(hours=1)
            user.save(update_fields=['reset_token', 'reset_token_expiry'])
            
            # Send email
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            try:
                send_mail(
                    subject='Password Reset Request - SkillSphere',
                    message=f'Click the following link to reset your password: {reset_url}\n\nThis link will expire in 1 hour.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")
            
            return Response({
                'message': 'Password reset link sent to your email'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist
            return Response({
                'message': 'If an account exists with this email, a password reset link will be sent'
            }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Handle password reset confirmation."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(reset_token=token)
            
            # Check if token has expired
            if user.reset_token_expiry < timezone.now():
                return Response({
                    'error': 'Reset token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.reset_token = None
            user.reset_token_expiry = None
            user.save(update_fields=['password', 'reset_token', 'reset_token_expiry'])
            
            return Response({
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid reset token'
            }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Handle password change for authenticated users."""
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save(update_fields=['password'])
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
