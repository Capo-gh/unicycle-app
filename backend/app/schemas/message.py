from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# USER SCHEMAS (for nested responses)
class UserBasic(BaseModel):
    id: int
    name: str
    university: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

# LISTING SCHEMAS (for nested responses)
class ListingBasic(BaseModel):
    id: int
    title: str
    price: float
    images: Optional[str] = None
    
    class Config:
        from_attributes = True


# MESSAGE SCHEMAS
class ReplyPreview(BaseModel):
    id: int
    text: str
    sender: UserBasic

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    text: str
    reply_to_id: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    text: str
    conversation_id: int
    sender_id: int
    sender: UserBasic
    is_read: bool
    created_at: datetime
    reply_to_id: Optional[int] = None
    reply_to: Optional[ReplyPreview] = None

    class Config:
        from_attributes = True


# CONVERSATION SCHEMAS
class ConversationCreate(BaseModel):
    """Create a new conversation - requires listing_id to identify seller"""
    listing_id: int
    initial_message: str  # First message to send


class ConversationResponse(BaseModel):
    id: int
    listing_id: Optional[int]
    listing: Optional[ListingBasic]
    buyer_id: int
    seller_id: int
    buyer: UserBasic
    seller: UserBasic
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Lighter response for list view"""
    id: int
    listing_id: Optional[int]
    listing: Optional[ListingBasic]
    buyer_id: int
    seller_id: int
    buyer: UserBasic
    seller: UserBasic
    created_at: datetime
    updated_at: datetime
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    
    class Config:
        from_attributes = True