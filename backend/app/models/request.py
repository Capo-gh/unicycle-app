from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Request(Base):
    """ISO/WTB Request model - users looking for items"""
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True)
    urgent = Column(Boolean, default=False)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    
    # Foreign key to user (author)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", backref="requests")
    replies = relationship("Reply", back_populates="request", cascade="all, delete-orphan", order_by="Reply.created_at")


class Reply(Base):
    """Reply to a request"""
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    
    # Foreign keys
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    request = relationship("Request", back_populates="replies")
    author = relationship("User", backref="replies")