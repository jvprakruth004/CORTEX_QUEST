"""Apply reviewed Alembic migrations to the isolated test database only."""

import os
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy.engine import make_url

from app.config import Settings


backend_dir = Path(__file__).resolve().parent
database_url = (
    os.environ.get("CORTEX_QUEST_TEST_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or Settings(_env_file=backend_dir / ".env").database_url
)
if make_url(database_url).database != "cortex_quest_test":
    raise SystemExit("Refusing to run migrations: configured database is not cortex_quest_test")

config = Config(str(backend_dir / "alembic.ini"))
config.set_main_option("script_location", str(backend_dir / "migrations"))
config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
command.upgrade(config, "head")
print("Applied Alembic migrations to isolated cortex_quest_test database.")
