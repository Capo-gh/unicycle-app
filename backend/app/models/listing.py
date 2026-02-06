from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    images = Column(Text, nullable=True)  # Comma-separated URLs
    
    # Safe zone
    safe_zone = Column(String, nullable=False)
    safe_zone_address = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_sold = Column(Boolean, default=False)  # NEW: Mark as sold
    
    # Foreign keys
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    seller = relationship("User", backref="listings")