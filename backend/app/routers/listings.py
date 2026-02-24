from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, case, and_
from typing import List, Optional
from datetime import datetime, timezone
from ..database import get_db
from ..models.listing import Listing
from ..models.user import User
from ..models.transaction import Transaction
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from ..utils.dependencies import get_current_user_optional, get_current_user_required

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a new listing"""
    db_listing = Listing(
        **listing_data.model_dump(),
        seller_id=current_user.id
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    
    # Reload with seller info
    db_listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == db_listing.id).first()
    
    return db_listing


@router.get("/", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = None,
    search: Optional[str] = None,
    university: Optional[str] = None,
    include_sold: bool = False,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get all listings with optional filters"""
    query = db.query(Listing).options(joinedload(Listing.seller))
    
    # Filter out sold items by default
    if not include_sold:
        query = query.filter(Listing.is_sold == False)
    
    # Category filter
    if category and category != 'All':
        query = query.filter(Listing.category == category)
    
    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(search_term)) | 
            (Listing.description.ilike(search_term))
        )
    
    # University filter
    if university:
        query = query.join(User, Listing.seller_id == User.id).filter(User.university == university)
    
    # Price filters
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    
    # Condition filter
    if condition and condition != 'All':
        query = query.filter(Listing.condition == condition)
    
    # Sorting
    if sort == 'price_asc':
        query = query.order_by(asc(Listing.price))
    elif sort == 'price_desc':
        query = query.order_by(desc(Listing.price))
    elif sort == 'oldest':
        query = query.order_by(asc(Listing.created_at))
    else:
        # Default: active boosts first (by most recently boosted), then newest
        now = datetime.now(timezone.utc)
        is_active_boost = and_(Listing.is_boosted == True, Listing.boosted_until > now)
        query = query.order_by(
            case((is_active_boost, 1), else_=0).desc(),
            Listing.created_at.desc()
        )
    
    results = query.all()

    # Sponsored listings appear first when browsing their specific category
    if category and category != 'All':
        sponsored = [l for l in results if l.seller and l.seller.is_sponsor and l.seller.sponsored_category == category]
        regular = [l for l in results if not (l.seller and l.seller.is_sponsor and l.seller.sponsored_category == category)]
        results = sponsored + regular

    return results


@router.get("/my", response_model=List[ListingResponse])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get current user's listings"""
    listings = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.seller_id == current_user.id).order_by(desc(Listing.created_at)).all()
    
    return listings


@router.get("/user/{user_id}", response_model=List[ListingResponse])
def get_user_listings(
    user_id: int,
    include_sold: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get all listings for a specific user"""
    query = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.seller_id == user_id)
    
    if not include_sold:
        query = query.filter(Listing.is_sold == False)
    
    return query.order_by(desc(Listing.created_at)).all()


@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get a single listing by ID"""
    listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    return listing


@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Update a listing (only owner can update)"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    update_data = listing_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)
    
    db.commit()
    db.refresh(listing)
    
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Delete a listing (only owner can delete)"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    # Delete related transactions first (no ON DELETE CASCADE on FK)
    db.query(Transaction).filter(Transaction.listing_id == listing_id).delete()

    db.delete(listing)
    db.commit()

    return None


@router.post("/{listing_id}/sold", response_model=ListingResponse)
def mark_as_sold(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Mark a listing as sold (only owner can mark)"""
    listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    listing.is_sold = True
    db.commit()
    db.refresh(listing)
    
    return listing


@router.post("/{listing_id}/unsold", response_model=ListingResponse)
def mark_as_unsold(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Mark a listing as available again (only owner can mark)"""
    listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == listing_id).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    listing.is_sold = False
    db.commit()
    db.refresh(listing)
    
    return listing