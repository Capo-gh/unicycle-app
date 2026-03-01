import json
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class SellerInfo(BaseModel):
    id: int
    name: str
    university: str
    avg_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    is_sponsor: Optional[bool] = False
    sponsored_category: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ListingBase(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    price: float = Field(..., ge=0)
    category: str
    condition: str
    safe_zone: str
    safe_zone_address: Optional[str] = None
    images: Optional[str] = None

    @field_validator('images', mode='before')
    @classmethod
    def normalize_images(cls, v):
        if not v:
            return v
        if isinstance(v, list):
            return json.dumps(v)
        if isinstance(v, str) and not v.startswith('['):
            parts = [p.strip() for p in v.split(',') if p.strip()]
            return json.dumps(parts)
        return v


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, ge=0)
    category: Optional[str] = None
    condition: Optional[str] = None
    safe_zone: Optional[str] = None
    safe_zone_address: Optional[str] = None
    images: Optional[str] = None
    is_sold: Optional[bool] = None

    @field_validator('images', mode='before')
    @classmethod
    def normalize_images(cls, v):
        if not v:
            return v
        if isinstance(v, list):
            return json.dumps(v)
        if isinstance(v, str) and not v.startswith('['):
            parts = [p.strip() for p in v.split(',') if p.strip()]
            return json.dumps(parts)
        return v


class ListingResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    category: str
    condition: str
    safe_zone: str
    safe_zone_address: Optional[str]
    images: Optional[str]
    is_active: bool
    is_sold: bool = False
    is_boosted: bool = False
    boosted_until: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    last_bumped_at: Optional[datetime] = None
    seller_id: int
    seller: Optional[SellerInfo] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
