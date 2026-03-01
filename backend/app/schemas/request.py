from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime

# AUTHOR SCHEMAS
class ReplyAuthor(BaseModel):
    id: int
    name: str
    university: str
    
    class Config:
        from_attributes = True


class RequestAuthor(BaseModel):
    id: int
    name: str
    university: str
    
    class Config:
        from_attributes = True

# REPLY SCHEMAS
class ReplyBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)


class ReplyCreate(ReplyBase):
    parent_reply_id: Optional[int] = None  # For nested replies


class ReplyResponse(BaseModel):
    id: int
    text: str
    request_id: int
    author_id: int
    parent_reply_id: Optional[int]
    author: ReplyAuthor
    created_at: datetime
    child_replies: List['ReplyResponse'] = []  # Nested replies
    
    class Config:
        from_attributes = True

# REQUEST SCHEMAS
class RequestBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10, max_length=1000)
    category: str
    urgent: bool = False
    budget_min: Optional[float] = Field(None, ge=0)
    budget_max: Optional[float] = Field(None, ge=0)

    @model_validator(mode='after')
    def budget_min_le_max(self):
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min > self.budget_max:
                raise ValueError('budget_min must be less than or equal to budget_max')
        return self


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    urgent: Optional[bool] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None


class RequestResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    urgent: bool
    budget_min: Optional[float]
    budget_max: Optional[float]
    is_active: bool
    author_id: int
    author: RequestAuthor
    replies: List[ReplyResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RequestListResponse(BaseModel):
    """Lighter response for list view"""
    id: int
    title: str
    description: str
    category: str
    urgent: bool
    budget_min: Optional[float]
    budget_max: Optional[float]
    is_active: bool
    author_id: int
    author: RequestAuthor
    reply_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Enable forward references for nested ReplyResponse
ReplyResponse.model_rebuild()