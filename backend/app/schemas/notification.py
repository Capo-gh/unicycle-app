from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    title: str
    message: str
    target_university: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    target_university: Optional[str]
    created_at: datetime
    is_read: bool = False

    class Config:
        from_attributes = True
