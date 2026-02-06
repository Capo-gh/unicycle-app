from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewerInfo(BaseModel):
    id: int
    name: str
    university: str
    
    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    reviewed_user_id: int
    listing_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    text: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewed_user_id: int
    listing_id: Optional[int]
    rating: int
    text: Optional[str]
    reviewer: ReviewerInfo
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserReviewStats(BaseModel):
    avg_rating: float
    review_count: int
    reviews: list[ReviewResponse]