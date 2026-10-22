"""create_submodules_table_and_seed_24

Revision ID: e67689768183
Revises: 927617ebfe62
Create Date: 2026-10-11 09:19:23.868865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e67689768183'
down_revision: Union[str, Sequence[str], None] = '927617ebfe62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SUBMODULES_DATA = [
    # apt - General Aptitude
    {'module_slug': 'apt', 'slug': 'apt-arithmetic', 'name': 'Arithmetic', 'display_order': 1},
    {'module_slug': 'apt', 'slug': 'apt-quantitative', 'name': 'Quantitative Aptitude', 'display_order': 2},
    {'module_slug': 'apt', 'slug': 'apt-time-work', 'name': 'Time and Work', 'display_order': 3},
    # di - Data Interpretation
    {'module_slug': 'di', 'slug': 'di-tables-charts', 'name': 'Tables and Charts', 'display_order': 1},
    {'module_slug': 'di', 'slug': 'di-graph-analysis', 'name': 'Graph Analysis', 'display_order': 2},
    {'module_slug': 'di', 'slug': 'di-caselet-analysis', 'name': 'Caselet Analysis', 'display_order': 3},
    # lr - Logical Reasoning
    {'module_slug': 'lr', 'slug': 'lr-verbal-reasoning', 'name': 'Verbal Reasoning', 'display_order': 1},
    {'module_slug': 'lr', 'slug': 'lr-analytical-reasoning', 'name': 'Analytical Reasoning', 'display_order': 2},
    {'module_slug': 'lr', 'slug': 'lr-nonverbal-reasoning', 'name': 'Non-Verbal Reasoning', 'display_order': 3},
    # gk - General Knowledge
    {'module_slug': 'gk', 'slug': 'gk-science-tech', 'name': 'Science and Technology', 'display_order': 1},
    {'module_slug': 'gk', 'slug': 'gk-history-geography', 'name': 'History and Geography', 'display_order': 2},
    {'module_slug': 'gk', 'slug': 'gk-current-affairs', 'name': 'Current Affairs', 'display_order': 3},
    # prog - Programming
    {'module_slug': 'prog', 'slug': 'prog-fundamentals', 'name': 'Programming Fundamentals', 'display_order': 1},
    {'module_slug': 'prog', 'slug': 'prog-control-loops', 'name': 'Control Statements and Loops', 'display_order': 2},
    {'module_slug': 'prog', 'slug': 'prog-arrays-ds', 'name': 'Arrays and Data Structures', 'display_order': 3},
    # cs - Computer Science
    {'module_slug': 'cs', 'slug': 'cs-operating-systems', 'name': 'Operating Systems', 'display_order': 1},
    {'module_slug': 'cs', 'slug': 'cs-dbms', 'name': 'Database Management Systems', 'display_order': 2},
    {'module_slug': 'cs', 'slug': 'cs-networks', 'name': 'Computer Networks', 'display_order': 3},
    # eng - Engineering
    {'module_slug': 'eng', 'slug': 'eng-electrical', 'name': 'Electrical Fundamentals', 'display_order': 1},
    {'module_slug': 'eng', 'slug': 'eng-mechanical', 'name': 'Mechanical Fundamentals', 'display_order': 2},
    {'module_slug': 'eng', 'slug': 'eng-math', 'name': 'Engineering Mathematics', 'display_order': 3},
    # med - Medical Basics
    {'module_slug': 'med', 'slug': 'med-anatomy', 'name': 'Human Anatomy', 'display_order': 1},
    {'module_slug': 'med', 'slug': 'med-physiology', 'name': 'Human Physiology', 'display_order': 2},
    {'module_slug': 'med', 'slug': 'med-basic-science', 'name': 'Basic Medical Science', 'display_order': 3},
]

REQUIRED_MODULE_SLUGS = ['apt', 'di', 'lr', 'gk', 'prog', 'cs', 'eng', 'med']

SEED_SLUGS = [sm['slug'] for sm in SUBMODULES_DATA]


def upgrade() -> None:
    """Upgrade schema: create submodules table and seed 24 submodules."""
    # 1. Create submodules table
    op.create_table(
        'submodules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('slug', sa.String(length=30), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_submodules_slug'), 'submodules', ['slug'], unique=True)
    op.create_index('ix_submodules_module_id', 'submodules', ['module_id'], unique=False)
    op.create_index('ix_submodules_module_order', 'submodules', ['module_id', 'display_order'], unique=False)
    op.create_unique_constraint('uq_submodules_module_slug', 'submodules', ['module_id', 'slug'])

    # 2. Resolve module IDs by slug from the modules table
    conn = op.get_bind()
    # Use individual parameter binding for IN clause
    placeholders = ', '.join([f"'{slug}'" for slug in REQUIRED_MODULE_SLUGS])
    module_rows = conn.execute(
        sa.text(f"SELECT id, slug FROM modules WHERE slug IN ({placeholders})")
    ).fetchall()

    module_map = {row.slug: row.id for row in module_rows}

    # Verify all required modules exist
    missing = [slug for slug in REQUIRED_MODULE_SLUGS if slug not in module_map]
    if missing:
        raise RuntimeError(f"Required modules not found in database: {missing}. Aborting seed.")

    # 3. Prepare seed rows with resolved module_id
    seed_rows = []
    for sm in SUBMODULES_DATA:
        m_id = module_map[sm['module_slug']]
        seed_rows.append({
            'module_id': m_id,
            'slug': sm['slug'],
            'name': sm['name'],
            'description': None,
            'display_order': sm['display_order'],
            'is_active': 1,
        })

    # 4. Bulk insert seed data
    if seed_rows:
        op.bulk_insert(
            sa.table(
                'submodules',
                sa.column('module_id', sa.Integer),
                sa.column('slug', sa.String),
                sa.column('name', sa.String),
                sa.column('description', sa.Text),
                sa.column('display_order', sa.Integer),
                sa.column('is_active', sa.Integer),
            ),
            seed_rows
        )


def downgrade() -> None:
    """Downgrade schema: remove seeded submodules and drop table."""
    # Remove seeded submodules by exact slug list
    if SEED_SLUGS:
        placeholders = ', '.join(f"'{slug}'" for slug in SEED_SLUGS)
        op.execute(f"DELETE FROM submodules WHERE slug IN ({placeholders})")

    # Drop constraints and indexes in reverse order
    op.drop_constraint('uq_submodules_module_slug', 'submodules', type_='unique')
    op.drop_index('ix_submodules_module_order', table_name='submodules')
    op.drop_index('ix_submodules_module_id', table_name='submodules')
    op.drop_index(op.f('ix_submodules_slug'), table_name='submodules')
    op.drop_table('submodules')