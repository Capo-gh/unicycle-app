from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Review(Base):
    """Review of a user after a transaction"""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    
    # Who wrote the review
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Who is being reviewed
    reviewed_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Optional: related listing (if review is about a specific transaction)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    text = Column(Text, nullable=True)  # Optional review text
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewer_id], backref="reviews_given")
    reviewed_user = relationship("User", foreign_keys=[reviewed_user_id], backref="reviews_received")
    listing = relationship("Listing", backref="reviews")
    
    # Constraint: rating must be 1-5
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating'),
    )