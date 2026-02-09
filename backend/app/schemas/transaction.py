from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.transaction import TransactionStatus


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

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """User statistics for profile"""
    items_sold: int
    items_bought: int
    active_listings: int

    class Config:
        from_attributes = True
