"""Local dev auth so the app runs without a Clerk project.

Password hashing uses stdlib hashlib.pbkdf2_hmac — deliberately no extra
dependency for a dev-only path. When Clerk is wired in (see
core/security.py), this whole router becomes unnecessary: Clerk handles
signup/login/OAuth on the frontend and just hands the backend a JWT.
"""
import hashlib
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.core.security import create_access_token
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import LoginIn, SignupIn, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _reject_if_clerk_active():
    """get_current_user always verifies against Clerk once CLERK_JWKS_URL is
    set (see core/security.py) — a token issued here would look valid at
    signup but fail on every subsequent authenticated request. Rather than
    hand out a token that's silently useless, fail loudly and say why."""
    if settings.clerk_jwks_url:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Local email/password auth is disabled — this backend is configured "
            "for Clerk (CLERK_JWKS_URL is set). Sign in through the frontend's "
            "Clerk-powered /sign-in page instead.",
        )

# Dev-only in-memory password store — a real deployment behind Clerk never
# stores passwords in this service at all.
_PASSWORD_STORE: dict[str, tuple[bytes, bytes]] = {}  # email -> (salt, hash)


def _hash_password(password: str, salt: bytes | None = None) -> tuple[bytes, bytes]:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return salt, digest


@router.post("/signup", response_model=TokenOut)
@limiter.limit("5/minute")
def signup(request: Request, payload: SignupIn, db: Session = Depends(get_db)):
    _reject_if_clerk_active()
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        id=uuid.uuid4(),
        external_auth_id=f"local:{payload.email}",
        email=payload.email,
        full_name=payload.full_name,
        is_premium=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _PASSWORD_STORE[payload.email] = _hash_password(payload.password)

    token = create_access_token(str(user.id), user.email)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginIn, db: Session = Depends(get_db)):
    _reject_if_clerk_active()
    stored = _PASSWORD_STORE.get(payload.email)
    if not stored:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    salt, expected_hash = stored
    _, candidate_hash = _hash_password(payload.password, salt)
    if candidate_hash != expected_hash:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    token = create_access_token(str(user.id), user.email)
    return TokenOut(access_token=token)
