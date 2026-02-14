import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from .database import engine, Base, SessionLocal
from .routers import auth, listings, requests, messages, upload, reviews, users, transactions, admin
from .models.user import User

# Create database tables
Base.metadata.create_all(bind=engine)

# Migrate: add new columns if they don't exist
with engine.connect() as conn:
    inspector = inspect(engine)
    existing_columns = [col["name"] for col in inspector.get_columns("users")]
    if "is_admin" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
        conn.commit()
    if "is_suspended" not in existing_columns:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE"))
        conn.commit()

# Seed admin user
def seed_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "ibrahim.sabiku@mail.mcgill.ca").first()
        if admin_user and not admin_user.is_admin:
            admin_user.is_admin = True
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

@app.get("/")
def read_root():
    return {"message": "UniCycle API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
