import uuid
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import httpx
from .. import models, schemas, auth
from ..database import get_db
from ..config import settings
from ..services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Auto-login: create access token for the new user
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.User)
async def update_user_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile (full name and profile picture)"""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.profile_picture is not None:
        current_user.profile_picture = user_update.profile_picture

    db.commit()
    db.refresh(current_user)
    return current_user


# ── Password Reset ────────────────────────────────────────────────────────────

@router.post("/forgot-password", status_code=200)
def forgot_password(
    body: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Request a password reset link. Always returns 200 to avoid user enumeration."""
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if user:
        token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        reset_token = models.PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
        )
        db.add(reset_token)
        db.commit()
        send_password_reset_email(user.email, token)
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
def reset_password(
    body: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Reset password using a valid token."""
    reset_token = (
        db.query(models.PasswordResetToken)
        .filter(models.PasswordResetToken.token == body.token)
        .first()
    )
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    if reset_token.used:
        raise HTTPException(status_code=400, detail="Token already used")
    now = datetime.now(timezone.utc)
    expires = reset_token.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        raise HTTPException(status_code=400, detail="Token has expired")

    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.hashed_password = auth.get_password_hash(body.new_password)
    reset_token.used = True
    db.commit()
    return {"message": "Password updated successfully"}


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
def google_login():
    """Redirect user to Google OAuth consent screen."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    backend_callback = "http://localhost:8000/auth/google/callback"
    params = (
        f"client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={backend_callback}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Exchange Google auth code for user info, create/login user, return JWT."""
    backend_callback = "http://localhost:8000/auth/google/callback"

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": backend_callback,
                "grant_type": "authorization_code",
            },
        )
    if token_response.status_code != 200:
        logger.error(f"Google token exchange failed: {token_response.text}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_failed")

    token_data = token_response.json()
    access_token_google = token_data.get("access_token")

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token_google}"},
        )
    if userinfo_response.status_code != 200:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_failed")

    userinfo = userinfo_response.json()
    google_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name", "")

    if not email or not google_id:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=google_failed")

    # Find or create user
    user = db.query(models.User).filter(models.User.google_id == google_id).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            # Link existing account to Google
            user.google_id = google_id
        else:
            # Create new user
            username_base = email.split("@")[0]
            username = username_base
            suffix = 1
            while db.query(models.User).filter(models.User.username == username).first():
                username = f"{username_base}{suffix}"
                suffix += 1
            user = models.User(
                username=username,
                email=email,
                full_name=name,
                google_id=google_id,
                hashed_password=None,
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    # Issue JWT
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_token = auth.create_access_token(data={"sub": user.username}, expires_delta=expires)

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")
