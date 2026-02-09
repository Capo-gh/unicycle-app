import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, listings, requests, messages, upload, reviews, users, transactions

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

@app.get("/")
def read_root():
    return {"message": "UniCycle API is running!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}