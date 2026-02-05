from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ═══════════════════════════════════════════════════════════════════
# REPLY SCHEMAS
# ═══════════════════════════════════════════════════════════════════

class ReplyBase(BaseModel):
    text: str


class ReplyCreate(ReplyBase):
    pass


class ReplyAuthor(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


class ReplyResponse(ReplyBase):
    id: int
    request_id: int
    author_id: int
    author: ReplyAuthor
    created_at: datetime
    
    class Config:
        from_attributes = True

# REQUEST SCHEMAS

class RequestBase(BaseModel):
    title: str
    description: str
    category: str
    urgent: bool = False
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    urgent: Optional[bool] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None


class RequestAuthor(BaseModel):
    id: int
    name: str
    university: str
    
    class Config:
        from_attributes = True


class RequestResponse(RequestBase):
    id: int
    author_id: int
    author: RequestAuthor
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    replies: List[ReplyResponse] = []
    
    class Config:
        from_attributes = True


class RequestListResponse(RequestBase):
    """Lighter response for list view (without full replies)"""
    id: int
    author_id: int
    author: RequestAuthor
    is_active: bool
    created_at: datetime
    reply_count: int = 0
    
    class Config:
        from_attributes = True