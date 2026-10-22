"""Authentication service for Cortex Quest"""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.hash import argon2
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Account, AccountStatus, SessionModel


# Token configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
ALGORITHM = "HS256"
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


# Custom Exceptions
class AuthError(Exception):
    """Base authentication error"""
    pass


class InvalidCredentialsError(AuthError):
    """Invalid username or password"""
    pass


class TokenError(AuthError):
    """Token validation error"""
    pass


class SessionError(AuthError):
    """Session management error"""
    pass


# Password Security
def hash_password(password: str) -> str:
    """
    Hash a password using Argon2id.
    
    Args:
        password: Plaintext password
        
    Returns:
        Argon2id hash string (includes algorithm, params, salt, hash)
    """
    return argon2.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against an Argon2id hash.
    
    Args:
        password: Plaintext password to verify
        password_hash: Stored Argon2id hash
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return argon2.verify(password, password_hash)
    except Exception:
        # Handle malformed hashes safely
        return False


# JWT Tokens
def _get_secret_key() -> str:
    """
    Get the JWT signing secret from settings.
    
    Raises:
        RuntimeError: If secret is missing or is the default unsafe placeholder
    """
    settings = get_settings()
    secret = settings.secret_key
    
    if not secret or secret == "your-secret-key-here-min-32-chars":
        raise RuntimeError("JWT secret key not configured. Set SECRET_KEY in environment.")
    
    if len(secret) < 32:
        raise RuntimeError("JWT secret key must be at least 32 characters")
    
    return secret


def _utcnow() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


def create_access_token(subject: str, account_id: int) -> str:
    """
    Create a short-lived JWT access token.
    
    Args:
        subject: Token subject (string representation of account ID)
        account_id: Account database ID
        
    Returns:
        Encoded JWT access token
    """
    now = _utcnow()
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": subject,
        "account_id": account_id,
        "type": TOKEN_TYPE_ACCESS,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }
    
    return jwt.encode(payload, _get_secret_key(), algorithm=ALGORITHM)


def create_refresh_token(subject: str, account_id: int) -> str:
    """
    Create a long-lived JWT refresh token.
    
    Args:
        subject: Token subject (string representation of account ID)
        account_id: Account database ID
        
    Returns:
        Encoded JWT refresh token
    """
    now = _utcnow()
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    payload = {
        "sub": subject,
        "account_id": account_id,
        "type": TOKEN_TYPE_REFRESH,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }
    
    return jwt.encode(payload, _get_secret_key(), algorithm=ALGORITHM)


