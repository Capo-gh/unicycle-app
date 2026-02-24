from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from ..database import get_db
from ..models.user import User
from ..models.listing import Listing
from ..models.transaction import Transaction, TransactionStatus
from ..models.review import Review
from ..models.report import Report
from ..models.admin_log import AdminLog
from ..utils.dependencies import get_admin_required, get_super_admin_required
from ..utils.email import send_suspension_email, send_direct_email
from ..config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])


class ResolveDisputeRequest(BaseModel):
    action: str  # 'release' or 'refund'


class EmailUserRequest(BaseModel):
    subject: str
    message: str


def log_action(db: Session, admin_id: int, action: str, target_type: str = None, target_id: int = None, details: str = None):
    """Record an admin action to the audit log"""
    entry = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details
    )
    db.add(entry)
    db.commit()


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Get platform-wide statistics"""
    total_users = db.query(func.count(User.id)).scalar()
    total_listings = db.query(func.count(Listing.id)).scalar()
    active_listings = db.query(func.count(Listing.id)).filter(
        Listing.is_active == True, Listing.is_sold == False
    ).scalar()
    total_transactions = db.query(func.count(Transaction.id)).scalar()
    completed_transactions = db.query(func.count(Transaction.id)).filter(
        Transaction.status == TransactionStatus.COMPLETED
    ).scalar()
    pending_reports = db.query(func.count(Report.id)).filter(Report.status == "pending").scalar()

    revenue_query = db.query(func.sum(Listing.price * 0.07)).join(
        Transaction, Transaction.listing_id == Listing.id
    ).filter(
        Transaction.status == TransactionStatus.COMPLETED,
        Listing.price >= 80
    ).scalar()

    return {
        "total_users": total_users or 0,
        "total_listings": total_listings or 0,
        "active_listings": active_listings or 0,
        "total_transactions": total_transactions or 0,
        "completed_transactions": completed_transactions or 0,
        "estimated_revenue": round(revenue_query or 0, 2),
        "pending_reports": pending_reports or 0
    }


@router.get("/stats/history")
def get_stats_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Get weekly stats for the last 8 weeks"""
    now = datetime.now(timezone.utc)
    weeks = []
    for i in range(7, -1, -1):
        week_start = now - timedelta(weeks=i + 1)
        week_end = now - timedelta(weeks=i)
        label = week_end.strftime("%-d %b") if i > 0 else "This week"

        new_users = db.query(func.count(User.id)).filter(
            User.created_at >= week_start,
            User.created_at < week_end
        ).scalar() or 0

        new_listings = db.query(func.count(Listing.id)).filter(
            Listing.created_at >= week_start,
            Listing.created_at < week_end
        ).scalar() or 0

        new_transactions = db.query(func.count(Transaction.id)).filter(
            Transaction.created_at >= week_start,
            Transaction.created_at < week_end
        ).scalar() or 0

        weeks.append({
            "label": label,
            "users": new_users,
            "listings": new_listings,
            "transactions": new_transactions
        })

    return weeks


# ─── Universities ─────────────────────────────────────────────────────────────

@router.get("/universities")
def get_universities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    universities = db.query(User.university).distinct().order_by(User.university).all()
    return [u[0] for u in universities]


# ─── Users ────────────────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users(
    search: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    query = db.query(
        User,
        func.count(Listing.id).label("listing_count")
    ).outerjoin(Listing, Listing.seller_id == User.id).group_by(User.id)

    if university:
        query = query.filter(User.university == university)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(term)) |
            (User.email.ilike(term)) |
            (User.university.ilike(term))
        )
    rows = query.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "university": u.university,
            "is_verified": u.is_verified,
            "is_admin": u.is_admin,
            "is_super_admin": u.is_super_admin,
            "is_suspended": u.is_suspended,
            "avg_rating": u.avg_rating,
            "review_count": u.review_count,
            "listing_count": listing_count,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u, listing_count in rows
    ]


