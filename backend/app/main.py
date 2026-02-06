# import os
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from .database import engine, Base
# from .routers import auth, listings, requests, messages, upload

# # Create database tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="UniCycle API", version="1.0.0")

# # CORS middleware - allow frontend origins
# # In production, FRONTEND_URL env var should be set to your Vercel URL
# allowed_origins = [
#     "http://localhost:5173",  # Local development
#     "http://localhost:3000",  # Alternative local
# ]

# # Add production frontend URL if set
# frontend_url = os.getenv("FRONTEND_URL")
# if frontend_url:
#     allowed_origins.append(frontend_url)
#     # Also allow without trailing slash
#     allowed_origins.append(frontend_url.rstrip("/"))

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allowed_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Include routers
# app.include_router(auth.router)
# app.include_router(listings.router)
# app.include_router(requests.router)
# app.include_router(messages.router)
# app.include_router(upload.router)

# @app.get("/")
# def read_root():
#     return {"message": "UniCycle API is running!", "version": "1.0.0"}

# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}





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

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)
    allowed_origins.append(frontend_url.rstrip("/"))
    print(f"🔧 CORS: Added frontend URL: {frontend_url}")  # Debug log
else:
    print("⚠️ CORS: No FRONTEND_URL env var found!")  # Debug log

print(f"🌐 CORS: Allowed origins: {allowed_origins}")  # Debug log

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

