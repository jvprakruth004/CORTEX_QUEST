"""Confirm the configured test connection points at cortex_quest_test."""

import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from app.config import Settings


database_url = (
    os.environ.get("CORTEX_QUEST_TEST_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or Settings(_env_file=Path(__file__).with_name(".env")).database_url
)
if make_url(database_url).database != "cortex_quest_test":
    raise SystemExit("Refusing to connect: configured database is not cortex_quest_test")

engine = create_engine(database_url)
try:
    with engine.connect() as connection:
        actual_database = connection.execute(text("SELECT current_database()")).scalar_one()
    if actual_database != "cortex_quest_test":
        raise SystemExit("Refusing to continue: server connected to an unexpected database")
    print("Connected to isolated cortex_quest_test database.")
finally:
    engine.dispose()
