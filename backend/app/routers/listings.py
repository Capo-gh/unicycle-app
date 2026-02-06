from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ..database import get_db
from ..models.listing import Listing
from ..models.user import User
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from ..utils.auth import verify_token

router = APIRouter(prefix="/listings", tags=["Listings"])


def get_current_user_from_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Helper to get current user from token"""
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
    
    return user


@router.get("/", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    university: Optional[str] = None,
    include_sold: Optional[bool] = False,  # Option to include sold items
    db: Session = Depends(get_db)
):
    """Get all active listings with optional filters including university"""
    query = db.query(Listing).options(joinedload(Listing.seller)).filter(Listing.is_active == True)
    
    # By default, exclude sold items unless specifically requested
    if not include_sold:
        query = query.filter(Listing.is_sold == False)
    
    # Filter by university/marketplace
    if university:
        query = query.join(User, Listing.seller_id == User.id).filter(User.university == university)
    
    if category:
        query = query.filter(Listing.category == category)
    
    if condition:
        query = query.filter(Listing.condition == condition)
    
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(search_term)) | 
            (Listing.description.ilike(search_term))
        )
    
    listings = query.order_by(Listing.created_at.desc()).all()
    return listings


@router.get("/my", response_model=List[ListingResponse])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get current user's listings (including sold ones)"""
    listings = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(
        Listing.seller_id == current_user.id,
        Listing.is_active == True
    ).order_by(Listing.created_at.desc()).all()
    
    return listings


@router.get("/user/{user_id}", response_model=List[ListingResponse])
def get_user_listings(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all active listings for a specific user (public view - excludes sold)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    listings = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(
        Listing.seller_id == user_id,
        Listing.is_active == True,
        Listing.is_sold == False
    ).order_by(Listing.created_at.desc()).all()
    
    return listings


@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
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


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Create a new listing"""
    db_listing = Listing(
        **listing.model_dump(),
        seller_id=current_user.id
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    
    # Reload with seller relationship
    db_listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == db_listing.id).first()
    
    return db_listing


@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Update a listing (only owner can update)"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    # Update fields
    update_data = listing_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_listing, field, value)
    
    db.commit()
    db.refresh(db_listing)
    
    # Reload with seller relationship
    db_listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == db_listing.id).first()
    
    return db_listing


@router.patch("/{listing_id}/sold", response_model=ListingResponse)
def mark_as_sold(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Mark a listing as sold (only owner can mark)"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    db_listing.is_sold = True
    db.commit()
    db.refresh(db_listing)
    
    # Reload with seller relationship
    db_listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == db_listing.id).first()
    
    return db_listing


@router.patch("/{listing_id}/unsold", response_model=ListingResponse)
def mark_as_unsold(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Mark a listing as available again (only owner can mark)"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    db_listing.is_sold = False
    db.commit()
    db.refresh(db_listing)
    
    # Reload with seller relationship
    db_listing = db.query(Listing).options(
        joinedload(Listing.seller)
    ).filter(Listing.id == db_listing.id).first()
    
    return db_listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete a listing (soft delete - only owner can delete)"""
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    
    if not db_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if db_listing.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    # Soft delete
    db_listing.is_active = False
    db.commit()
    
    return None