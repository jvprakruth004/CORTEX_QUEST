"""add_submodule_id_to_questions

Revision ID: 8c75185762f4
Revises: e67689768183
Create Date: 2026-10-11 09:27:48.276043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c75185762f4'
down_revision: Union[str, Sequence[str], None] = 'e67689768183'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add submodule_id to questions table."""
    op.add_column(
        'questions',
        sa.Column(
            'submodule_id',
            sa.Integer(),
            sa.ForeignKey('submodules.id', ondelete='SET NULL'),
            nullable=True,
            index=True,
        )
    )
    op.create_index('ix_questions_submodule', 'questions', ['submodule_id'])


def downgrade() -> None:
    """Downgrade schema: remove submodule_id from questions table."""
    op.drop_index('ix_questions_submodule', table_name='questions')
    op.drop_column('questions', 'submodule_id')