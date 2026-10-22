"""Expand level_number range to 1-50

Revision ID: c72a4418366c
Revises: 0c0e60bde94b
Create Date: 2026-10-10 15:50:52.139240

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c72a4418366c'
down_revision: Union[str, Sequence[str], None] = '0c0e60bde94b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: expand level_number from 1-3 to 1-50."""
    # Drop the old constraint
    op.execute("ALTER TABLE questions DROP CONSTRAINT ck_questions_level_number_range")
    # Add the new constraint
    op.create_check_constraint(
        "ck_questions_level_number_range",
        "questions",
        "level_number BETWEEN 1 AND 50"
    )


def downgrade() -> None:
    """Downgrade schema: restore level_number to 1-3."""
    # Drop the expanded constraint
    op.execute("ALTER TABLE questions DROP CONSTRAINT ck_questions_level_number_range")
    # Restore the original constraint
    op.create_check_constraint(
        "ck_questions_level_number_range",
        "questions",
        "level_number BETWEEN 1 AND 3"
    )
