"""Rollback-only authentication refresh smoke test for cortex_quest_test.

Run from `backend` with its virtual environment active. This script refuses
to connect to any database other than the isolated test database.
"""

import asyncio
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.engine import make_url  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.config import Settings, get_settings  # noqa: E402

database_url = (
    os.environ.get("CORTEX_QUEST_TEST_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or Settings(_env_file=BACKEND_DIR / ".env").database_url
)
if make_url(database_url).database != "cortex_quest_test":
    raise SystemExit("Refusing to run: configured database is not cortex_quest_test")

os.environ["DATABASE_URL"] = database_url
os.environ["SECRET_KEY"] = "test-only-secret-key-min-32-characters"
os.environ["ENVIRONMENT"] = "test"
get_settings.cache_clear()

engine = create_engine(database_url)
try:
    connection = engine.connect()
    transaction = connection.begin()
    actual_database = connection.execute(text("SELECT current_database()")).scalar_one()
    if actual_database != "cortex_quest_test":
        transaction.rollback()
        connection.close()
        raise SystemExit("Refusing to run: database server returned an unexpected target")
    db = sessionmaker(bind=connection, expire_on_commit=False)()

    try:
        from app.main import app
        from app.database import get_db

        def override_get_db():
            yield db

        app.dependency_overrides[get_db] = override_get_db

        async def verify_refresh_flow():
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                guest = await client.post("/api/auth/guest", json={})
                assert guest.status_code == 201
                assert client.cookies.get("access_token")
                assert client.cookies.get("refresh_token")

                client.cookies.set("access_token", "invalid-access-token")
                expired_access = await client.get("/api/auth/me")
                assert expired_access.status_code == 401

                refreshed = await client.post("/api/auth/refresh")
                assert refreshed.status_code == 200
                assert refreshed.json()["access_token"] != "invalid-access-token"
                client.cookies.clear()
                client.cookies.update(
                    {
                        "access_token": refreshed.json()["access_token"],
                        "refresh_token": refreshed.json()["refresh_token"],
                    }
                )
                assert (await client.get("/api/auth/me")).status_code == 200

                logged_out = await client.post("/api/auth/logout")
                assert logged_out.status_code == 200
                assert (await client.post("/api/auth/refresh")).status_code == 401

        asyncio.run(verify_refresh_flow())
        print("Auth refresh, session restoration, and logout checks passed.")
    finally:
        app.dependency_overrides.clear()
        db.close()
        transaction.rollback()
        connection.close()
finally:
    engine.dispose()
