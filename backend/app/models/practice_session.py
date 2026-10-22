"""Server-side practice session and lifeline usage records."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint, Index, CheckConstraint

from app.database import Base


class PracticeQuizSession(Base):
    __tablename__ = "practice_quiz_sessions"

    id = Column(String(36), primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    difficulty_id = Column(Integer, ForeignKey("difficulty_levels.id", ondelete="RESTRICT"), nullable=False)
    submodule_id = Column(Integer, ForeignKey("submodules.id", ondelete="SET NULL"), nullable=True)
    level_number = Column(Integer, nullable=False)
    question_ids = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    result_payload = Column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_practice_sessions_account_created", "account_id", "created_at"),
        CheckConstraint("level_number BETWEEN 1 AND 50", name="ck_practice_sessions_level_range"),
    )


class PracticeLifelineUse(Base):
    __tablename__ = "practice_lifeline_uses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("practice_quiz_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    lifeline_type = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("session_id", "question_id", "lifeline_type", name="uq_practice_lifeline_once_per_question"),
        Index("ix_practice_lifeline_session", "session_id"),
        CheckConstraint("lifeline_type IN ('hint', '5050')", name="ck_practice_lifeline_type"),
    )
