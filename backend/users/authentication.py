"""JWT Authentication for SkillSphere."""
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User


class JWTAuthentication(authentication.BaseAuthentication):
    """Custom JWT authentication class."""
    
    def authenticate(self, request):
        """Authenticate the request and return a two-tuple of (user, token)."""
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            # Extract token from "Bearer <token>"
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
            
            # Decode and verify token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Get user from payload
            user_id = payload.get('user_id')
            if not user_id:
                raise exceptions.AuthenticationFailed('Invalid token payload')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise exceptions.AuthenticationFailed('User not found')
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except ValueError:
            raise exceptions.AuthenticationFailed('Invalid authorization header')


def generate_access_token(user):
    """Generate JWT access token for a user."""
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def generate_refresh_token(user):
    """Generate JWT refresh token for a user."""
    payload = {
        'user_id': str(user.id),
        'exp': datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def verify_refresh_token(token):
    """Verify and decode a refresh token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        if payload.get('type') != 'refresh':
            raise jwt.InvalidTokenError('Not a refresh token')
        
        return payload
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Refresh token has expired')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid refresh token')
