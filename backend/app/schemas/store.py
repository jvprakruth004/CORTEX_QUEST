"""Store API schemas."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StorePurchaseRequest(BaseModel):
    item_id: Literal["hint", "5050"]
    request_id: UUID


class StoreBalancesResponse(BaseModel):
    coins: int
    diamonds: int


class StoreInventoryResponse(BaseModel):
    hint: int
    fifty_fifty: int


class StoreTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: str
    currency: str
    amount: int
    balance_before: int
    balance_after: int
    created_at: datetime

class StoreStatusResponse(BaseModel):
    balances: StoreBalancesResponse
    inventory: StoreInventoryResponse
    transactions: list[StoreTransactionResponse] = Field(default_factory=list)
