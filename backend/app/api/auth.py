"""Authentication API router for Cortex Quest"""
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, Cookie, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.config import get_settings
from app.models import Account, AccountType, AccountStatus, PlayerProfile, SessionModel
from app.schemas.auth import (
    GuestRegisterRequest,
    RegisterRequest,
    LoginRequest,
    ConvertRequest,
    ProfileUpdateRequest,
    AccountResponse,
    ProfileResponse,
    AuthResponse,
    MeResponse,
)
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_refresh_token,
    hash_refresh_token,
    create_session,
    revoke_session,
    rotate_session,
    get_active_session,
    validate_account_active,
    get_account_by_username,
    get_account_by_id,
    InvalidCredentialsError,
    TokenError,
    SessionError,
)

router = APIRouter(prefix="/auth", tags=["authentication"])

logger = logging.getLogger(__name__)

# Security scheme for Bearer token (optional, for API testing)
bearer_scheme = HTTPBearer(auto_error=False)

# Avatar allowlist (matching frontend)
ALLOWED_AVATARS = ["🦊", "🐼", "🦉", "🐙", "🦄", "🐯"]


def _generate_player_id() -> str:
    """Generate a unique player ID (CQ + 8 alphanumeric chars)."""
    # CQ + 8 random alphanumeric = 10 chars total
    return "CQ" + secrets.token_urlsafe(8).replace("-", "").replace("_", "")[:8].upper()


