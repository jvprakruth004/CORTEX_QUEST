"""Player level progress model for Cortex Quest"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    PrimaryKeyConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from app.database import Base


class PlayerLevelProgress(Base):
    __tablename__ = "player_level_progress"

    account_id = Column(
        Integer,
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
    )
    difficulty_id = Column(
        Integer,
        ForeignKey("difficulty_levels.id", ondelete="CASCADE"),
        nullable=False,
    )
    submodule_id = Column(
        Integer,
        ForeignKey("submodules.id", ondelete="CASCADE"),
        nullable=False,
        default=0,
        index=True,
    )
    level_number = Column(Integer, nullable=False)

    completed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    best_accuracy = Column(Integer, nullable=False, default=0)
    stars_earned = Column(Integer, nullable=False, default=0)

    # Relationships
    account = relationship("Account", backref="level_progress")
    module = relationship("Module", backref="player_progress")
    difficulty = relationship("DifficultyLevel", backref="player_progress")
    submodule = relationship("Submodule", backref="player_progress")

    __table_args__ = (
        PrimaryKeyConstraint("account_id", "module_id", "difficulty_id", "submodule_id", "level_number", name="pk_player_level_progress"),
        CheckConstraint("level_number BETWEEN 1 AND 50", name="ck_player_level_progress_level_range"),
        CheckConstraint("best_accuracy BETWEEN 0 AND 100", name="ck_player_level_progress_accuracy_range"),
        CheckConstraint("stars_earned BETWEEN 0 AND 3", name="ck_player_level_progress_stars_range"),
        Index("ix_player_level_progress_account_completed", "account_id", "completed_at"),
        Index("ix_player_level_progress_module_difficulty", "module_id", "difficulty_id"),
        Index("ix_player_level_progress_account_submodule", "account_id", "submodule_id"),
    )