@router.put("/users/{user_id}/toggle-admin")
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_super_admin_required)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = not user.is_admin
    db.commit()
    log_action(db, current_user.id, "toggle_admin", "user", user_id,
               f"{'granted' if user.is_admin else 'revoked'} admin for {user.name}")
    return {"message": f"Admin status {'granted' if user.is_admin else 'revoked'} for {user.name}"}


@router.put("/users/{user_id}/suspend")
def toggle_suspend(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = not user.is_suspended
    db.commit()

    if user.is_suspended:
        try:
            send_suspension_email(user.email, user.name)
        except Exception as e:
            print(f"Failed to send suspension email: {e}")

    log_action(db, current_user.id, "suspend_user" if user.is_suspended else "unsuspend_user",
               "user", user_id, user.name)
    return {"message": f"User {user.name} {'suspended' if user.is_suspended else 'unsuspended'}"}


@router.post("/users/{user_id}/email")
def email_user(
    user_id: int,
    body: EmailUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Send a direct email to a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        send_direct_email(user.email, user.name, body.subject, body.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    log_action(db, current_user.id, "email_user", "user", user_id,
               f"Subject: {body.subject}")
    return {"message": f"Email sent to {user.name}"}


# ─── Listings ─────────────────────────────────────────────────────────────────

@router.get("/listings")
def get_all_listings(
    search: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    query = db.query(Listing).options(joinedload(Listing.seller))
    if university:
        query = query.join(Listing.seller).filter(User.university == university)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(term)) |
            (Listing.category.ilike(term))
        )
    listings = query.order_by(Listing.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "description": l.description,
            "price": l.price,
            "category": l.category,
            "condition": l.condition,
            "images": l.images.split(",") if l.images else [],
            "is_active": l.is_active,
            "is_sold": l.is_sold,
            "seller_name": l.seller.name if l.seller else "Unknown",
            "seller_email": l.seller.email if l.seller else "",
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in listings
    ]


@router.put("/listings/{listing_id}/deactivate")
def toggle_listing_active(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.is_active = not listing.is_active
    db.commit()
    log_action(db, current_user.id, "toggle_listing", "listing", listing_id,
               f"{'activated' if listing.is_active else 'deactivated'}: {listing.title}")
    return {"message": f"Listing {'activated' if listing.is_active else 'deactivated'}"}


@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    title = listing.title
    db.delete(listing)
    db.commit()
    log_action(db, current_user.id, "delete_listing", "listing", listing_id, title)
    return {"message": "Listing deleted"}


# ─── Transactions ─────────────────────────────────────────────────────────────

@router.get("/transactions")
def get_all_transactions(
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    query = db.query(Transaction).options(
        joinedload(Transaction.listing),
        joinedload(Transaction.buyer),
        joinedload(Transaction.seller)
    )
    if university:
        query = query.join(Transaction.buyer).filter(User.university == university)
    transactions = query.order_by(Transaction.created_at.desc()).all()

    return [
        {
            "id": t.id,
            "buyer_name": t.buyer.name if t.buyer else "Unknown",
            "seller_name": t.seller.name if t.seller else "Unknown",
            "listing_title": t.listing.title if t.listing else "Deleted",
            "listing_price": t.listing.price if t.listing else 0,
            "status": t.status.value if hasattr(t.status, 'value') else t.status,
            "payment_method": t.payment_method,
            "payment_status": t.payment_status,
            "stripe_payment_intent_id": t.stripe_payment_intent_id,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None
        }
        for t in transactions
    ]


@router.post("/transactions/{transaction_id}/resolve")
def resolve_dispute(
    transaction_id: int,
    body: ResolveDisputeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    if body.action not in ('release', 'refund'):
        raise HTTPException(status_code=400, detail="action must be 'release' or 'refund'")

    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.payment_status == "disputed"
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Disputed transaction not found")

    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Payment service not configured")

    import stripe
    stripe.api_key = settings.stripe_secret_key

    if body.action == 'release':
        try:
            stripe.payment_intents.capture(transaction.stripe_payment_intent_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Stripe capture failed: {str(e)}")
        transaction.payment_status = "captured"
        transaction.status = TransactionStatus.COMPLETED
        transaction.completed_at = datetime.now(timezone.utc)
    else:
        try:
            stripe.refunds.create(payment_intent=transaction.stripe_payment_intent_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Stripe refund failed: {str(e)}")
        transaction.payment_status = "refunded"
        transaction.status = TransactionStatus.CANCELLED

    db.commit()
    log_action(db, current_user.id, f"resolve_dispute_{body.action}", "transaction", transaction_id)
    return {"success": True, "action": body.action, "transaction_id": transaction_id}


# ─── Reports ──────────────────────────────────────────────────────────────────

@router.get("/reports")
def get_reports(
    report_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List user reports with optional status filter"""
    query = db.query(Report).options(
        joinedload(Report.reporter),
        joinedload(Report.reportee)
    )
    if report_status:
        query = query.filter(Report.status == report_status)
    reports = query.order_by(Report.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "reporter_name": r.reporter.name if r.reporter else "Unknown",
            "reporter_email": r.reporter.email if r.reporter else "",
            "reportee_id": r.reportee_id,
            "reportee_name": r.reportee.name if r.reportee else "Unknown",
            "reportee_email": r.reportee.email if r.reportee else "",
            "reportee_university": r.reportee.university if r.reportee else "",
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reports
    ]


@router.put("/reports/{report_id}/dismiss")
def dismiss_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "dismissed"
    db.commit()
    log_action(db, current_user.id, "dismiss_report", "report", report_id)
    return {"message": "Report dismissed"}


@router.put("/reports/{report_id}/action")
def action_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Mark report as actioned (admin took action on the reported user)"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "actioned"
    db.commit()
    log_action(db, current_user.id, "action_report", "report", report_id)
    return {"message": "Report marked as actioned"}


# ─── Reviews ──────────────────────────────────────────────────────────────────

@router.get("/reviews")
def get_all_reviews(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all reviews with optional search"""
    query = db.query(Review).options(
        joinedload(Review.reviewer),
        joinedload(Review.reviewed_user)
    )
    if search:
        term = f"%{search}%"
        query = query.join(Review.reviewer).filter(User.name.ilike(term))
    reviews = query.order_by(Review.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "reviewer_name": r.reviewer.name if r.reviewer else "Unknown",
            "reviewed_user_id": r.reviewed_user_id,
            "reviewed_user_name": r.reviewed_user.name if r.reviewed_user else "Unknown",
            "rating": r.rating,
            "text": r.text,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reviews
    ]


@router.delete("/reviews/{review_id}")
def admin_delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Admin deletes a review and recalculates the reviewed user's rating"""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    reviewed_user_id = review.reviewed_user_id
    log_action(db, current_user.id, "delete_review", "review", review_id,
               f"review by {review.reviewer_id} on user {reviewed_user_id}")
    db.delete(review)
    db.commit()

    # Recalculate avg rating
    result = db.query(
        func.avg(Review.rating).label('avg'),
        func.count(Review.id).label('count')
    ).filter(Review.reviewed_user_id == reviewed_user_id).first()
    user = db.query(User).filter(User.id == reviewed_user_id).first()
    if user:
        user.avg_rating = float(result.avg) if result.avg else 0.0
        user.review_count = result.count or 0
        db.commit()

    return {"message": "Review deleted"}


# ─── Audit Log ────────────────────────────────────────────────────────────────

@router.get("/logs")
def get_admin_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Get admin audit log"""
    logs = db.query(AdminLog).options(
        joinedload(AdminLog.admin)
    ).order_by(AdminLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": l.id,
            "admin_name": l.admin.name if l.admin else "Unknown",
            "admin_email": l.admin.email if l.admin else "",
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in logs
    ]
