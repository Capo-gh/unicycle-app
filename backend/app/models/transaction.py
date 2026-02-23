from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class TransactionStatus(str, enum.Enum):
    INTERESTED = "interested"  # Buyer expressed interest
    AGREED = "agreed"          # Buyer and seller agreed on terms
    COMPLETED = "completed"    # Transaction completed
    CANCELLED = "cancelled"    # Transaction cancelled
    DISPUTED = "disputed"      # Buyer disputed after seller confirmed handoff — pending admin review


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TransactionStatus, values_callable=lambda x: [e.value for e in x]), default=TransactionStatus.INTERESTED)

    # Payment (Secure Pay)
    payment_method = Column(String, default='cash')  # 'cash' or 'secure_pay'
    stripe_payment_intent_id = Column(String, nullable=True)
    payment_status = Column(String, nullable=True)  # 'held', 'captured', 'refunded', 'disputed'

    # Escrow confirmation
    seller_confirmed_at = Column(DateTime(timezone=True), nullable=True)  # Seller confirmed they handed over the item

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    listing = relationship("Listing", backref="transactions")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="purchases")
    seller = relationship("User", foreign_keys=[seller_id], backref="sales")
