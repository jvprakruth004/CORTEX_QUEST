"""Explicitly create only the isolated test database when authorized.

This helper never creates or modifies the development database. It requires
an explicit opt-in and a separate administrator URL targeting `postgres`.
"""

import os

import psycopg
from sqlalchemy.engine import make_url


if os.environ.get("CORTEX_QUEST_ALLOW_TEST_DATABASE_CREATE") != "1":
    raise SystemExit("Set CORTEX_QUEST_ALLOW_TEST_DATABASE_CREATE=1 to opt in")

admin_url = os.environ.get("CORTEX_QUEST_ADMIN_DATABASE_URL")
if not admin_url:
    raise SystemExit("Set CORTEX_QUEST_ADMIN_DATABASE_URL to an administrator connection")
if make_url(admin_url).database != "postgres":
    raise SystemExit("Refusing to connect: administrator URL must target the postgres database")

with psycopg.connect(admin_url, autocommit=True) as connection:
    database_names = connection.execute(
        "SELECT datname FROM pg_database WHERE datname = %s", ("cortex_quest_test",)
    ).fetchone()
    if database_names:
        print("Isolated test database already exists; no change made.")
    else:
        connection.execute('CREATE DATABASE "cortex_quest_test"')
        print("Created isolated cortex_quest_test database.")
