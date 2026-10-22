"""Store purchases and lifeline inventory remain account-scoped and atomic."""
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.account import PlayerProfile
from app.models.store import StoreTransaction


@pytest.mark.asyncio
async def test_purchase_records_balance_and_increments_inventory(
    async_client: AsyncClient,
    guest_account: dict,
    db_session: Session,
):
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.coins = 20
    profile.diamonds = 10
    db_session.commit()

    hint = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "hint", "request_id": str(uuid4())},
        headers=guest_account["headers"],
    )
    assert hint.status_code == 200
    data = hint.json()
    assert data["balances"] == {"coins": 10, "diamonds": 10}
    assert data["inventory"] == {"hint": 1, "fifty_fifty": 0}
    assert data["transactions"][0]["item_id"] == "hint"
    assert data["transactions"][0]["amount"] == 10
    assert data["transactions"][0]["balance_before"] == 20
    assert data["transactions"][0]["balance_after"] == 10

    fifty_fifty = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "5050", "request_id": str(uuid4())},
        headers=guest_account["headers"],
    )
    assert fifty_fifty.status_code == 200
    assert fifty_fifty.json()["balances"] == {"coins": 10, "diamonds": 5}
    assert fifty_fifty.json()["inventory"] == {"hint": 1, "fifty_fifty": 1}
    assert db_session.query(StoreTransaction).filter_by(account_id=guest_account["account_id"]).count() == 2


@pytest.mark.asyncio
async def test_insufficient_balance_does_not_change_inventory_or_history(
    async_client: AsyncClient,
    guest_account: dict,
    db_session: Session,
):
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.coins = 9
    db_session.commit()

    response = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "hint", "request_id": str(uuid4())},
        headers=guest_account["headers"],
    )
    assert response.status_code == 422
    assert db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one().coins == 9
    assert db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one().hint_inventory == 0
    assert db_session.query(StoreTransaction).filter_by(account_id=guest_account["account_id"]).count() == 0


@pytest.mark.asyncio
async def test_replayed_purchase_request_is_not_charged_twice(
    async_client: AsyncClient,
    guest_account: dict,
    db_session: Session,
):
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.coins = 20
    db_session.commit()
    payload = {"item_id": "hint", "request_id": "cbdc39d8-6244-42a1-a6e3-565d83f2fe53"}

    first = await async_client.post("/api/store/purchase", json=payload, headers=guest_account["headers"])
    replay = await async_client.post("/api/store/purchase", json=payload, headers=guest_account["headers"])

    assert first.status_code == replay.status_code == 200
    assert replay.json()["balances"]["coins"] == 10
    assert replay.json()["inventory"]["hint"] == 1
    assert db_session.query(StoreTransaction).filter_by(account_id=guest_account["account_id"]).count() == 1


@pytest.mark.asyncio
async def test_store_is_private_to_authenticated_account(
    async_client: AsyncClient,
    guest_account: dict,
    db_session: Session,
):
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.coins = 10
    db_session.commit()
    purchased = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "hint", "request_id": str(uuid4())},
        headers=guest_account["headers"],
    )
    assert purchased.status_code == 200

    other = await async_client.post("/api/auth/guest", json={})
    assert other.status_code == 201
    other_headers = {"Authorization": f"Bearer {other.json()['access_token']}"}

    private = await async_client.get("/api/store", headers=other_headers)
    assert private.status_code == 200
    assert private.json()["inventory"] == {"hint": 0, "fifty_fifty": 0}
    assert private.json()["transactions"] == []

    async_client.cookies.clear()
    unauthorized = await async_client.get("/api/store")
    assert unauthorized.status_code == 401
