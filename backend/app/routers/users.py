from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..models.report import Report
from ..schemas.user import UserResponse
from ..utils.dependencies import get_current_user_required
from ..utils.email import send_report_email

router = APIRouter(prefix="/users", tags=["Users"])


class ReportRequest(BaseModel):
    reason: str
    details: Optional[str] = ""


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get a user's public profile"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.post("/{user_id}/report")
def report_user(
    user_id: int,
    body: ReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Report a user — sends an alert email to the admin."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot report yourself"
        )

    reportee = db.query(User).filter(User.id == user_id).first()
    if not reportee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Persist to DB
    report = Report(
        reporter_id=current_user.id,
        reportee_id=reportee.id,
        reason=body.reason,
        details=body.details or "",
        status="pending"
    )
    db.add(report)
    db.commit()

    try:
        send_report_email(
            reporter_name=current_user.name,
            reporter_email=current_user.email,
            reporter_university=current_user.university or "",
            reportee_name=reportee.name,
            reportee_email=reportee.email,
            reportee_university=reportee.university or "",
            reason=body.reason,
            details=body.details or "",
        )
    except Exception:
        pass  # Don't fail the request if email fails

    return {"message": "Report submitted. Our team will review it within 24 hours."}


@router.put("/me", response_model=UserResponse)
def update_profile(
    body: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Update current user's profile (name and/or avatar)"""
    if body.name is not None:
        name = body.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        current_user.name = name
    if body.avatar_url is not None:
        if body.avatar_url and not body.avatar_url.startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="avatar_url must be a valid http/https URL")
        current_user.avatar_url = body.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user