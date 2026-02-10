from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, UserResponse, Token, SetPassword
from ..utils.auth import get_password_hash, verify_password, create_access_token, verify_token
from ..utils.email import send_verification_email, generate_verification_token, is_token_expired

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and send verification email with password setup link"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate university email domain
    email_domain = user_data.email.split('@')[1] if '@' in user_data.email else ''
    valid_domains = {
        'McGill University': 'mail.mcgill.ca',
        'Concordia University': 'concordia.ca',
        'Université de Montréal': 'umontreal.ca',
        'UQAM': 'uqam.ca',
        'HEC Montréal': 'hec.ca'
    }

    expected_domain = valid_domains.get(user_data.university)
    if expected_domain and email_domain != expected_domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email must end with @{expected_domain} for {user_data.university}"
        )

    # Generate verification token
    verification_token = generate_verification_token()

    # Create user without password
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        university=user_data.university,
        hashed_password=None,  # Password will be set after email verification
        is_verified=False,
        verification_token=verification_token,
        token_created_at=datetime.now()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    try:
        send_verification_email(new_user.email, new_user.name, verification_token)
    except Exception as e:
        # Log error but don't block signup
        print(f"Failed to send verification email: {str(e)}")

    return {
        "message": "Account created! Check your email to verify and set your password.",
        "email": new_user.email
    }


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password"""
    # Find user
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check password
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please check your email to verify your account and set your password."
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link."
        )

    # Create token
    token = create_access_token({"sub": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get current logged in user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email with token"""
    # Find user with this verification token
    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )

    # Check if already verified
    if user.is_verified:
        # Check if password is set
        if user.hashed_password:
            return {"message": "Email already verified. You can login now."}
        else:
            return {
                "message": "Email already verified. Please set your password.",
                "needs_password": True,
                "token": user.verification_token  # Keep token for password setting
            }

    # Check if token expired
    if is_token_expired(user.token_created_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token expired. Please request a new one."
        )

    # Verify user (but keep token for password setting)
    user.is_verified = True

    db.commit()

    return {
        "message": "Email verified! Now set your password to complete signup.",
        "needs_password": True,
        "token": token
    }


@router.post("/set-password")
def set_password(data: SetPassword, db: Session = Depends(get_db)):
    """Set password for verified user using verification token"""
    # Find user with this verification token
    user = db.query(User).filter(User.verification_token == data.token).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    # Check if token expired
    if is_token_expired(user.token_created_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expired. Please request a new verification email."
        )

    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify your email first"
        )

    # Hash and set password
    user.hashed_password = get_password_hash(data.password)
    user.verification_token = None  # Clear token after password is set
    user.token_created_at = None

    db.commit()
    db.refresh(user)

    # Create access token for immediate login
    token = create_access_token({"sub": user.email})

    return {
        "message": "Password set successfully! You can now login.",
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/resend-verification")
def resend_verification(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Resend verification email to current user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already verified
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Generate new token
    verification_token = generate_verification_token()
    user.verification_token = verification_token
    user.token_created_at = datetime.now()

    db.commit()

    # Send email
    try:
        send_verification_email(user.email, user.name, verification_token)
        return {"message": "Verification email sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )