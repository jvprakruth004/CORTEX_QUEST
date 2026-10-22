"""Disabled database recreation helper.

Project safety policy prohibits recreating databases from application
utilities. Use reviewed Alembic migrations for schema changes. If an isolated
test database does not exist, use the separately guarded create_test_db.py
helper after explicit approval; never target the development database.
"""

raise SystemExit(
    "Database recreation is disabled. Use Alembic for schema changes and "
    "preserve existing database contents."
)
