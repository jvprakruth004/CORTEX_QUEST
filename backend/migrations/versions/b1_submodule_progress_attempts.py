"""add submodule_id to player_level_progress and quiz_attempts with PK change

Revision ID: b1_submodule_progress_attempts
Revises: 8c75185762f4
Create Date: 2026-10-11

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1_submodule_progress_attempts'
down_revision: Union[str, Sequence[str], None] = '8c75185762f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add submodule_id to quiz_attempts and player_level_progress with PK change."""
    # 1. Add submodule_id to quiz_attempts (nullable, FK SET NULL)
    op.add_column(
        'quiz_attempts',
        sa.Column(
            'submodule_id',
            sa.Integer(),
            sa.ForeignKey('submodules.id', ondelete='SET NULL'),
            nullable=True,
            index=True,
        )
    )
    op.create_index(
        'ix_quiz_attempts_account_submodule',
        'quiz_attempts',
        ['account_id', 'submodule_id'],
        unique=False
    )

    # 2. For player_level_progress: need to change PK to include submodule_id
    # Strategy: add column with default 0 (sentinel for "no submodule"), 
    # create dummy submodule id=0, update rows, drop old PK, add new PK
    
    # First, add submodule_id column with default 0
    op.add_column(
        'player_level_progress',
        sa.Column(
            'submodule_id',
            sa.Integer(),
            nullable=False,
            server_default='0',
            index=True,
        )
    )
    
    # Create dummy submodule with id=0 for "no submodule / legacy"
    # Need to temporarily allow explicit id insert
    conn = op.get_bind()
    # Check if dummy submodule exists
    result = conn.execute(sa.text("SELECT id FROM submodules WHERE id = 0")).fetchone()
    if not result:
        # Get a valid module_id for the dummy (use first module)
        module_result = conn.execute(sa.text("SELECT id FROM modules ORDER BY id LIMIT 1")).fetchone()
        if module_result:
            module_id = module_result[0]
            conn.execute(sa.text(f"""
                INSERT INTO submodules (id, module_id, slug, name, display_order, is_active, created_at)
                VALUES (0, {module_id}, 'no-submodule', 'No Submodule (Legacy)', 0, 1, now())
            """))
    
    # Update existing rows to submodule_id = 0 (legacy)
    op.execute("UPDATE player_level_progress SET submodule_id = 0 WHERE submodule_id IS NULL OR submodule_id = 0")
    
    # Remove server_default now that all rows have a value
    op.alter_column('player_level_progress', 'submodule_id', server_default=None)
    
    # Add FK constraint (references dummy submodule id=0 for legacy rows)
    op.create_foreign_key(
        'fk_player_level_progress_submodule_id',
        'player_level_progress', 'submodules',
        ['submodule_id'], ['id'],
        ondelete='CASCADE'
    )
    
    # Drop old PK
    op.drop_constraint('pk_player_level_progress', 'player_level_progress', type_='primary')
    
    # Add new PK including submodule_id
    op.create_primary_key(
        'pk_player_level_progress',
        'player_level_progress',
        ['account_id', 'module_id', 'difficulty_id', 'submodule_id', 'level_number']
    )
    
    # Add index for submodule lookups
    op.create_index(
        'ix_player_level_progress_account_submodule',
        'player_level_progress',
        ['account_id', 'submodule_id'],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema: remove submodule_id from both tables, restore old PK."""
    # Drop new PK
    op.drop_constraint('pk_player_level_progress', 'player_level_progress', type_='primary')
    
    # Drop FK (PostgreSQL auto-generated name)
    op.drop_constraint('player_level_progress_submodule_id_fkey', 'player_level_progress', type_='foreignkey')
    
    # Drop index
    op.drop_index('ix_player_level_progress_account_submodule', table_name='player_level_progress')
    
    # Add back old PK
    op.create_primary_key(
        'pk_player_level_progress',
        'player_level_progress',
        ['account_id', 'module_id', 'difficulty_id', 'level_number']
    )
    
    # Remove submodule_id column
    op.drop_column('player_level_progress', 'submodule_id')
    
    # quiz_attempts
    op.drop_index('ix_quiz_attempts_account_submodule', table_name='quiz_attempts')
    op.drop_constraint('quiz_attempts_submodule_id_fkey', 'quiz_attempts', type_='foreignkey')
    op.drop_column('quiz_attempts', 'submodule_id')