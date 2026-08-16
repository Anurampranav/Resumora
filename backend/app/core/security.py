"""Auth boundary for the API.

Two paths, chosen automatically based on config:

  - CLERK_JWKS_URL set   -> verify real Clerk-issued JWTs against Clerk's
    JWKS endpoint (RS256), then JIT-provision a local `users` row keyed by
    `external_auth_id` = the Clerk user id, so the rest of the app keeps
    working with our own UUIDs everywhere (resumes.user_id etc.) without
    caring which auth provider issued the request.
  - CLERK_JWKS_URL empty -> local HS256 JWT issuance/verification, so the
    app is still fully runnable without a Clerk project.

Every call site uses `get_current_user`, so this is the only place that
knows which provider is active.
"""
import time
from datetime import datetime, timedelta, timezone

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"


def create_access_token(user_id: str, email: str, expires_minutes: int = 60 * 24 * 7) -> str:
    """Local token issuance — stand-in for Clerk session tokens during local dev."""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_local_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


# --- Clerk JWKS verification -------------------------------------------------
# Simple in-process cache: JWKS keys rotate rarely, so refetching on every
# request would be wasteful. Cached for 1 hour, or immediately re-fetched
# once if a token's `kid` isn't found (covers real key rotation).
_jwks_cache: dict = {"keys": None, "fetched_at": 0.0}
_JWKS_TTL_SECONDS = 3600


def _get_jwks() -> list[dict]:
    now = time.time()
    if _jwks_cache["keys"] is None or (now - _jwks_cache["fetched_at"]) > _JWKS_TTL_SECONDS:
        resp = requests.get(settings.clerk_jwks_url, timeout=5)
        resp.raise_for_status()
        _jwks_cache["keys"] = resp.json()["keys"]
        _jwks_cache["fetched_at"] = now
    return _jwks_cache["keys"]


def verify_clerk_token(token: str, force_refresh: bool = False) -> dict:
    """Verify a Clerk-issued session JWT (RS256) against Clerk's JWKS."""
    if force_refresh:
        _jwks_cache["keys"] = None

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Malformed token") from exc

    kid = unverified_header.get("kid")
    keys = _get_jwks()
    matching = next((k for k in keys if k.get("kid") == kid), None)

    if matching is None and not force_refresh:
        # Key not found — could be a genuine rotation since our cache was
        # populated. Refetch once before giving up.
        return verify_clerk_token(token, force_refresh=True)
    if matching is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No matching JWKS key for token")

    try:
        public_key = jwk.construct(matching, algorithm="RS256")
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk doesn't set a fixed audience by default
        )
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}") from exc

    return payload


def _fetch_clerk_user(clerk_user_id: str) -> dict:
    """One-time lookup via Clerk's Backend API, used only when JIT-provisioning
    a brand-new local user — the JWT itself usually doesn't carry email unless
    a custom claim was added in the Clerk dashboard's JWT template."""
    resp = requests.get(
        f"https://api.clerk.com/v1/users/{clerk_user_id}",
        headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
        timeout=5,
    )
    resp.raise_for_status()
    data = resp.json()
    email = None
    for addr in data.get("email_addresses", []):
        if addr.get("id") == data.get("primary_email_address_id"):
            email = addr.get("email_address")
            break
    if not email and data.get("email_addresses"):
        email = data["email_addresses"][0]["email_address"]

    full_name = " ".join(filter(None, [data.get("first_name"), data.get("last_name")])).strip()
    return {
        "email": email or f"{clerk_user_id}@unknown.clerk",
        "full_name": full_name or (email.split("@")[0] if email else clerk_user_id),
        "avatar_url": data.get("image_url"),
    }


def _get_or_create_local_user(db: Session, clerk_user_id: str, claims: dict) -> "User":
    from app.models.models import User

    user = db.query(User).filter(User.external_auth_id == clerk_user_id).first()
    if user:
        return user

    # First time we've seen this Clerk user — provision a local row.
    # Prefer an email claim if the JWT template includes one; otherwise
    # fall back to the Backend API.
    email = claims.get("email")
    full_name = claims.get("name")
    avatar_url = claims.get("image_url") or claims.get("picture")

    if not email:
        try:
            fetched = _fetch_clerk_user(clerk_user_id)
            email = fetched["email"]
            full_name = full_name or fetched["full_name"]
            avatar_url = avatar_url or fetched["avatar_url"]
        except requests.RequestException as exc:
            raise HTTPException(
                status.HTTP_502_BAD_GATEWAY,
                f"Could not fetch user profile from Clerk: {exc}",
            ) from exc

    user = User(
        external_auth_id=clerk_user_id,
        email=email,
        full_name=full_name or email.split("@")[0],
        avatar_url=avatar_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials

    if settings.clerk_jwks_url:
        payload = verify_clerk_token(token)
        clerk_user_id = payload["sub"]
        user = _get_or_create_local_user(db, clerk_user_id, payload)
        return {"id": str(user.id), "email": user.email}

    payload = decode_local_token(token)
    return {"id": payload["sub"], "email": payload.get("email")}
