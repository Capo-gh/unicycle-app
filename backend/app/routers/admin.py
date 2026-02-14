from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from ..database import get_db
from ..models.user import User
from ..models.listing import Listing
from ..models.transaction import Transaction, TransactionStatus
from ..utils.dependencies import get_admin_required, get_super_admin_required

router = APIRouter(prefix="/admin", tags=["Admin"])


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

    # Revenue estimate: 7% of completed transactions on items >= $80
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
        "estimated_revenue": round(revenue_query or 0, 2)
    }


@router.get("/universities")
def get_universities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Get list of distinct universities"""
    universities = db.query(User.university).distinct().order_by(User.university).all()
    return [u[0] for u in universities]


@router.get("/users")
def get_all_users(
    search: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all users with optional search and university filter"""
    query = db.query(User)
    if university:
        query = query.filter(User.university == university)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.university.ilike(search_term))
        )
    users = query.order_by(User.created_at.desc()).all()
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
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-admin")
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_super_admin_required)
):
    """Toggle admin status for a user (super admin only)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = not user.is_admin
    db.commit()
    return {"message": f"Admin status {'granted' if user.is_admin else 'revoked'} for {user.name}"}


@router.put("/users/{user_id}/suspend")
def toggle_suspend(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Toggle suspend status for a user"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend yourself"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = not user.is_suspended
    db.commit()
    return {"message": f"User {user.name} {'suspended' if user.is_suspended else 'unsuspended'}"}


@router.get("/listings")
def get_all_listings(
    search: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all listings with seller info"""
    query = db.query(Listing).options(joinedload(Listing.seller))
    if university:
        query = query.join(Listing.seller).filter(User.university == university)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(search_term)) |
            (Listing.category.ilike(search_term))
        )
    listings = query.order_by(Listing.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "price": l.price,
            "category": l.category,
            "condition": l.condition,
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
    """Toggle listing active status"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.is_active = not listing.is_active
    db.commit()
    return {"message": f"Listing {'activated' if listing.is_active else 'deactivated'}"}


@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """Delete a listing"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted"}


@router.get("/transactions")
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_required)
):
    """List all transactions"""
    transactions = db.query(Transaction).options(
        joinedload(Transaction.listing),
        joinedload(Transaction.buyer),
        joinedload(Transaction.seller)
    ).order_by(Transaction.created_at.desc()).all()

    return [
        {
            "id": t.id,
            "buyer_name": t.buyer.name if t.buyer else "Unknown",
            "seller_name": t.seller.name if t.seller else "Unknown",
            "listing_title": t.listing.title if t.listing else "Deleted",
            "listing_price": t.listing.price if t.listing else 0,
            "status": t.status.value if hasattr(t.status, 'value') else t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "completed_at": t.completed_at.isoformat() if t.completed_at else None
        }
        for t in transactions
    ]
