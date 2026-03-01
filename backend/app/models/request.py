from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Request(Base):
    """User request for items they're looking for"""
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    urgent = Column(Boolean, default=False)
    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)

    # University this request belongs to (auto-set from author's university on creation)
    university = Column(String, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    
    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    author = relationship("User", backref="requests")
    replies = relationship("Reply", back_populates="request", cascade="all, delete-orphan")


class Reply(Base):
    """Reply to a request - supports nested replies"""
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    
    # Foreign keys
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # For nested replies - parent_reply_id is null for top-level replies
    parent_reply_id = Column(Integer, ForeignKey("replies.id", ondelete="CASCADE"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    request = relationship("Request", back_populates="replies")
    author = relationship("User", backref="replies")
    
    # Self-referential relationship for nested replies
    parent_reply = relationship("Reply", remote_side=[id], backref="child_replies")