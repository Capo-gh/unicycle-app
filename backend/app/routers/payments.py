from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from ..database import get_db
from ..models.listing import Listing
from ..models.transaction import Transaction, TransactionStatus
from ..models.user import User
from ..utils.dependencies import get_current_user_required
from ..config import settings

router = APIRouter(prefix="/payments", tags=["Payments"])


def get_stripe():
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Payment service not configured")
    import stripe
    stripe.api_key = settings.stripe_secret_key
    return stripe


# ─── Schemas ───────────────────────────────────────────────────────────────────

class BoostRequest(BaseModel):
    listing_id: int

class BoostActivateRequest(BaseModel):
    listing_id: int
    session_id: str

class SecurePayRequest(BaseModel):
    listing_id: int

class SecurePayActivateRequest(BaseModel):
    listing_id: int
    session_id: str


# ─── Boost ─────────────────────────────────────────────────────────────────────

@router.post("/boost/create-session")
def create_boost_session(
    data: BoostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a Stripe Checkout Session to boost a listing for $2 CAD / 48 hours"""
    stripe = get_stripe()

    listing = db.query(Listing).filter(
        Listing.id == data.listing_id,
        Listing.seller_id == current_user.id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    frontend_url = (settings.frontend_url or "http://localhost:5173").rstrip("/")

    session = stripe.checkout.sessions.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "cad",
                "product_data": {
                    "name": f"Boost: {listing.title}",
                    "description": "Your listing appears at the top of Browse for 48 hours",
                },
                "unit_amount": 200,  # $2.00 CAD
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"{frontend_url}?boost_success=1&listing_id={data.listing_id}&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend_url}?boost_cancel=1",
        metadata={"listing_id": str(data.listing_id), "user_id": str(current_user.id)},
    )

    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/boost/activate")
def activate_boost(
    data: BoostActivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Verify boost payment and activate listing boost for 48 hours"""
    stripe = get_stripe()

    listing = db.query(Listing).filter(
        Listing.id == data.listing_id,
        Listing.seller_id == current_user.id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        session = stripe.checkout.sessions.retrieve(data.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session")

    if session.payment_status != "paid":
        raise HTTPException(status_code=402, detail="Payment not completed")

    if session.metadata.get("listing_id") != str(data.listing_id):
        raise HTTPException(status_code=403, detail="Session mismatch")

    now = datetime.now(timezone.utc)
    listing.is_boosted = True
    listing.boosted_at = now
    listing.boosted_until = now + timedelta(hours=48)
    db.commit()

    return {"success": True, "boosted_until": listing.boosted_until.isoformat()}


# ─── Secure Pay ────────────────────────────────────────────────────────────────

@router.post("/secure-pay/create-session")
def create_secure_pay_session(
    data: SecurePayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Create a Stripe Checkout Session for Secure Pay (escrow — manual capture)"""
    stripe = get_stripe()

    listing = db.query(Listing).filter(
        Listing.id == data.listing_id,
        Listing.is_sold == False
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot buy your own listing")

    fee = listing.price * 0.07
    total = listing.price + fee
    amount_cents = int(round(total * 100))

    frontend_url = (settings.frontend_url or "http://localhost:5173").rstrip("/")

    session = stripe.checkout.sessions.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "cad",
                "product_data": {
                    "name": listing.title,
                    "description": f"Secure-Pay escrow (includes 7% service fee of ${fee:.2f})",
                },
                "unit_amount": amount_cents,
            },
            "quantity": 1,
        }],
        mode="payment",
        payment_intent_data={"capture_method": "manual"},
        success_url=f"{frontend_url}?secure_pay_success=1&listing_id={data.listing_id}&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend_url}?secure_pay_cancel=1",
        metadata={
            "listing_id": str(data.listing_id),
            "buyer_id": str(current_user.id),
            "seller_id": str(listing.seller_id),
        },
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "amount": round(total, 2),
        "fee": round(fee, 2),
    }


@router.post("/secure-pay/activate")
def activate_secure_pay(
    data: SecurePayActivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Verify Secure Pay authorization and create escrow transaction"""
    stripe = get_stripe()

    try:
        session = stripe.checkout.sessions.retrieve(
            data.session_id, expand=["payment_intent"]
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session")

    payment_intent = session.payment_intent
    if not payment_intent or payment_intent.status != "requires_capture":
        raise HTTPException(status_code=402, detail="Payment not authorized")

    if session.metadata.get("buyer_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Session mismatch")

    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Avoid duplicate transactions
    existing = db.query(Transaction).filter(
        Transaction.listing_id == data.listing_id,
        Transaction.buyer_id == current_user.id,
        Transaction.payment_status == "held"
    ).first()
    if existing:
        return {"transaction_id": existing.id, "already_exists": True}

    transaction = Transaction(
        listing_id=data.listing_id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        status=TransactionStatus.INTERESTED,
        payment_method="secure_pay",
        stripe_payment_intent_id=payment_intent.id,
        payment_status="held",
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {"transaction_id": transaction.id, "success": True}


@router.get("/secure-pay/listing/{listing_id}")
def get_listing_secure_pay(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Get the active Secure-Pay transaction for a listing (for buyer or seller)"""
    transaction = db.query(Transaction).filter(
        Transaction.listing_id == listing_id,
        Transaction.payment_method == "secure_pay",
        Transaction.payment_status.in_(["held", "disputed"])
    ).filter(
        (Transaction.buyer_id == current_user.id) | (Transaction.seller_id == current_user.id)
    ).first()

    if not transaction:
        return None

    return {
        "id": transaction.id,
        "payment_status": transaction.payment_status,
        "status": transaction.status,
        "seller_confirmed_at": transaction.seller_confirmed_at.isoformat() if transaction.seller_confirmed_at else None,
        "is_buyer": transaction.buyer_id == current_user.id,
        "is_seller": transaction.seller_id == current_user.id,
    }


@router.post("/secure-pay/{transaction_id}/confirm-handoff")
def confirm_handoff(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Seller confirms they physically handed the item to the buyer"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.seller_id == current_user.id,
        Transaction.payment_method == "secure_pay",
        Transaction.payment_status == "held"
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.seller_confirmed_at:
        return {"success": True, "already_confirmed": True}

    transaction.seller_confirmed_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True}


@router.post("/secure-pay/{transaction_id}/confirm-receipt")
def confirm_receipt(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Buyer confirms item received — captures payment and completes transaction"""
    stripe = get_stripe()

    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.buyer_id == current_user.id,
        Transaction.payment_method == "secure_pay",
        Transaction.payment_status == "held"
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    try:
        stripe.payment_intents.capture(transaction.stripe_payment_intent_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment capture failed: {str(e)}")

    now = datetime.now(timezone.utc)
    transaction.payment_status = "captured"
    transaction.status = TransactionStatus.COMPLETED
    transaction.completed_at = now
    db.commit()

    return {"success": True, "transaction_id": transaction.id}


@router.post("/secure-pay/{transaction_id}/dispute")
def dispute_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Buyer disputes transaction.
    - If seller already confirmed handoff: funds are HELD for admin review (not auto-refunded).
    - If seller has NOT confirmed: payment intent is cancelled and buyer gets a full refund.
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.buyer_id == current_user.id,
        Transaction.payment_method == "secure_pay",
        Transaction.payment_status == "held"
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.seller_confirmed_at:
        # Seller confirmed handoff — don't auto-refund, escalate to admin
        transaction.payment_status = "disputed"
        transaction.status = TransactionStatus.DISPUTED
        db.commit()
        return {
            "success": True,
            "admin_review": True,
            "message": "Dispute submitted. An admin will review within 24 hours. Funds are held until resolved."
        }
    else:
        # Seller hasn't confirmed handoff — safe to refund (meeting likely never happened)
        stripe = get_stripe()
        try:
            stripe.payment_intents.cancel(transaction.stripe_payment_intent_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cancellation failed: {str(e)}")

        transaction.payment_status = "refunded"
        transaction.status = TransactionStatus.CANCELLED
        db.commit()
        return {"success": True, "admin_review": False, "refunded": True, "transaction_id": transaction.id}
