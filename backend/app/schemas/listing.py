from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from ..models.listing import CategoryEnum, ConditionEnum

class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., gt=0, le=10000)
    category: CategoryEnum
    condition: ConditionEnum
    images: Optional[str] = None  # Comma-separated URLs
    safe_zone: str
    safe_zone_address: str

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[float] = Field(None, gt=0, le=10000)
    category: Optional[CategoryEnum] = None
    condition: Optional[ConditionEnum] = None
    images: Optional[str] = None
    safe_zone: Optional[str] = None
    safe_zone_address: Optional[str] = None
    is_active: Optional[bool] = None

class SellerInfo(BaseModel):
    id: int
    name: str
    email: str
    university: str
    is_verified: bool
    
    class Config:
        from_attributes = True

class ListingResponse(ListingBase):
    id: int
    is_active: bool
    seller_id: int
    seller: SellerInfo
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True