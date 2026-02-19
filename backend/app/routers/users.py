from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserResponse
from ..utils.dependencies import get_current_user_required
from ..utils.email import send_report_email

router = APIRouter(prefix="/users", tags=["Users"])


class ReportRequest(BaseModel):
    reason: str
    details: Optional[str] = ""


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