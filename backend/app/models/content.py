"""Content models for Cortex Quest: modules, difficulty levels, questions, and options"""
from datetime import datetime
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
)
from sqlalchemy.orm import relationship
from app.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    questions = relationship("Question", back_populates="module", cascade="all, delete-orphan")
    submodules = relationship("Submodule", back_populates="module", cascade="all, delete-orphan", order_by="Submodule.display_order")


class Submodule(Base):
    __tablename__ = "submodules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slug = Column(String(30), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="submodules")
    questions = relationship("Question", back_populates="submodule")

    # Table args for constraints and indexes
    __table_args__ = (
        UniqueConstraint("module_id", "slug", name="uq_submodules_module_slug"),
        Index("ix_submodules_module_order", "module_id", "display_order"),
    )


class DifficultyLevel(Base):
    __tablename__ = "difficulty_levels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(20), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    xp_multiplier = Column(Integer, nullable=False, default=100)  # Stored as integer (100 = 1.00)

    # Relationships
    questions = relationship("Question", back_populates="difficulty")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submodule_id = Column(
        Integer,
        ForeignKey("submodules.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    difficulty_id = Column(
        Integer,
        ForeignKey("difficulty_levels.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    level_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    hint_text = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    is_active = Column(Integer, nullable=False, default=1)
    source = Column(String(50), nullable=False, default="manual")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="questions")
    submodule = relationship("Submodule", back_populates="questions")
    difficulty = relationship("DifficultyLevel", back_populates="questions")
    options = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.display_order",
    )

    # Table args for constraints and indexes
    __table_args__ = (
        CheckConstraint("level_number BETWEEN 1 AND 50", name="ck_questions_level_number_range"),
        Index("ix_questions_module_difficulty_level", "module_id", "difficulty_id", "level_number"),
        Index("ix_questions_active_lookup", "module_id", "difficulty_id", "is_active"),
        Index("ix_questions_submodule", "submodule_id"),
    )


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(
        Integer,
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    option_text = Column(Text, nullable=False)
    is_correct = Column(Integer, nullable=False, default=0)
    display_order = Column(Integer, nullable=False)

    # Relationships
    question = relationship("Question", back_populates="options")

    # Table args for constraints
    __table_args__ = (
        UniqueConstraint("question_id", "display_order", name="uq_question_options_question_order"),
        CheckConstraint("is_correct IN (0, 1)", name="ck_question_options_is_correct_bool"),
    )
