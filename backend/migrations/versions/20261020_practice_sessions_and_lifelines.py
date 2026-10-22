"""Add practice session context, safe lifelines, and optional question hints.

Revision ID: 20261020_practice_sessions
Revises: b1_submodule_progress_attempts
Create Date: 2026-10-20
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261020_practice_sessions"
down_revision: Union[str, Sequence[str], None] = "b1_submodule_progress_attempts"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("questions", sa.Column("hint_text", sa.Text(), nullable=True))
    op.create_table(
        "practice_quiz_sessions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", sa.Integer(), sa.ForeignKey("modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("difficulty_id", sa.Integer(), sa.ForeignKey("difficulty_levels.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("submodule_id", sa.Integer(), sa.ForeignKey("submodules.id", ondelete="SET NULL"), nullable=True),
        sa.Column("level_number", sa.Integer(), nullable=False),
        sa.Column("question_ids", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("result_payload", sa.JSON(), nullable=True),
        sa.CheckConstraint("level_number BETWEEN 1 AND 50", name="ck_practice_sessions_level_range"),
    )
    op.create_index("ix_practice_quiz_sessions_account_id", "practice_quiz_sessions", ["account_id"])
    op.create_index("ix_practice_sessions_account_created", "practice_quiz_sessions", ["account_id", "created_at"])
    op.create_table(
        "practice_lifeline_uses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("practice_quiz_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lifeline_type", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("session_id", "question_id", "lifeline_type", name="uq_practice_lifeline_once_per_question"),
        sa.CheckConstraint("lifeline_type IN ('hint', '5050')", name="ck_practice_lifeline_type"),
    )
    op.create_index("ix_practice_lifeline_session", "practice_lifeline_uses", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_practice_lifeline_session", table_name="practice_lifeline_uses")
    op.drop_table("practice_lifeline_uses")
    op.drop_index("ix_practice_sessions_account_created", table_name="practice_quiz_sessions")
    op.drop_index("ix_practice_quiz_sessions_account_id", table_name="practice_quiz_sessions")
    op.drop_table("practice_quiz_sessions")
    op.drop_column("questions", "hint_text")
