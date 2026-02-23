from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..database import get_db
from ..models.user import User
from ..models.notification import Notification, NotificationRead
from ..schemas.notification import NotificationCreate
from ..utils.dependencies import get_admin_required, get_current_user_required

router = APIRouter(tags=["Notifications"])


def send_user_notification(db: Session, recipient_id: int, title: str, message: str):
    """Create a personal notification for a specific user (triggered by system events).
    NOTE: caller must commit the session after calling this."""
    admin = db.query(User).filter(User.is_super_admin == True).first()
    created_by = admin.id if admin else recipient_id

    notification = Notification(
        title=title,
        message=message,
        type="personal",
        recipient_user_id=recipient_id,
        created_by=created_by
    )
    db.add(notification)


def _user_notification_filter(current_user: User):
    """SQLAlchemy filter: notifications visible to current_user."""
    return or_(
        # Broadcasts (no recipient) scoped by university or global
        and_(
            Notification.recipient_user_id.is_(None),
            or_(
                Notification.target_university.is_(None),
                Notification.target_university == current_user.university
            )
        ),
        # Personal notifications addressed to this specific user
        Notification.recipient_user_id == current_user.id
    )


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
    """List broadcast notifications (admin view — excludes personal)"""
    notifications = db.query(Notification).filter(
        Notification.type != "personal"
    ).order_by(Notification.created_at.desc()).all()
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
    """Get notifications for the current user (broadcasts + personal)"""
    notifications = db.query(Notification).filter(
        _user_notification_filter(current_user)
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
        _user_notification_filter(current_user)
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
        db.add(NotificationRead(notification_id=notification_id, user_id=current_user.id))
        db.commit()
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Mark all notifications as read"""
    notifications = db.query(Notification).filter(
        _user_notification_filter(current_user)
    ).all()

    read_ids = set(
        r.notification_id for r in
        db.query(NotificationRead.notification_id).filter(
            NotificationRead.user_id == current_user.id
        ).all()
    )

    for n in notifications:
        if n.id not in read_ids:
            db.add(NotificationRead(notification_id=n.id, user_id=current_user.id))
    db.commit()
    return {"message": "All marked as read"}
