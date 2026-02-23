from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.review import Review
from ..models.user import User
from ..schemas.review import ReviewCreate, ReviewResponse, UserReviewStats
from ..utils.dependencies import get_current_user_required

router = APIRouter(prefix="/reviews", tags=["Reviews"])


def update_user_rating(db: Session, user_id: int):
    """Recalculate and update user's average rating"""
    result = db.query(
        func.avg(Review.rating).label('avg'),
        func.count(Review.id).label('count')
    ).filter(Review.reviewed_user_id == user_id).first()
    
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.avg_rating = float(result.avg) if result.avg else 0.0
        user.review_count = result.count or 0
        db.commit()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a review for another user"""
    # Can't review yourself
    if review_data.reviewed_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review yourself"
        )
    
    # Check if reviewed user exists
    reviewed_user = db.query(User).filter(User.id == review_data.reviewed_user_id).first()
    if not reviewed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already reviewed this user (optional: can allow multiple reviews)
    existing_review = db.query(Review).filter(
        Review.reviewer_id == current_user.id,
        Review.reviewed_user_id == review_data.reviewed_user_id,
        Review.listing_id == review_data.listing_id  # Same listing
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this user for this transaction"
        )
    
    # Create review
    review = Review(
        reviewer_id=current_user.id,
        reviewed_user_id=review_data.reviewed_user_id,
        listing_id=review_data.listing_id,
        rating=review_data.rating,
        text=review_data.text
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Update user's average rating
    update_user_rating(db, review_data.reviewed_user_id)
    
    # Reload with relationships
    review = db.query(Review).options(
        joinedload(Review.reviewer)
    ).filter(Review.id == review.id).first()
    
    return review


@router.get("/user/{user_id}", response_model=UserReviewStats)
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    reviews = db.query(Review).options(
        joinedload(Review.reviewer)
    ).filter(
        Review.reviewed_user_id == user_id
    ).order_by(Review.created_at.desc()).all()
    
    return {
        "avg_rating": user.avg_rating or 0.0,
        "review_count": user.review_count or 0,
        "reviews": reviews
    }


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Edit a review (only the reviewer can edit)"""
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if review.reviewer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this review")

    review.rating = review_data.rating
    review.text = review_data.text
    db.commit()

    update_user_rating(db, review.reviewed_user_id)

    review = db.query(Review).options(joinedload(Review.reviewer)).filter(Review.id == review_id).first()
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Delete a review (only reviewer can delete)"""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    reviewed_user_id = review.reviewed_user_id
    db.delete(review)
    db.commit()
    
    # Update user's average rating
    update_user_rating(db, reviewed_user_id)
    
    return None