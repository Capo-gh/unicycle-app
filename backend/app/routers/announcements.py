from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timezone
from ..database import get_db
from ..models.user import User
from ..models.announcement import Announcement, AnnouncementDismissal
from ..schemas.announcement import AnnouncementCreate
from ..utils.dependencies import get_admin_required, get_current_user_required

router = APIRouter(tags=["Announcements"])


@router.post("/admin/announcements")
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Create a new promotional announcement"""
    announcement = Announcement(
        title=data.title,
        message=data.message,
        image_url=data.image_url,
        action_text=data.action_text,
        action_type=data.action_type,
        target_university=data.target_university,
        expires_at=data.expires_at,
        created_by=current_user.id
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return {"message": "Announcement created", "id": announcement.id}


@router.get("/admin/announcements")
def get_all_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all announcements for admin management"""
    announcements = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "image_url": a.image_url,
            "action_text": a.action_text,
            "action_type": a.action_type,
            "is_active": a.is_active,
            "target_university": a.target_university,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "expires_at": a.expires_at.isoformat() if a.expires_at else None,
            "creator_name": a.creator.name if a.creator else "Unknown"
        }
        for a in announcements
    ]


@router.put("/admin/announcements/{announcement_id}/toggle")
def toggle_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Toggle announcement active status"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement.is_active = not announcement.is_active
    db.commit()
    return {"message": f"Announcement {'activated' if announcement.is_active else 'deactivated'}"}


@router.delete("/admin/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Delete an announcement"""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.query(AnnouncementDismissal).filter(
        AnnouncementDismissal.announcement_id == announcement_id
    ).delete()
    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted"}


@router.get("/announcements/active")
def get_active_announcement(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get the newest undismissed active announcement for this user"""
    now = datetime.now(timezone.utc)

    dismissed_ids = [
        d.announcement_id for d in
        db.query(AnnouncementDismissal.announcement_id).filter(
            AnnouncementDismissal.user_id == current_user.id
        ).all()
    ]

    query = db.query(Announcement).filter(
        Announcement.is_active == True,
        or_(Announcement.expires_at.is_(None), Announcement.expires_at > now),
        or_(
            Announcement.target_university.is_(None),
            Announcement.target_university == current_user.university
        )
    )

    if dismissed_ids:
        query = query.filter(Announcement.id.notin_(dismissed_ids))

    announcement = query.order_by(Announcement.created_at.desc()).first()

    if not announcement:
        return None

    return {
        "id": announcement.id,
        "title": announcement.title,
        "message": announcement.message,
        "image_url": announcement.image_url,
        "action_text": announcement.action_text,
        "action_type": announcement.action_type,
        "target_university": announcement.target_university,
        "created_at": announcement.created_at.isoformat() if announcement.created_at else None
    }


@router.post("/announcements/{announcement_id}/dismiss")
def dismiss_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Dismiss an announcement so it won't show again"""
    existing = db.query(AnnouncementDismissal).filter(
        and_(
            AnnouncementDismissal.announcement_id == announcement_id,
            AnnouncementDismissal.user_id == current_user.id
        )
    ).first()
    if not existing:
        dismissal = AnnouncementDismissal(
            announcement_id=announcement_id,
            user_id=current_user.id
        )
        db.add(dismissal)
        db.commit()
    return {"message": "Announcement dismissed"}
