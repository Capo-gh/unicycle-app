from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..database import get_db
from ..models.user import User
from ..models.notification import Notification, NotificationRead
from ..schemas.notification import NotificationCreate
from ..utils.dependencies import get_admin_required, get_current_user_required

router = APIRouter(tags=["Notifications"])


@router.post("/admin/notifications/broadcast")
def send_broadcast(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Send a broadcast notification to all users or a specific university"""
    notification = Notification(
        title=data.title,
        message=data.message,
        type="broadcast",
        target_university=data.target_university,
        created_by=current_user.id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return {"message": "Broadcast sent", "id": notification.id}


@router.get("/admin/notifications")
def get_admin_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all sent notifications (admin view)"""
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "target_university": n.target_university,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "creator_name": n.creator.name if n.creator else "Unknown"
        }
        for n in notifications
    ]


@router.get("/notifications")
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get notifications for the current user"""
    notifications = db.query(Notification).filter(
        or_(
            Notification.target_university.is_(None),
            Notification.target_university == current_user.university
        )
    ).order_by(Notification.created_at.desc()).limit(50).all()

    read_ids = set(
        r.notification_id for r in
        db.query(NotificationRead.notification_id).filter(
            NotificationRead.user_id == current_user.id
        ).all()
    )

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "target_university": n.target_university,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "is_read": n.id in read_ids
        }
        for n in notifications
    ]


@router.get("/notifications/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get count of unread notifications"""
    total = db.query(Notification).filter(
        or_(
            Notification.target_university.is_(None),
            Notification.target_university == current_user.university
        )
    ).count()

    read_count = db.query(NotificationRead).filter(
        NotificationRead.user_id == current_user.id
    ).count()

    return {"unread_count": max(0, total - read_count)}


@router.put("/notifications/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Mark a notification as read"""
    existing = db.query(NotificationRead).filter(
        and_(
            NotificationRead.notification_id == notification_id,
            NotificationRead.user_id == current_user.id
        )
    ).first()
    if not existing:
        read = NotificationRead(
            notification_id=notification_id,
            user_id=current_user.id
        )
        db.add(read)
        db.commit()
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Mark all notifications as read"""
    notifications = db.query(Notification).filter(
        or_(
            Notification.target_university.is_(None),
            Notification.target_university == current_user.university
        )
    ).all()

    read_ids = set(
        r.notification_id for r in
        db.query(NotificationRead.notification_id).filter(
            NotificationRead.user_id == current_user.id
        ).all()
    )

    for n in notifications:
        if n.id not in read_ids:
            db.add(NotificationRead(
                notification_id=n.id,
                user_id=current_user.id
            ))
    db.commit()
    return {"message": "All marked as read"}