def decode_token(token: str, expected_type: Optional[str] = None) -> dict:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        expected_type: If provided, validates token type matches
        
    Returns:
        Decoded token payload
        
    Raises:
        TokenError: If token is invalid, expired, or wrong type
    """
    try:
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
    except JWTError as e:
        raise TokenError(f"Invalid token: {str(e)}")
    
    # Validate token type if expected
    if expected_type and payload.get("type") != expected_type:
        raise TokenError(f"Expected token type '{expected_type}', got '{payload.get('type')}'")
    
    # Validate required fields
    if "sub" not in payload:
        raise TokenError("Token missing subject")
    
    if "account_id" not in payload:
        raise TokenError("Token missing account_id")
    
    return payload


# Refresh Tokens (High-Entropy Random + SHA-256)
def generate_refresh_token() -> str:
    """
    Generate a cryptographically secure random refresh token.
    
    Returns:
        URL-safe random string (256 bits of entropy)
    """
    return secrets.token_urlsafe(32)


def hash_refresh_token(token: str) -> str:
    """
    Create a SHA-256 hash of a refresh token for database storage.
    
    Args:
        token: Plaintext refresh token
        
    Returns:
        Hex-encoded SHA-256 hash
    """
    return hashlib.sha256(token.encode()).hexdigest()


# Session Operations
def create_session(
    db: Session,
    account_id: int,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> tuple[str, SessionModel]:
    """
    Create a new session with refresh token.
    
    Args:
        db: Database session
        account_id: Account ID
        user_agent: Optional user agent string
        ip_address: Optional IP address
        
    Returns:
        Tuple of (plaintext_refresh_token, SessionModel)
        
    Raises:
        SessionError: If session creation fails
    """
    try:
        # Generate refresh token and its hash
        refresh_token = generate_refresh_token()
        refresh_token_hash = hash_refresh_token(refresh_token)
        
        now = _utcnow()
        expires_at = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Create session record
        session = SessionModel(
            account_id=account_id,
            refresh_token_hash=refresh_token_hash,
            user_agent=user_agent,
            ip_address=ip_address,
            created_at=now,
            expires_at=expires_at,
            revoked_at=None,
        )
        
        db.add(session)
        db.flush()  # Get session ID without committing
        
        return refresh_token, session
        
    except Exception as e:
        raise SessionError(f"Failed to create session: {str(e)}")


def revoke_session(db: Session, refresh_token_hash: str) -> bool:
    """
    Revoke a session by its refresh token hash.
    
    Args:
        db: Database session
        refresh_token_hash: SHA-256 hash of the refresh token
        
    Returns:
        True if session was found and revoked, False otherwise
    """
    session = db.query(SessionModel).filter(
        SessionModel.refresh_token_hash == refresh_token_hash
    ).first()
    
    if session and session.revoked_at is None:
        session.revoked_at = _utcnow()
        db.flush()
        return True
    
    return False


def get_active_session(db: Session, refresh_token_hash: str) -> Optional[SessionModel]:
    """
    Get an active (not revoked, not expired) session by refresh token hash.
    
    Args:
        db: Database session
        refresh_token_hash: SHA-256 hash of the refresh token
        
    Returns:
        SessionModel if active, None otherwise
    """
    now = _utcnow()
    return db.query(SessionModel).filter(
        SessionModel.refresh_token_hash == refresh_token_hash,
        SessionModel.revoked_at.is_(None),
        SessionModel.expires_at > now,
    ).first()


def rotate_session(
    db: Session,
    old_refresh_token_hash: str,
    account_id: int,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> tuple[str, SessionModel]:
    """
    Rotate a session: revoke the old one and create a new one.
    
    Args:
        db: Database session
        old_refresh_token_hash: SHA-256 hash of the old refresh token
        account_id: Account ID
        user_agent: Optional user agent string
        ip_address: Optional IP address
        
    Returns:
        Tuple of (new_plaintext_refresh_token, new_SessionModel)
        
    Raises:
        SessionError: If session rotation fails
    """
    try:
        # Revoke the old session
        revoke_session(db, old_refresh_token_hash)
        
        # Create new session
        return create_session(db, account_id, user_agent, ip_address)
        
    except Exception as e:
        raise SessionError(f"Failed to rotate session: {str(e)}")


# Account Validation
def validate_account_active(account: Optional[Account]) -> Account:
    """
    Validate that an account exists and is active.
    
    Args:
        account: Account instance or None
        
    Returns:
        The account if valid
        
    Raises:
        InvalidCredentialsError: If account is missing, deleted, or inactive
    """
    if account is None:
        raise InvalidCredentialsError("Invalid credentials")
    
    if account.status != AccountStatus.ACTIVE:
        raise InvalidCredentialsError("Account is not active")
    
    return account


def get_account_by_username(db: Session, username: str) -> Optional[Account]:
    """
    Get an account by username (case-insensitive).
    
    Args:
        db: Database session
        username: Username to search for
        
    Returns:
        Account if found, None otherwise
    """
    return db.query(Account).filter(Account.username == username.lower()).first()


def get_account_by_id(db: Session, account_id: int) -> Optional[Account]:
    """
    Get an account by ID.
    
    Args:
        db: Database session
        account_id: Account ID
        
    Returns:
        Account if found, None otherwise
    """
    return db.query(Account).filter(Account.id == account_id).first()