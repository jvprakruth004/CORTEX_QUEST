"""Authentication Pydantic schemas for Cortex Quest"""
import re
from typing import Optional, Annotated
from pydantic import BaseModel, Field, field_validator, BeforeValidator


# Avatar allowlist (matching frontend AVATARS)
ALLOWED_AVATARS = ["🦊", "🐼", "🦉", "🐙", "🦄", "🐯"]


def validate_avatar(v: str) -> str:
    if v not in ALLOWED_AVATARS:
        raise ValueError(f"Avatar must be one of: {', '.join(ALLOWED_AVATARS)}")
    return v


AvatarEnum = Annotated[str, BeforeValidator(validate_avatar)]


# Request Schemas
class GuestRegisterRequest(BaseModel):
    """Guest account registration request"""
    avatar: Optional[AvatarEnum] = Field(default="🦊", description="Player avatar")


class RegisterRequest(BaseModel):
    """Permanent account registration request"""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    display_name: str = Field(..., min_length=1, max_length=50, description="Display name")
    avatar: AvatarEnum = Field(default="🦊", description="Player avatar")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.fullmatch(r"[A-Za-z0-9_]{3,50}", v):
            raise ValueError("Username must be 3-50 characters: letters, digits, underscores only")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 100:
            raise ValueError("Password must be 8-100 characters")
        return v

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Display name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    """Login request"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        return v.lower().strip()


class ConvertRequest(BaseModel):
    """Guest-to-permanent conversion request"""
    password: str = Field(..., min_length=8, max_length=100, description="Password")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 100:
            raise ValueError("Password must be 8-100 characters")
        return v


class ProfileUpdateRequest(BaseModel):
    """Profile update request"""
    display_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Display name")
    avatar: Optional[AvatarEnum] = Field(None, description="Player avatar")

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Display name cannot be empty")
            return v.strip()
        return v


# Response Schemas (no sensitive data)
class AccountResponse(BaseModel):
    """Account information for responses"""
    id: int
    username: Optional[str] = None
    account_type: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    """Player profile for responses"""
    player_id: str
    display_name: str
    avatar: str
    xp: int
    coins: int
    diamonds: int
    stars: int
    streak: int

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response with tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    account: AccountResponse
    profile: ProfileResponse


class MeResponse(BaseModel):
    """Current account response for GET /api/auth/me"""
    account: AccountResponse
    profile: ProfileResponse