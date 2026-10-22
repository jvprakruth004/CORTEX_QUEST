"""add player_level_progress table and last_activity_date column

Revision ID: 927617ebfe62
Revises: 4075346fb224
Create Date: 2026-10-10 17:02:30.294578

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '927617ebfe62'
down_revision: Union[str, Sequence[str], None] = '4075346fb224'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('player_level_progress',
    sa.Column('account_id', sa.Integer(), nullable=False),
    sa.Column('module_id', sa.Integer(), nullable=False),
    sa.Column('difficulty_id', sa.Integer(), nullable=False),
    sa.Column('level_number', sa.Integer(), nullable=False),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    sa.Column('best_accuracy', sa.Integer(), nullable=False, server_default='0'),
    sa.Column('stars_earned', sa.Integer(), nullable=False, server_default='0'),
    sa.CheckConstraint('best_accuracy BETWEEN 0 AND 100', name='ck_player_level_progress_accuracy_range'),
    sa.CheckConstraint('level_number BETWEEN 1 AND 50', name='ck_player_level_progress_level_range'),
    sa.CheckConstraint('stars_earned BETWEEN 0 AND 3', name='ck_player_level_progress_stars_range'),
    sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['difficulty_id'], ['difficulty_levels.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('account_id', 'module_id', 'difficulty_id', 'level_number', name='pk_player_level_progress')
    )
    op.create_index('ix_player_level_progress_account_completed', 'player_level_progress', ['account_id', 'completed_at'], unique=False)
    op.create_index('ix_player_level_progress_module_difficulty', 'player_level_progress', ['module_id', 'difficulty_id'], unique=False)
    
    op.add_column('player_profiles', sa.Column('last_activity_date', sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('player_profiles', 'last_activity_date')
    op.drop_index('ix_player_level_progress_module_difficulty', table_name='player_level_progress')
    op.drop_index('ix_player_level_progress_account_completed', table_name='player_level_progress')
    op.drop_table('player_level_progress')
