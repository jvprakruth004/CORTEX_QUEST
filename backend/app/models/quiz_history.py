"""Quiz attempt history models for Cortex Quest"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Index,
    CheckConstraint,
    UniqueConstraint,
    Numeric,
    func,
)
from sqlalchemy.orm import relationship
from app.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(
        Integer,
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_type = Column(String(10), nullable=False)
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="SET NULL"),
        nullable=True,
    )
    difficulty_id = Column(
        Integer,
        ForeignKey("difficulty_levels.id", ondelete="SET NULL"),
        nullable=True,
    )
    submodule_id = Column(
        Integer,
        ForeignKey("submodules.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    level_number = Column(Integer, nullable=True)

    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    incorrect_answers = Column(Integer, nullable=False)
    accuracy_percent = Column(Integer, nullable=False)
    total_time_seconds = Column(Integer, nullable=False)

    xp_earned = Column(Integer, nullable=False, default=0)
    coins_earned = Column(Integer, nullable=False, default=0)
    multiplier = Column(Numeric(3, 2), nullable=False, default=1.00)

    completed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    account = relationship("Account", backref="quiz_attempts")
    module = relationship("Module", backref="quiz_attempts")
    difficulty = relationship("DifficultyLevel", backref="quiz_attempts")
    submodule = relationship("Submodule", backref="quiz_attempts")
    questions = relationship(
        "QuizAttemptQuestion",
        back_populates="attempt",
        cascade="all, delete-orphan",
        order_by="QuizAttemptQuestion.id",
    )

    __table_args__ = (
        CheckConstraint("session_type IN ('practice', 'mock')", name="ck_quiz_attempts_session_type"),
        CheckConstraint("level_number BETWEEN 1 AND 50", name="ck_quiz_attempts_level_number_range"),
        CheckConstraint("total_questions > 0", name="ck_quiz_attempts_total_questions_positive"),
        CheckConstraint("correct_answers >= 0", name="ck_quiz_attempts_correct_answers_nonneg"),
        CheckConstraint("incorrect_answers >= 0", name="ck_quiz_attempts_incorrect_answers_nonneg"),
        CheckConstraint("accuracy_percent BETWEEN 0 AND 100", name="ck_quiz_attempts_accuracy_range"),
        CheckConstraint("total_time_seconds >= 0", name="ck_quiz_attempts_time_nonneg"),
        CheckConstraint("xp_earned >= 0", name="ck_quiz_attempts_xp_nonneg"),
        CheckConstraint("coins_earned >= 0", name="ck_quiz_attempts_coins_nonneg"),
        CheckConstraint("multiplier > 0", name="ck_quiz_attempts_multiplier_positive"),
        Index("ix_quiz_attempts_account_completed", "account_id", "completed_at"),
        Index("ix_quiz_attempts_module_difficulty", "module_id", "difficulty_id"),
        Index("ix_quiz_attempts_account_submodule", "account_id", "submodule_id"),
    )


class QuizAttemptQuestion(Base):
    __tablename__ = "quiz_attempt_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    attempt_id = Column(
        Integer,
        ForeignKey("quiz_attempts.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id = Column(
        Integer,
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Snapshot fields for immutable history
    question_text_snapshot = Column(Text, nullable=False)
    explanation_snapshot = Column(Text, nullable=True)

    selected_option_id = Column(
        Integer,
        ForeignKey("question_options.id", ondelete="RESTRICT"),
        nullable=False,
    )
    selected_option_text_snapshot = Column(Text, nullable=False)

    correct_option_id = Column(
        Integer,
        ForeignKey("question_options.id", ondelete="RESTRICT"),
        nullable=False,
    )
    correct_option_text_snapshot = Column(Text, nullable=False)

    is_correct = Column(Integer, nullable=False)
    time_seconds = Column(Integer, nullable=False)

    # Relationships
    attempt = relationship("QuizAttempt", back_populates="questions")
    question = relationship("Question", backref="attempt_questions")
    selected_option = relationship("QuestionOption", foreign_keys=[selected_option_id], backref="selected_in_attempts")
    correct_option = relationship("QuestionOption", foreign_keys=[correct_option_id], backref="correct_in_attempts")

    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_quiz_attempt_questions_attempt_question"),
        CheckConstraint("is_correct IN (0, 1)", name="ck_quiz_attempt_questions_is_correct_bool"),
        CheckConstraint("time_seconds BETWEEN 0 AND 3600", name="ck_quiz_attempt_questions_time_range"),
    )