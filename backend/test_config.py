"""Fail-closed configuration checks; these tests do not connect to a database."""

import pytest
from pydantic import ValidationError

from app.config import Settings


def test_database_url_and_strong_secret_are_required(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("CORTEX_QUEST_TEST_DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with pytest.raises(ValidationError):
        Settings(_env_file=None, secret_key="x" * 32)

    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            database_url="postgresql://example:example@localhost/cortex_quest_test",
            secret_key="short",
        )

    configured = Settings(
        _env_file=None,
        database_url="postgresql://example:example@localhost/cortex_quest_test",
        secret_key="x" * 32,
    )
    assert len(configured.secret_key) >= 32
