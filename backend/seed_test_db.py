"""Seed the isolated test database only when it has no modules."""

import os
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.engine import make_url

from app.config import Settings


database_url = (
    os.environ.get("CORTEX_QUEST_TEST_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or Settings(_env_file=Path(__file__).with_name(".env")).database_url
)
if make_url(database_url).database != "cortex_quest_test":
    raise SystemExit("Refusing to seed: configured database is not cortex_quest_test")
os.environ["DATABASE_URL"] = database_url

from app.database import SessionLocal  # noqa: E402
from app.models.content import Module  # noqa: E402

db = SessionLocal()
try:
    actual_database = db.execute(text("SELECT current_database()")).scalar_one()
    if actual_database != "cortex_quest_test":
        raise SystemExit("Refusing to seed: database server returned an unexpected target")

    existing = db.query(Module).count()
    if existing:
        print(f"Modules already exist: {existing}; no changes made.")
    else:
        modules = [
            Module(slug="apt", name="General Aptitude", emoji="🧠", description="Quantitative and verbal aptitude", display_order=1),
            Module(slug="di", name="Data Interpretation", emoji="📊", description="Charts and data analysis", display_order=2),
            Module(slug="lr", name="Logical Reasoning", emoji="🔍", description="Logical and analytical reasoning", display_order=3),
            Module(slug="gk", name="General Knowledge", emoji="🌍", description="General knowledge", display_order=4),
            Module(slug="prog", name="Programming", emoji="💻", description="Programming practice", display_order=5),
            Module(slug="cs", name="Computer Science", emoji="🖥️", description="Computer science fundamentals", display_order=6),
            Module(slug="eng", name="Engineering", emoji="⚙️", description="Engineering fundamentals", display_order=7),
            Module(slug="med", name="Medical Basics", emoji="🩺", description="Medical basics", display_order=8),
        ]
        db.add_all(modules)
        db.commit()
        print("Seeded module catalog in isolated cortex_quest_test database.")
finally:
    db.close()