def _get_cookie_settings():
    """Get cookie settings based on environment."""
    settings = get_settings()
    is_production = settings.environment == "production"
    return {
        "httponly": True,
        "secure": is_production,  # False for local HTTP, True for HTTPS
        "samesite": "lax",
        "path": "/",
    }


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set authentication cookies on the response."""
    cookie_settings = _get_cookie_settings()
    # Access token cookie (short-lived)
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=15 * 60,  # 15 minutes
        **cookie_settings,
    )
    # Refresh token cookie (long-lived)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 days
        **cookie_settings,
    )


def _clear_auth_cookies(response: Response):
    """Clear authentication cookies."""
    cookie_settings = _get_cookie_settings()
    response.delete_cookie(key="access_token", **cookie_settings)
    response.delete_cookie(key="refresh_token", **cookie_settings)


async def _get_current_account(
    request: Request,
    response: Response,
    access_token_cookie: Optional[str] = Cookie(None, alias="access_token"),
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Account:
    """
    Get the current authenticated account from access token.
    Supports both cookie and Authorization header.
    """
    # Prefer cookie, fallback to Authorization header
    access_token = access_token_cookie
    if not access_token and authorization:
        access_token = authorization.credentials
    
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = decode_token(access_token, expected_type="access")
    except TokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    account_id = payload.get("account_id")
    if not account_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    account = get_account_by_id(db, account_id)
    try:
        validate_account_active(account)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="Account not active")
    
    return account


@router.post("/guest", response_model=AuthResponse, status_code=201)
async def register_guest(
    request: GuestRegisterRequest,
    response: Response,
    req: Request,
    db: Session = Depends(get_db),
):
    """
    Create a guest account and player profile.
    """
    try:
        # Create guest account
        account = Account(
            username=None,
            password_hash=None,
            account_type=AccountType.GUEST,
            status=AccountStatus.ACTIVE,
            created_at=datetime.now(timezone.utc),
        )
        db.add(account)
        db.flush()  # Get account ID
        
        # Create player profile
        player_id = _generate_player_id()
        # Ensure uniqueness (retry if collision)
        while db.query(PlayerProfile).filter(PlayerProfile.player_id == player_id).first():
            player_id = _generate_player_id()
        
        profile = PlayerProfile(
            account_id=account.id,
            player_id=player_id,
            display_name="Guest",
            avatar=request.avatar or "🦊",
            xp=0,
            coins=0,
            diamonds=0,
            stars=0,
            streak=0,
        )
        db.add(profile)
        db.flush()
        
        # Create session
        user_agent = req.headers.get("user-agent")
        # Get client IP (handle proxy headers)
        ip_address = req.client.host if req.client else None
        forwarded_for = req.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        
        refresh_token, session = create_session(
            db=db,
            account_id=account.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        
        # Create tokens
        access_token = create_access_token(subject=str(account.id), account_id=account.id)
        # refresh_token already returned from create_session
        
        # Commit transaction
        db.commit()
        
        # Set cookies
        _set_auth_cookies(response, access_token, refresh_token)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=None,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            account=account_resp,
            profile=profile_resp,
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create guest account")


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register_permanent(
    request: RegisterRequest,
    response: Response,
    req: Request,
    db: Session = Depends(get_db),
):
    """
    Create a permanent account with username and password.
    """
    try:
        # Check if username already exists
        existing = get_account_by_username(db, request.username)
        if existing:
            raise HTTPException(status_code=409, detail="Username already taken")
        
        # Hash password
        password_hash = hash_password(request.password)
        
        # Create permanent account
        account = Account(
            username=request.username.lower(),
            password_hash=password_hash,
            account_type=AccountType.PERMANENT,
            status=AccountStatus.ACTIVE,
            created_at=datetime.now(timezone.utc),
        )
        db.add(account)
        db.flush()
        
        # Create player profile
        player_id = _generate_player_id()
        while db.query(PlayerProfile).filter(PlayerProfile.player_id == player_id).first():
            player_id = _generate_player_id()
        
        profile = PlayerProfile(
            account_id=account.id,
            player_id=player_id,
            display_name=request.display_name,
            avatar=request.avatar,
            xp=0,
            coins=0,
            diamonds=0,
            stars=0,
            streak=0,
        )
        db.add(profile)
        db.flush()
        
        # Create session
        user_agent = req.headers.get("user-agent")
        ip_address = req.client.host if req.client else None
        forwarded_for = req.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        
        refresh_token, session = create_session(
            db=db,
            account_id=account.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        
        # Create tokens
        access_token = create_access_token(subject=str(account.id), account_id=account.id)
        
        # Commit transaction
        db.commit()
        
        # Set cookies
        _set_auth_cookies(response, access_token, refresh_token)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=account.username,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            account=account_resp,
            profile=profile_resp,
        )
        
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username already taken")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create account")


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    response: Response,
    req: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate a permanent account with username/Player ID and password.
    """
    try:
        # Find account by username OR player_id (for converted accounts)
        account = get_account_by_username(db, request.username)
        
        # If not found by username, try looking up by player_id
        if not account:
            # Check if the input looks like a Player ID (CQ + 8 chars)
            if request.username.upper().startswith("CQ") and len(request.username) == 10:
                from app.models import PlayerProfile
                profile = db.query(PlayerProfile).filter(PlayerProfile.player_id == request.username.upper()).first()
                if profile:
                    account = get_account_by_id(db, profile.account_id)
        
        if not account:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify account is permanent and active
        if account.account_type != AccountType.PERMANENT:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        validate_account_active(account)
        
        # Verify password
        if not account.password_hash or not verify_password(request.password, account.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create session
        user_agent = req.headers.get("user-agent")
        ip_address = req.client.host if req.client else None
        forwarded_for = req.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        
        refresh_token, session = create_session(
            db=db,
            account_id=account.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        
        # Create tokens
        access_token = create_access_token(subject=str(account.id), account_id=account.id)
        
        # Commit transaction
        db.commit()
        
        # Set cookies
        _set_auth_cookies(response, access_token, refresh_token)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=account.username,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile = account.profile
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            account=account_resp,
            profile=profile_resp,
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/convert", response_model=AuthResponse)
async def convert_guest_to_permanent(
    request: ConvertRequest,
    response: Response,
    req: Request,
    db: Session = Depends(get_db),
    account: Account = Depends(_get_current_account),
):
    """
    Convert the authenticated guest account to a permanent account.
    
    The Player ID remains unchanged. The account is updated with a password hash.
    The username is set to the Player ID for login purposes.
    """
    # Verify this is a guest account
    if account.account_type != AccountType.GUEST:
        raise HTTPException(status_code=400, detail="Account is already permanent")
    
    # Use Player ID as username for login
    profile = account.profile
    if not profile:
        raise HTTPException(status_code=500, detail="Player profile not found")
    
    player_id = profile.player_id
    
    # Check if Player ID is already taken as a username (should not happen, but safety)
    existing = get_account_by_username(db, player_id)
    if existing and existing.id != account.id:
        raise HTTPException(status_code=409, detail="Player ID conflict, please contact support")
    
    try:
        # Hash password
        password_hash = hash_password(request.password)
        
        # Update account to permanent
        account.username = player_id
        account.password_hash = password_hash
        account.account_type = AccountType.PERMANENT
        
        # Create new session for the permanent account
        user_agent = req.headers.get("user-agent")
        ip_address = req.client.host if req.client else None
        forwarded_for = req.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        
        refresh_token, session = create_session(
            db=db,
            account_id=account.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        
        # Create new access token
        access_token = create_access_token(subject=str(account.id), account_id=account.id)
        
        # Commit transaction
        db.commit()
        
        # Set cookies
        _set_auth_cookies(response, access_token, refresh_token)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=account.username,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            account=account_resp,
            profile=profile_resp,
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to convert account")


@router.post("/refresh", response_model=AuthResponse)
async def refresh_access_token(
    response: Response,
    req: Request,
    refresh_token_cookie: Optional[str] = Cookie(None, alias="refresh_token"),
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token cookie.
    
    Implements refresh token rotation: the old refresh token is revoked
    and a new one is issued.
    """
    if not refresh_token_cookie:
        raise HTTPException(status_code=401, detail="Refresh token not provided")
    
    # Hash the refresh token to look up the session
    refresh_token_hash = hash_refresh_token(refresh_token_cookie)
    
    # Get active session
    session = get_active_session(db, refresh_token_hash)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    # Verify account is still active
    account = get_account_by_id(db, session.account_id)
    try:
        validate_account_active(account)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="Account not active")
    
    # Get client info for new session
    user_agent = req.headers.get("user-agent")
    ip_address = req.client.host if req.client else None
    forwarded_for = req.headers.get("x-forwarded-for")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    
    try:
        # Rotate session: revoke old, create new
        new_refresh_token, new_session = rotate_session(
            db=db,
            old_refresh_token_hash=refresh_token_hash,
            account_id=account.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        
        # Create new access token
        access_token = create_access_token(subject=str(account.id), account_id=account.id)
        
        # Commit transaction
        db.commit()
        
        # Set new cookies
        _set_auth_cookies(response, access_token, new_refresh_token)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=account.username,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile = account.profile
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            account=account_resp,
            profile=profile_resp,
        )
        
    except HTTPException:
        db.rollback()
        raise
    except SessionError:
        logger.error("Token refresh session operation failed")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to refresh session")
    except Exception:
        logger.error("Token refresh failed")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to refresh token")


@router.post("/logout")
async def logout(
    response: Response,
    req: Request,
    refresh_token_cookie: Optional[str] = Cookie(None, alias="refresh_token"),
    db: Session = Depends(get_db),
):
    """
    Logout the current user by revoking their session.
    """
    if refresh_token_cookie:
        refresh_token_hash = hash_refresh_token(refresh_token_cookie)
        revoke_session(db, refresh_token_hash)
        db.commit()
    
    _clear_auth_cookies(response)
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=MeResponse)
async def get_current_user(
    account: Account = Depends(_get_current_account),
):
    """
    Get the current authenticated account and profile.
    """
    profile = account.profile
    account_resp = AccountResponse(
        id=account.id,
        username=account.username,
        account_type=account.account_type.value,
        status=account.status.value,
        created_at=account.created_at.isoformat(),
    )
    profile_resp = ProfileResponse(
        player_id=profile.player_id,
        display_name=profile.display_name,
        avatar=profile.avatar,
        xp=profile.xp,
        coins=profile.coins,
        diamonds=profile.diamonds,
        stars=profile.stars,
        streak=profile.streak,
    )
    
    return MeResponse(
        account=account_resp,
        profile=profile_resp,
    )


@router.put("/profile", response_model=MeResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    response: Response,
    db: Session = Depends(get_db),
    account: Account = Depends(_get_current_account),
):
    """
    Update the authenticated player's profile.
    
    Allows updating display_name and avatar from the allowed set.
    Player ID, account credentials, and game progress are preserved.
    """
    profile = account.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    try:
        # Update display_name if provided
        if request.display_name is not None:
            profile.display_name = request.display_name
        
        # Update avatar if provided
        if request.avatar is not None:
            profile.avatar = request.avatar
        
        db.commit()
        db.refresh(profile)
        
        # Build response
        account_resp = AccountResponse(
            id=account.id,
            username=account.username,
            account_type=account.account_type.value,
            status=account.status.value,
            created_at=account.created_at.isoformat(),
        )
        profile_resp = ProfileResponse(
            player_id=profile.player_id,
            display_name=profile.display_name,
            avatar=profile.avatar,
            xp=profile.xp,
            coins=profile.coins,
            diamonds=profile.diamonds,
            stars=profile.stars,
            streak=profile.streak,
        )
        
        return MeResponse(
            account=account_resp,
            profile=profile_resp,
        )
        
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.error("Profile update failed")
        raise HTTPException(status_code=500, detail="Failed to update profile")
