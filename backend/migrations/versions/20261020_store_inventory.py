"""Add persistent lifeline inventory and store purchase history.

Revision ID: 20261020_store_inventory
Revises: 20261020_practice_sessions
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261020_store_inventory"
down_revision: Union[str, Sequence[str], None] = "20261020_practice_sessions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "player_profiles",
        sa.Column("hint_inventory", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "player_profiles",
        sa.Column("fifty_fifty_inventory", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_check_constraint(
        "ck_player_profiles_hint_inventory_nonneg",
        "player_profiles",
        "hint_inventory >= 0",
    )
    op.create_check_constraint(
        "ck_player_profiles_fifty_fifty_inventory_nonneg",
        "player_profiles",
        "fifty_fifty_inventory >= 0",
    )
    op.create_table(
        "store_transactions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("account_id", sa.Integer(), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("request_id", sa.String(length=36), nullable=False),
        sa.Column("item_id", sa.String(length=10), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("balance_before", sa.Integer(), nullable=False),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("item_id IN ('hint', '5050')", name="ck_store_transactions_item"),
        sa.CheckConstraint("currency IN ('coins', 'diamonds')", name="ck_store_transactions_currency"),
        sa.CheckConstraint("amount > 0", name="ck_store_transactions_amount_positive"),
        sa.CheckConstraint("balance_before >= amount", name="ck_store_transactions_balance_before"),
        sa.CheckConstraint("balance_after = balance_before - amount", name="ck_store_transactions_balance_after"),
        sa.UniqueConstraint("account_id", "request_id", name="uq_store_transactions_account_request"),
    )
    op.create_index(
        "ix_store_transactions_account_created",
        "store_transactions",
        ["account_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_store_transactions_account_created", table_name="store_transactions")
    op.drop_table("store_transactions")
    op.drop_constraint(
        "ck_player_profiles_fifty_fifty_inventory_nonneg",
        "player_profiles",
        type_="check",
    )
    op.drop_constraint(
        "ck_player_profiles_hint_inventory_nonneg",
        "player_profiles",
        type_="check",
    )
    op.drop_column("player_profiles", "fifty_fifty_inventory")
    op.drop_column("player_profiles", "hint_inventory")
