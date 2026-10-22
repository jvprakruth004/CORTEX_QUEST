"""Persistent store purchase history for Cortex Quest."""
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint

from app.database import Base


class StoreTransaction(Base):
    __tablename__ = "store_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    request_id = Column(String(36), nullable=False)
    item_id = Column(String(10), nullable=False)
    currency = Column(String(10), nullable=False)
    amount = Column(Integer, nullable=False)
    balance_before = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        CheckConstraint("item_id IN ('hint', '5050')", name="ck_store_transactions_item"),
        CheckConstraint("currency IN ('coins', 'diamonds')", name="ck_store_transactions_currency"),
        CheckConstraint("amount > 0", name="ck_store_transactions_amount_positive"),
        CheckConstraint("balance_before >= amount", name="ck_store_transactions_balance_before"),
        CheckConstraint("balance_after = balance_before - amount", name="ck_store_transactions_balance_after"),
        UniqueConstraint("account_id", "request_id", name="uq_store_transactions_account_request"),
        Index("ix_store_transactions_account_created", "account_id", "created_at"),
    )
