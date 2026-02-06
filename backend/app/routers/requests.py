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


def build_reply_tree(replies: List[Reply]) -> List[dict]:
    """Build nested reply tree from flat list"""
    reply_map = {}
    root_replies = []
    
    # First pass: create dict for each reply
    for reply in replies:
        reply_dict = {
            "id": reply.id,
            "text": reply.text,
            "request_id": reply.request_id,
            "author_id": reply.author_id,
            "parent_reply_id": reply.parent_reply_id,
            "author": reply.author,
            "created_at": reply.created_at,
            "child_replies": []
        }
        reply_map[reply.id] = reply_dict
    
    # Second pass: build tree
    for reply in replies:
        reply_dict = reply_map[reply.id]
        if reply.parent_reply_id is None:
            root_replies.append(reply_dict)
        else:
            parent = reply_map.get(reply.parent_reply_id)
            if parent:
                parent["child_replies"].append(reply_dict)
    
    return root_replies


# REQUEST ENDPOINTS
@router.post("/", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    request_data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Create a new request"""
    db_request = Request(
        **request_data.model_dump(),
        author_id=current_user.id
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Reload with author
    db_request = db.query(Request).options(
        joinedload(Request.author)
    ).filter(Request.id == db_request.id).first()
    
    return db_request


@router.get("/", response_model=List[RequestListResponse])
def get_requests(
    category: Optional[str] = None,
    urgent: Optional[bool] = None,
    search: Optional[str] = None,
    university: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all active requests with optional filters"""
    query = db.query(
        Request,
        func.count(Reply.id).label('reply_count')
    ).outerjoin(Reply).options(
        joinedload(Request.author)
    ).filter(Request.is_active == True).group_by(Request.id)
    
    if category and category != 'All':
        if category == 'Urgent':
            query = query.filter(Request.urgent == True)
        else:
            query = query.filter(Request.category == category)
    
    if urgent is not None:
        query = query.filter(Request.urgent == urgent)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Request.title.ilike(search_term)) | 
            (Request.description.ilike(search_term))
        )
    
    if university:
        query = query.join(User, Request.author_id == User.id).filter(User.university == university)
    
    results = query.order_by(Request.created_at.desc()).all()
    
    # Convert to response format
    response = []
    for request, reply_count in results:
        request_dict = {
            "id": request.id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "urgent": request.urgent,
            "budget_min": request.budget_min,
            "budget_max": request.budget_max,
            "is_active": request.is_active,
            "author_id": request.author_id,
            "author": request.author,
            "reply_count": reply_count,
            "created_at": request.created_at,
            "updated_at": request.updated_at
        }
        response.append(request_dict)
    
    return response


@router.get("/my", response_model=List[RequestListResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Get current user's requests"""
    query = db.query(
        Request,
        func.count(Reply.id).label('reply_count')
    ).outerjoin(Reply).options(
        joinedload(Request.author)
    ).filter(
        Request.author_id == current_user.id,
        Request.is_active == True
    ).group_by(Request.id)
    
    results = query.order_by(Request.created_at.desc()).all()
    
    response = []
    for request, reply_count in results:
        request_dict = {
            "id": request.id,
            "title": request.title,
            "description": request.description,
            "category": request.category,
            "urgent": request.urgent,
            "budget_min": request.budget_min,
            "budget_max": request.budget_max,
            "is_active": request.is_active,
            "author_id": request.author_id,
            "author": request.author,
            "reply_count": reply_count,
            "created_at": request.created_at,
            "updated_at": request.updated_at
        }
        response.append(request_dict)
    
    return response


@router.get("/{request_id}")
def get_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    """Get a single request with all replies (nested)"""
    db_request = db.query(Request).options(
        joinedload(Request.author),
        joinedload(Request.replies).joinedload(Reply.author)
    ).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Build nested reply tree
    nested_replies = build_reply_tree(db_request.replies)
    
    return {
        "id": db_request.id,
        "title": db_request.title,
        "description": db_request.description,
        "category": db_request.category,
        "urgent": db_request.urgent,
        "budget_min": db_request.budget_min,
        "budget_max": db_request.budget_max,
        "is_active": db_request.is_active,
        "author_id": db_request.author_id,
        "author": db_request.author,
        "replies": nested_replies,
        "created_at": db_request.created_at,
        "updated_at": db_request.updated_at
    }


@router.put("/{request_id}", response_model=RequestResponse)
def update_request(
    request_id: int,
    request_update: RequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Update a request (only author can update)"""
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this request"
        )
    
    update_data = request_update.model_dump(exclude_unset=True)
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
    """Delete a request (soft delete - only author can delete)"""
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this request"
        )
    
    db_request.is_active = False
    db.commit()
    
    return None


# REPLY ENDPOINTS
@router.post("/{request_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
def create_reply(
    request_id: int,
    reply_data: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Add a reply to a request (can be nested by providing parent_reply_id)"""
    # Check request exists
    db_request = db.query(Request).filter(Request.id == request_id).first()
    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # If replying to another reply, verify it exists and belongs to same request
    if reply_data.parent_reply_id:
        parent_reply = db.query(Reply).filter(
            Reply.id == reply_data.parent_reply_id,
            Reply.request_id == request_id
        ).first()
        if not parent_reply:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent reply not found"
            )
    
    # Create reply
    reply = Reply(
        text=reply_data.text,
        request_id=request_id,
        author_id=current_user.id,
        parent_reply_id=reply_data.parent_reply_id
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    
    # Reload with author
    reply = db.query(Reply).options(
        joinedload(Reply.author)
    ).filter(Reply.id == reply.id).first()
    
    return {
        "id": reply.id,
        "text": reply.text,
        "request_id": reply.request_id,
        "author_id": reply.author_id,
        "parent_reply_id": reply.parent_reply_id,
        "author": reply.author,
        "created_at": reply.created_at,
        "child_replies": []
    }


@router.delete("/{request_id}/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reply(
    request_id: int,
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token)
):
    """Delete a reply (reply author or request author can delete)"""
    reply = db.query(Reply).filter(
        Reply.id == reply_id,
        Reply.request_id == request_id
    ).first()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Get request to check if user is request author
    db_request = db.query(Request).filter(Request.id == request_id).first()
    
    # Allow delete if user is reply author or request author
    if reply.author_id != current_user.id and db_request.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reply"
        )
    
    db.delete(reply)
    db.commit()
    
    return None