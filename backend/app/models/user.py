from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    university = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # Added for password auth
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    token_created_at = Column(DateTime(timezone=True), nullable=True)

    avatar_url = Column(String, nullable=True)

    is_admin = Column(Boolean, default=False)
    is_super_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    is_sponsor = Column(Boolean, default=False)
    sponsored_category = Column(String, nullable=True)

    # Review stats (will be updated when reviews are added)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())