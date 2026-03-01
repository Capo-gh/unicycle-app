from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import List
from ..database import get_db
from ..models.saved_listing import SavedListing
from ..models.listing import Listing
from ..models.user import User
from ..schemas.listing import ListingResponse
from ..utils.dependencies import get_current_user_required

router = APIRouter(prefix="/saved", tags=["Saved"])


@router.post("/{listing_id}", status_code=status.HTTP_200_OK)
def toggle_save(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Toggle save state for a listing. Returns {saved: true/false}."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot save your own listing")

    existing = db.query(SavedListing).filter(
        SavedListing.user_id == current_user.id,
        SavedListing.listing_id == listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}

    try:
        saved = SavedListing(user_id=current_user.id, listing_id=listing_id)
        db.add(saved)
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"saved": True}

    return {"saved": True}


@router.get("/ids")
def get_saved_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Return only the listing IDs saved by the current user (fast hydration for heart state)."""
    rows = db.query(SavedListing.listing_id).filter(
        SavedListing.user_id == current_user.id
    ).all()
    return {"ids": [r.listing_id for r in rows]}


@router.get("/", response_model=List[ListingResponse])
def get_saved(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Return all saved listings for the current user (active only)."""
    saved_rows = db.query(SavedListing).filter(
        SavedListing.user_id == current_user.id
    ).all()
    listing_ids = [r.listing_id for r in saved_rows]

    if not listing_ids:
        return []

    listings = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(
        Listing.id.in_(listing_ids),
        Listing.is_active == True
    ).order_by(Listing.created_at.desc()).all()

    return listings
