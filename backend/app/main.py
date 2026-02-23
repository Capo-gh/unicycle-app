import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from .database import engine, Base, SessionLocal
from .routers import auth, listings, requests, messages, upload, reviews, users, transactions, admin, notifications, announcements, payments
from .models.user import User
from .models.notification import Notification, NotificationRead
from .models.announcement import Announcement, AnnouncementDismissal
from .models.report import Report
from .models.admin_log import AdminLog

# Create database tables
Base.metadata.create_all(bind=engine)

# Migrate: add new columns if they don't exist
with engine.connect() as conn:
    inspector = inspect(engine)
    existing_columns = [col["name"] for col in inspector.get_columns("users")]
    listing_columns = [col["name"] for col in inspector.get_columns("listings")]
    transaction_columns = [col["name"] for col in inspector.get_columns("transactions")]

    # Listing boost columns
    if "is_boosted" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN is_boosted BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "boosted_at" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN boosted_at TIMESTAMP WITH TIME ZONE"))
        conn.commit()
    if "boosted_until" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN boosted_until TIMESTAMP WITH TIME ZONE"))
        conn.commit()

    # Transaction payment columns
    if "payment_method" not in transaction_columns:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN payment_method VARCHAR DEFAULT 'cash'"))
        conn.commit()
    if "stripe_payment_intent_id" not in transaction_columns:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN stripe_payment_intent_id VARCHAR"))
        conn.commit()
    if "payment_status" not in transaction_columns:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN payment_status VARCHAR"))
        conn.commit()
    if "seller_confirmed_at" not in transaction_columns:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN seller_confirmed_at TIMESTAMP WITH TIME ZONE"))
        conn.commit()

    # Add DISPUTED value to transactionstatus enum if not present
    try:
        conn.execute(text("ALTER TYPE transactionstatus ADD VALUE IF NOT EXISTS 'disputed'"))
        conn.commit()
    except Exception:
        conn.rollback()

    if "is_admin" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_suspended" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_super_admin" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()

# Seed super admin user
def seed_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "ibrahim.sabiku@mail.mcgill.ca").first()
        if admin_user:
            changed = False
            if not admin_user.is_admin:
                admin_user.is_admin = True
                changed = True
            if not admin_user.is_super_admin:
                admin_user.is_super_admin = True
                changed = True
            if changed:
                db.commit()
    finally:
        db.close()

seed_admin()

app = FastAPI(title="UniCycle API", version="1.0.0")

# CORS middleware - allow frontend origins
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    clean_url = frontend_url.rstrip("/")
    if clean_url not in allowed_origins:
        allowed_origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(requests.router)
app.include_router(messages.router)
app.include_router(upload.router)
app.include_router(reviews.router)
app.include_router(transactions.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(announcements.router)
app.include_router(payments.router)

@app.get("/")
def read_root():
    return {"message": "UniCycle API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
