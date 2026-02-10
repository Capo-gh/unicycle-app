from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.transaction import Transaction, TransactionStatus
from ..models.listing import Listing
from ..models.user import User
from ..schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, UserStats
from ..utils.dependencies import get_current_user_required

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a transaction when buyer expresses interest"""
    # Get the listing
    listing = db.query(Listing).filter(Listing.id == transaction_data.listing_id).first()

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    # Prevent self-transactions
    if listing.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot buy your own listing"
        )

    # Check if transaction already exists
    existing = db.query(Transaction).filter(
        Transaction.listing_id == transaction_data.listing_id,
        Transaction.buyer_id == current_user.id
    ).first()

    if existing:
        return existing  # Return existing transaction

    # Create transaction
    transaction = Transaction(
        listing_id=listing.id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        status=TransactionStatus.INTERESTED
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/my", response_model=List[TransactionResponse])
def get_my_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required),
    as_buyer: bool = True
):
    """Get transactions for current user (as buyer or seller)"""
    if as_buyer:
        transactions = db.query(Transaction).options(
            joinedload(Transaction.listing),
            joinedload(Transaction.seller)
        ).filter(Transaction.buyer_id == current_user.id).all()
    else:
        transactions = db.query(Transaction).options(
            joinedload(Transaction.listing),
            joinedload(Transaction.buyer)
        ).filter(Transaction.seller_id == current_user.id).all()

    return transactions


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    update_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Update transaction status"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Only buyer or seller can update
    if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this transaction"
        )

    # Update status
    transaction.status = update_data.status

    # Set completed_at if marking as completed
    if update_data.status == TransactionStatus.COMPLETED and not transaction.completed_at:
        transaction.completed_at = datetime.now()

        # Mark listing as sold
        listing = db.query(Listing).filter(Listing.id == transaction.listing_id).first()
        if listing:
            listing.is_sold = True

    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/stats", response_model=UserStats)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get transaction statistics for current user"""
    # Count completed transactions as buyer
    items_bought = db.query(func.count(Transaction.id)).filter(
        Transaction.buyer_id == current_user.id,
        Transaction.status == "completed"
    ).scalar()

    # Count completed transactions as seller
    items_sold = db.query(func.count(Transaction.id)).filter(
        Transaction.seller_id == current_user.id,
        Transaction.status == "completed"
    ).scalar()

    # Count active listings
    active_listings = db.query(func.count(Listing.id)).filter(
        Listing.seller_id == current_user.id,
        Listing.is_active == True,
        Listing.is_sold == False
    ).scalar()

    return UserStats(
        items_sold=items_sold or 0,
        items_bought=items_bought or 0,
        active_listings=active_listings or 0
    )


@router.get("/stats/{user_id}", response_model=UserStats)
def get_user_stats_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get transaction statistics for any user (public)"""
    # Count completed transactions as buyer
    items_bought = db.query(func.count(Transaction.id)).filter(
        Transaction.buyer_id == user_id,
        Transaction.status == TransactionStatus.COMPLETED
    ).scalar()

    # Count completed transactions as seller
    items_sold = db.query(func.count(Transaction.id)).filter(
        Transaction.seller_id == user_id,
        Transaction.status == TransactionStatus.COMPLETED
    ).scalar()

    # Count active listings
    active_listings = db.query(func.count(Listing.id)).filter(
        Listing.seller_id == user_id,
        Listing.is_active == True,
        Listing.is_sold == False
    ).scalar()

    return UserStats(
        items_sold=items_sold or 0,
        items_bought=items_bought or 0,
        active_listings=active_listings or 0
    )
