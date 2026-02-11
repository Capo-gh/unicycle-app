from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.transaction import TransactionStatus
from .listing import ListingResponse, SellerInfo


class TransactionCreate(BaseModel):
    listing_id: int


class TransactionUpdate(BaseModel):
    status: TransactionStatus


class TransactionResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    status: TransactionStatus
    created_at: datetime
    completed_at: Optional[datetime]
    updated_at: datetime

    # Nested objects (loaded with joinedload)
    listing: Optional[ListingResponse] = None
    seller: Optional[SellerInfo] = None
    buyer: Optional[SellerInfo] = None

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """User statistics for profile"""
    items_sold: int
    items_bought: int
    active_listings: int

    class Config:
        from_attributes = True
