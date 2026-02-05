from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from ..database import get_db
from ..models.request import Request, Reply
from ..models.user import User
from ..schemas.request import (
    RequestCreate, RequestUpdate, RequestResponse, RequestListResponse,
    ReplyCreate, ReplyResponse
)
from ..utils.auth import verify_token

router = APIRouter(prefix="/requests", tags=["Requests"])


def get_current_user_from_token(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Helper to get current user from token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    email = verify_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


# ═══════════════════════════════════════════════════════════════════
# REQUEST ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Create a new ISO/WTB request"""
    db_request = Request(
        **request_data.dict(),
        author_id=current_user.id
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request


@router.get("/", response_model=List[RequestListResponse])
def get_requests(
    category: Optional[str] = None,
    urgent: Optional[bool] = None,
    search: Optional[str] = None,
    university: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all active requests with optional filters"""
    query = db.query(
        Request,
        func.count(Reply.id).label('reply_count')
    ).outerjoin(Reply).filter(Request.is_active == True).group_by(Request.id)
    
    # Filter by category
    if category and category != 'All':
        if category == 'Urgent':
            query = query.filter(Request.urgent == True)
        else:
            query = query.filter(Request.category == category)
    
    # Filter by urgent only
    if urgent is not None:
        query = query.filter(Request.urgent == urgent)
    
    # Filter by university (author's university)
    if university:
        query = query.join(User, Request.author_id == User.id).filter(User.university == university)
    
    # Search in title and description
    if search:
        query = query.filter(
            (Request.title.ilike(f"%{search}%")) | 
            (Request.description.ilike(f"%{search}%"))
        )
    
    results = query.order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
    
    # Transform results to include reply_count
    requests_list = []
    for request, reply_count in results:
        request_dict = {
            "id": request.id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "urgent": request.urgent,
            "budget_min": request.budget_min,
            "budget_max": request.budget_max,
            "author_id": request.author_id,
            "author": request.author,
            "is_active": request.is_active,
            "created_at": request.created_at,
            "reply_count": reply_count
        }
        requests_list.append(request_dict)
    
    return requests_list


@router.get("/my", response_model=List[RequestListResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get all requests created by the current user"""
    results = db.query(
        Request,
        func.count(Reply.id).label('reply_count')
    ).outerjoin(Reply).filter(
        Request.author_id == current_user.id,
        Request.is_active == True
    ).group_by(Request.id).order_by(Request.created_at.desc()).all()
    
    requests_list = []
    for request, reply_count in results:
        request_dict = {
            "id": request.id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "urgent": request.urgent,
            "budget_min": request.budget_min,
            "budget_max": request.budget_max,
            "author_id": request.author_id,
            "author": request.author,
            "is_active": request.is_active,
            "created_at": request.created_at,
            "reply_count": reply_count
        }
        requests_list.append(request_dict)
    
    return requests_list


@router.get("/{request_id}", response_model=RequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Get a single request with all replies"""
    db_request = db.query(Request).options(
        joinedload(Request.author),
        joinedload(Request.replies).joinedload(Reply.author)
    ).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    return db_request


@router.put("/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: int,
    request_update: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Update a request (only by owner)"""
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check ownership
    if db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this request"
        )
    
    # Update fields
    update_data = request_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_request, field, value)
    
    db.commit()
    db.refresh(db_request)
    
    return db_request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete a request (soft delete)"""
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check ownership
    if db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this request"
        )
    
    # Soft delete
    db_request.is_active = False
    db.commit()
    
    return None


# ═══════════════════════════════════════════════════════════════════
# REPLY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@router.post("/{request_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(
    request_id: int,
    reply_data: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Add a reply to a request"""
    # Check if request exists
    db_request = db.query(Request).filter(Request.id == request_id, Request.is_active == True).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    db_reply = Reply(
        text=reply_data.text,
        request_id=request_id,
        author_id=current_user.id
    )
    
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    
    return db_reply


@router.delete("/{request_id}/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    request_id: int,
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete a reply (only by reply author or request author)"""
    db_reply = db.query(Reply).filter(
        Reply.id == reply_id,
        Reply.request_id == request_id
    ).first()
    
    if not db_reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check if user is reply author or request author
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    if db_reply.author_id != current_user.id and db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reply"
        )
    
    db.delete(db_reply)
    db.commit()
    
    return None