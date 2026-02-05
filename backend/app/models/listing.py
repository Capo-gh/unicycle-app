from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base

class ConditionEnum(str, enum.Enum):
    NEW = "New"
    LIKE_NEW = "Like New"
    GOOD = "Good"
    FAIR = "Fair"

class CategoryEnum(str, enum.Enum):
    TEXTBOOKS = "Textbooks & Course Materials"
    ELECTRONICS = "Electronics & Gadgets"
    FURNITURE = "Furniture & Decor"
    CLOTHING = "Clothing & Accessories"
    SPORTS = "Sports & Fitness"
    KITCHEN = "Kitchen & Dining"
    SCHOOL_SUPPLIES = "School Supplies"
    BIKES = "Bikes & Transportation"
    OTHER = "Other"

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(Enum(CategoryEnum), nullable=False, index=True)
    condition = Column(Enum(ConditionEnum), nullable=False)
    images = Column(Text, nullable=True)  # Comma-separated URLs for now
    safe_zone = Column(String, nullable=False)
    safe_zone_address = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    
    # Foreign key to user
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    seller = relationship("User", backref="listings")