from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc
from typing import List
from ..database import get_db
from ..models.message import Conversation, Message
from ..models.listing import Listing
from ..models.user import User
from ..schemas.message import (
    ConversationCreate, ConversationResponse, ConversationListResponse,
    MessageCreate, MessageResponse
)
from ..utils.dependencies import get_current_user_required
from .notifications import send_user_notification
from ..utils.email import send_message_email

router = APIRouter(prefix="/messages", tags=["Messages"])


# CONVERSATION ENDPOINTS
@router.get("/conversations", response_model=List[ConversationListResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get all conversations for the current user"""
    # Get conversations where user is buyer or seller, not archived
    conversations = db.query(Conversation).options(
        joinedload(Conversation.buyer),
        joinedload(Conversation.seller),
        joinedload(Conversation.listing),
        joinedload(Conversation.messages).joinedload(Message.sender)
    ).filter(
        or_(
            and_(Conversation.buyer_id == current_user.id, Conversation.archived_by_buyer == False),
            and_(Conversation.seller_id == current_user.id, Conversation.archived_by_seller == False)
        )
    ).order_by(desc(Conversation.updated_at)).all()
    
    # Build response with last message and unread count
    result = []
    for conv in conversations:
        last_message = conv.messages[-1] if conv.messages else None
        
        # Count unread messages (messages not from current user that are unread)
        unread_count = sum(
            1 for m in conv.messages 
            if m.sender_id != current_user.id and not m.is_read
        )
        
        result.append({
            "id": conv.id,
            "listing_id": conv.listing_id,
            "listing": conv.listing,
            "buyer_id": conv.buyer_id,
            "seller_id": conv.seller_id,
            "buyer": conv.buyer,
            "seller": conv.seller,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "last_message": last_message,
            "unread_count": unread_count
        })
    
    return result


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a new conversation (when contacting a seller)"""
    # Get the listing
    listing = db.query(Listing).filter(Listing.id == conv_data.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    # Can't message yourself
    if listing.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start a conversation with yourself"
        )
    
    # Check if conversation already exists
    existing = db.query(Conversation).filter(
        Conversation.listing_id == conv_data.listing_id,
        Conversation.buyer_id == current_user.id,
        Conversation.seller_id == listing.seller_id
    ).first()
    
    if existing:
        # Add message to existing conversation instead
        new_message = Message(
            text=conv_data.initial_message,
            conversation_id=existing.id,
            sender_id=current_user.id
        )
        db.add(new_message)
        existing.archived_by_buyer = False  # Unarchive if was archived
        existing.archived_by_seller = False
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new conversation
    conversation = Conversation(
        listing_id=conv_data.listing_id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id
    )
    db.add(conversation)
    db.flush()  # Get the ID
    
    # Add initial message
    initial_message = Message(
        text=conv_data.initial_message,
        conversation_id=conversation.id,
        sender_id=current_user.id
    )
    db.add(initial_message)
    db.commit()
    db.refresh(conversation)
    
    return conversation


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get a single conversation with all messages"""
    conversation = db.query(Conversation).options(
        joinedload(Conversation.buyer),
        joinedload(Conversation.seller),
        joinedload(Conversation.listing),
        joinedload(Conversation.messages).joinedload(Message.sender)
    ).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Check if user is participant
    if conversation.buyer_id != current_user.id and conversation.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this conversation"
        )
    
    # Mark messages as read
    for message in conversation.messages:
        if message.sender_id != current_user.id and not message.is_read:
            message.is_read = True
    db.commit()
    
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Archive a conversation (soft delete for the user)"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Archive for the current user
    if conversation.buyer_id == current_user.id:
        conversation.archived_by_buyer = True
    elif conversation.seller_id == current_user.id:
        conversation.archived_by_seller = True
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to archive this conversation"
        )
    
    db.commit()
    return None


# MESSAGE ENDPOINTS
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Send a message in a conversation"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Check if user is participant
    if conversation.buyer_id != current_user.id and conversation.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to send messages in this conversation"
        )
    
    # Create message
    message = Message(
        text=message_data.text,
        conversation_id=conversation_id,
        sender_id=current_user.id
    )
    db.add(message)

    # Update conversation timestamp and unarchive for both parties
    conversation.archived_by_buyer = False
    conversation.archived_by_seller = False

    # Commit message first so a notification failure can't block the send
    db.commit()
    db.refresh(message)

    # Notify the recipient (non-critical — separate commit)
    recipient_id = conversation.seller_id if current_user.id == conversation.buyer_id else conversation.buyer_id
    listing_title = conversation.listing.title if conversation.listing else "an item"
    try:
        send_user_notification(
            db, recipient_id,
            title=f"New message from {current_user.name}",
            message=f"{current_user.name} sent you a message about \"{listing_title}\""
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[notifications] Failed to send message notification: {e}")

    # Send email if the recipient has not yet replied in this conversation
    # (avoids spamming both sides of an active back-and-forth)
    try:
        recipient_has_replied = db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id == recipient_id
        ).first() is not None

        if not recipient_has_replied:
            recipient_user = db.query(User).filter(User.id == recipient_id).first()
            if recipient_user and recipient_user.email:
                send_message_email(
                    recipient_email=recipient_user.email,
                    recipient_name=recipient_user.name,
                    sender_name=current_user.name,
                    listing_title=listing_title,
                )
    except Exception as e:
        print(f"[email] Failed to send message email: {e}")

    return message


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get total unread message count for the user"""
    # Get all conversations where user is participant
    conversations = db.query(Conversation).filter(
        or_(
            and_(Conversation.buyer_id == current_user.id, Conversation.archived_by_buyer == False),
            and_(Conversation.seller_id == current_user.id, Conversation.archived_by_seller == False)
        )
    ).all()
    
    total_unread = 0
    for conv in conversations:
        unread = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()
        total_unread += unread
    
    return {"unread_count": total_unread}