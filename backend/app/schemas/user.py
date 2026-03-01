from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str = Field(..., max_length=254)
    name: str = Field(..., min_length=1, max_length=100)
    university: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    university: str
    is_verified: bool
    is_admin: bool = False
    is_super_admin: bool = False
    is_suspended: bool = False
    avg_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SetPassword(BaseModel):
    token: str
    password: str = Field(..., min_length=6, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse