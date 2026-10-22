"""Account models for Cortex Quest"""
import enum
from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Enum,
    ForeignKey,
    UniqueConstraint,
    Index,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class AccountType(str, enum.Enum):
    GUEST = "GUEST"
    PERMANENT = "PERMANENT"


class AccountStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DELETED = "DELETED"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    account_type = Column(Enum(AccountType), nullable=False, default=AccountType.GUEST)
    status = Column(Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship
    profile = relationship(
        "PlayerProfile",
        back_populates="account",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Table args for constraints
    __table_args__ = (
        CheckConstraint(
            "(account_type = 'GUEST') OR (account_type = 'PERMANENT' AND username IS NOT NULL AND password_hash IS NOT NULL)",
            name="ck_accounts_permanent_requires_credentials",
        ),
    )

    # Partial unique index: username unique only when not null (handled by unique=True + nullable)
    # Note: PostgreSQL treats NULL as distinct for unique constraints


class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    account_id = Column(
        Integer,
        ForeignKey("accounts.id", ondelete="CASCADE"),
        primary_key=True,
    )
    player_id = Column(String(20), unique=True, nullable=False, index=True)
    display_name = Column(String(50), nullable=False)
    avatar = Column(String(10), nullable=False)
    xp = Column(Integer, nullable=False, default=0)
    coins = Column(Integer, nullable=False, default=0)
    diamonds = Column(Integer, nullable=False, default=0)
    hint_inventory = Column(Integer, nullable=False, default=0)
    fifty_fifty_inventory = Column(Integer, nullable=False, default=0)
    stars = Column(Integer, nullable=False, default=0)
    streak = Column(Integer, nullable=False, default=0)
    last_activity_date = Column(Date, nullable=True)

    # Relationship
    account = relationship("Account", back_populates="profile")

    # Table args for constraints
    __table_args__ = (
        # Composite index for leaderboard queries
        Index("ix_player_profiles_xp", "xp"),
        CheckConstraint("xp >= 0", name="ck_player_profiles_xp_nonneg"),
        CheckConstraint("coins >= 0", name="ck_player_profiles_coins_nonneg"),
        CheckConstraint("diamonds >= 0", name="ck_player_profiles_diamonds_nonneg"),
        CheckConstraint("hint_inventory >= 0", name="ck_player_profiles_hint_inventory_nonneg"),
        CheckConstraint("fifty_fifty_inventory >= 0", name="ck_player_profiles_fifty_fifty_inventory_nonneg"),
        CheckConstraint("stars >= 0", name="ck_player_profiles_stars_nonneg"),
        CheckConstraint("streak >= 0", name="ck_player_profiles_streak_nonneg"),
    )