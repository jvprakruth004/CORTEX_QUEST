"""Authenticated store inventory and purchase endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import _get_current_account
from app.database import get_db
from app.models.account import PlayerProfile
from app.models.store import StoreTransaction
from app.schemas.store import (
    StoreBalancesResponse,
    StoreInventoryResponse,
    StorePurchaseRequest,
    StoreStatusResponse,
    StoreTransactionResponse,
)

router = APIRouter(prefix="/store", tags=["store"])
STORE_ITEMS = {
    "hint": ("coins", 10, "hint_inventory"),
    "5050": ("diamonds", 5, "fifty_fifty_inventory"),
}


def _store_status(db: Session, account_id: int, profile: PlayerProfile) -> StoreStatusResponse:
    transactions = (
        db.query(StoreTransaction)
        .filter(StoreTransaction.account_id == account_id)
        .order_by(StoreTransaction.created_at.desc(), StoreTransaction.id.desc())
        .all()
    )
    return StoreStatusResponse(
        balances=StoreBalancesResponse(coins=profile.coins, diamonds=profile.diamonds),
        inventory=StoreInventoryResponse(
            hint=profile.hint_inventory,
            fifty_fifty=profile.fifty_fifty_inventory,
        ),
        transactions=[StoreTransactionResponse.model_validate(txn) for txn in transactions],
    )


@router.get("", response_model=StoreStatusResponse)
async def get_store(
    db: Session = Depends(get_db),
    account=Depends(_get_current_account),
):
    profile = db.query(PlayerProfile).filter(PlayerProfile.account_id == account.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    return _store_status(db, account.id, profile)


@router.post("/purchase", response_model=StoreStatusResponse)
async def purchase_store_item(
    request: StorePurchaseRequest,
    db: Session = Depends(get_db),
    account=Depends(_get_current_account),
):
    currency, price, inventory_field = STORE_ITEMS[request.item_id]
    profile = (
        db.query(PlayerProfile)
        .filter(PlayerProfile.account_id == account.id)
        .with_for_update()
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    existing = db.query(StoreTransaction).filter_by(
        account_id=account.id,
        request_id=str(request.request_id),
    ).first()
    if existing:
        return _store_status(db, account.id, profile)

    balance_before = getattr(profile, currency)
    if balance_before < price:
        raise HTTPException(status_code=422, detail=f"Not enough {currency} for this item")

    setattr(profile, currency, balance_before - price)
    setattr(profile, inventory_field, getattr(profile, inventory_field) + 1)
    db.add(StoreTransaction(
        account_id=account.id,
        request_id=str(request.request_id),
        item_id=request.item_id,
        currency=currency,
        amount=price,
        balance_before=balance_before,
        balance_after=balance_before - price,
    ))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Purchase could not be completed; retry once")
    db.refresh(profile)
    return _store_status(db, account.id, profile)
