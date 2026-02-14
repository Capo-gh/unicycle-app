from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    image_url: Optional[str] = None
    action_text: Optional[str] = None
    action_type: Optional[str] = None
    target_university: Optional[str] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    message: str
    image_url: Optional[str]
    action_text: Optional[str]
    action_type: Optional[str]
    is_active: bool
    target_university: Optional[str]
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True
