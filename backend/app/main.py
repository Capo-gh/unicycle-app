import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .utils.limiter import limiter
from sqlalchemy import text, inspect
from .database import engine, Base, SessionLocal
from .routers import auth, listings, requests, messages, upload, reviews, users, transactions, admin, notifications, announcements, payments, saved, ws, saved_searches
from .models.user import User
from .models.listing import Listing
from .models.notification import Notification, NotificationRead
from .models.announcement import Announcement, AnnouncementDismissal
from .models.report import Report
from .models.admin_log import AdminLog
from .models.system_setting import SystemSetting
from .models.saved_listing import SavedListing
from .models.saved_search import SavedSearch

# Create database tables (new tables are auto-created here)
Base.metadata.create_all(bind=engine)

# Migrate: add new columns to existing tables if they don't exist
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

    # Listing expiry & bump columns
    if "expires_at" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE"))
        conn.commit()
    if "last_bumped_at" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN last_bumped_at TIMESTAMP WITH TIME ZONE"))
        conn.commit()
    if "expiry_email_sent" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN expiry_email_sent BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "review_prompt_sent" not in listing_columns:
        conn.execute(text("ALTER TABLE listings ADD COLUMN review_prompt_sent BOOLEAN DEFAULT FALSE"))
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

    # Notification personal recipient column
    notification_columns = [col["name"] for col in inspector.get_columns("notifications")]
    if "recipient_user_id" not in notification_columns:
        conn.execute(text("ALTER TABLE notifications ADD COLUMN recipient_user_id INTEGER REFERENCES users(id)"))
        conn.commit()

    # User columns
    if "is_admin" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_suspended" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_super_admin" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_sponsor" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_sponsor BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "sponsored_category" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN sponsored_category VARCHAR"))
        conn.commit()
    if "avatar_url" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
        conn.commit()

    # Request university column
    request_columns = [col["name"] for col in inspector.get_columns("requests")]
    if "university" not in request_columns:
        conn.execute(text("ALTER TABLE requests ADD COLUMN university VARCHAR"))
        conn.commit()

    # Seed default system settings
    existing_setting = conn.execute(
        text("SELECT key FROM system_settings WHERE key = 'sponsored_pins_in_all'")
    ).fetchone()
    if not existing_setting:
        conn.execute(
            text("INSERT INTO system_settings (key, value) VALUES ('sponsored_pins_in_all', 'false')")
        )
        conn.commit()


# Seed super admin user
def seed_admin():
    from .config import settings
    admin_email = settings.super_admin_email or os.getenv("SUPER_ADMIN_EMAIL", "ibrahim.sabiku@mail.mcgill.ca")
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == admin_email).first()
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


# APScheduler: daily job to send expiry warning emails and deactivate expired listings
def run_expiry_job():
    from datetime import datetime, timedelta, timezone
    from .utils.email import send_listing_expiry_email

    now = datetime.now(timezone.utc)
    warning_threshold = now + timedelta(days=7)

    db = SessionLocal()
    try:
        # Deactivate truly expired listings
        expired = db.query(Listing).filter(
            Listing.is_active == True,
            Listing.expires_at != None,
            Listing.expires_at <= now
        ).all()
        for listing in expired:
            listing.is_active = False
        if expired:
            db.commit()
            print(f"[expiry] Deactivated {len(expired)} expired listing(s).")

        # Send warning emails for listings expiring within 7 days
        expiring_soon = db.query(Listing).filter(
            Listing.is_active == True,
            Listing.expires_at != None,
            Listing.expires_at > now,
            Listing.expires_at <= warning_threshold,
            Listing.expiry_email_sent == False
        ).all()
        for listing in expiring_soon:
            if listing.seller and listing.seller.email:
                days_left = max(1, (listing.expires_at - now).days)
                send_listing_expiry_email(
                    seller_email=listing.seller.email,
                    seller_name=listing.seller.name,
                    listing_title=listing.title,
                    listing_id=listing.id,
                    days_left=days_left,
                )
                listing.expiry_email_sent = True
        if expiring_soon:
            db.commit()
            print(f"[expiry] Sent warning emails for {len(expiring_soon)} listing(s).")
    except Exception as e:
        db.rollback()
        print(f"[expiry] Job error: {e}")
    finally:
        db.close()


# APScheduler: every-4-hour job to alert users about new listings matching saved searches
def run_saved_search_job():
    from datetime import datetime, timezone
    from sqlalchemy import and_, or_, ilike
    from .utils.email import send_saved_search_alert_email
    from .routers.notifications import send_user_notification
    from .config import settings

    now = datetime.now(timezone.utc)
    frontend_url = settings.frontend_url if hasattr(settings, "frontend_url") else os.getenv("FRONTEND_URL", "https://unicycle.app")

    db = SessionLocal()
    try:
        searches = db.query(SavedSearch).all()
        for search in searches:
            # Only look at listings created since last notification (or since search was created)
            since = search.last_notified_at or search.created_at

            query = db.query(Listing).filter(
                Listing.is_active == True,
                Listing.is_sold == False,
                Listing.created_at > since,
            )
            if search.query:
                term = f"%{search.query}%"
                query = query.filter(
                    or_(Listing.title.ilike(term), Listing.description.ilike(term))
                )
            if search.category:
                query = query.filter(Listing.category == search.category)
            if search.min_price is not None:
                query = query.filter(Listing.price >= search.min_price)
            if search.max_price is not None:
                query = query.filter(Listing.price <= search.max_price)
            if search.condition:
                query = query.filter(Listing.condition == search.condition)
            if search.university:
                query = query.join(User, Listing.seller_id == User.id).filter(User.university == search.university)

            matches = query.count()
            if matches > 0 and search.user and search.user.email:
                parts = []
                if search.query:
                    parts.append(f'"{search.query}"')
                if search.category:
                    parts.append(search.category)
                search_desc = ", ".join(parts) if parts else "your saved search"

                send_user_notification(
                    db, search.user_id,
                    title="New listings match your search",
                    message=f"{matches} new {'item' if matches == 1 else 'items'} matching {search_desc} just listed!"
                )
                send_saved_search_alert_email(
                    email=search.user.email,
                    name=search.user.name,
                    search_desc=search_desc,
                    match_count=matches,
                    frontend_url=frontend_url,
                )
                search.last_notified_at = now

        db.commit()
        print(f"[saved-search] Job ran, checked {len(searches)} saved search(es).")
    except Exception as e:
        db.rollback()
        print(f"[saved-search] Job error: {e}")
    finally:
        db.close()


app = FastAPI(title="UniCycle API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    clean_url = frontend_url.rstrip("/")
    if clean_url not in allowed_origins:
        allowed_origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
app.include_router(saved.router)
app.include_router(ws.router)
app.include_router(saved_searches.router)


@app.on_event("startup")
def start_scheduler():
    """Start APScheduler to run daily listing expiry jobs."""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        # Run daily at 06:00 UTC
        scheduler.add_job(run_expiry_job, "cron", hour=6, minute=0)
        scheduler.add_job(run_saved_search_job, "interval", hours=4)
        scheduler.start()
        print("[scheduler] Expiry job scheduled (daily at 06:00 UTC). Saved search job scheduled (every 4 hours).")
    except ImportError:
        print("[scheduler] apscheduler not installed — expiry job skipped.")
    except Exception as e:
        print(f"[scheduler] Failed to start: {e}")


@app.get("/")
def read_root():
    return {"message": "UniCycle API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
