import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, listings, requests, messages, upload

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="UniCycle API", version="1.0.0")

# CORS middleware - allow frontend origins
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Add production frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    # Remove trailing slash and add to origins (avoid duplicates)
    clean_url = frontend_url.rstrip("/")
    if clean_url not in allowed_origins:
        allowed_origins.append(clean_url)
    print(f"🔧 CORS: Added frontend URL: {clean_url}")
else:
    print("⚠️ CORS: No FRONTEND_URL env var found!")

print(f"🌐 CORS: Allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(requests.router)
app.include_router(messages.router)
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "UniCycle API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "allowed_origins": allowed_origins}

@app.delete("/admin/reset-database")
def reset_database():
    """⚠️ WARNING: Deletes ALL data! Remove this endpoint in production!"""
    from .database import SessionLocal
    from .models.user import User
    from .models.listing import Listing
    from .models.request import Request
    from .models.message import Message, Conversation
    
    db = SessionLocal()
    try:
        # Delete all records
        db.query(Message).delete()
        db.query(Conversation).delete()
        db.query(Request).delete()
        db.query(Listing).delete()
        db.query(User).delete()
        db.commit()
        return {"message": "Database reset successful!"}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()