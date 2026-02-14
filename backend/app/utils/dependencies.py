"""
Shared dependency functions for route protection
"""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.user import User
from .auth import verify_token


def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current user if token provided, otherwise None"""
    if not authorization:
        return None

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        return None

    email = verify_token(token)
    if not email:
        return None

    user = db.query(User).filter(User.email == email).first()
    return user


def get_current_user_required(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Require authenticated and verified user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )

    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email to access this feature. Check your inbox for the verification link."
        )

    # Check if user is suspended
    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Contact support for assistance."
        )

    return user


def get_admin_required(current_user: User = Depends(get_current_user_required)):
    """Require authenticated admin user"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def get_super_admin_required(current_user: User = Depends(get_current_user_required)):
    """Require authenticated super admin user"""
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_user
