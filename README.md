# Cortex Quest

Cortex Quest is a vanilla JavaScript learning and aptitude game in `a2`, backed by the FastAPI service in `backend`. The original `a2` interface and quiz engine remain in use; database practice is routed through that engine while mock quizzes and other local games keep their local behavior.

## Local development

1. Configure the backend environment in `backend/.env` with `DATABASE_URL`, `SECRET_KEY`, `ENVIRONMENT`, and (when needed) `CORS_ORIGINS`. Keep real values out of source control and logs. The API expects PostgreSQL.
2. From `backend`, create/activate the project virtual environment, install `requirements.txt`, and start the API:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
   ```

3. From the project root, serve the existing frontend:

   ```powershell
   python -m http.server 5500 --bind 127.0.0.1
   ```

4. Open `http://127.0.0.1:5500/a2/index.html`. The frontend API base is configured once in `a2/script.js` as `http://127.0.0.1:8001/api`.

The API allows the local frontend origin `http://127.0.0.1:5500` with credentialed requests. Authentication uses short-lived access tokens and HttpOnly access/refresh cookies; the frontend keeps its bearer access token in memory and uses the refresh cookie for session recovery. Do not copy tokens or passwords into logs or browser storage.

## Database and migrations

Use Alembic for schema changes. Before running any migration, inspect the configured database name without printing the URL, then confirm `alembic current` and review the migration. Use `cortex_quest_test` for integration tests. Never reset or recreate `cortex_quest`, and do not use `Base.metadata.create_all()`.

From `backend`, inspect and apply reviewed migrations with:

```powershell
.\.venv\Scripts\alembic.exe current
.\.venv\Scripts\alembic.exe upgrade head
```

The practice-session/lifeline schema is revision `20261020_practice_sessions` (adds optional question hint content, practice sessions, and one-use lifeline records). The migration is additive and has been applied to both `cortex_quest_test` and the verified `cortex_quest` database through Alembic.

## API integration

All application routes are mounted below `/api`.

| Area | Routes used by `a2` |
| --- | --- |
| Authentication | `POST /auth/guest`, `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/me` |
| Practice | `GET /quiz/practice`; `POST /quiz/submit` |
| Lifelines | `POST /quiz/lifeline/hint`; `POST /quiz/lifeline/5050` |
| Progress | `GET /quiz/progress/v2` |

The backend also exposes `GET /quiz/attempts`, `/quiz/attempts/{attempt_id}`, and `/quiz/attempts/summary`. `a2` uses the authenticated summary endpoint to restore its existing Profile counters. There is no separate attempt-history or analytics screen in the current UI, so no new dashboard was added.

Question delivery omits correctness, explanations, and hint text. A module-level request returns questions belonging to that module; selecting a submodule narrows delivery to that exact submodule. The original 100 curated sample questions have validated assignments to existing, module-owned submodules and are reachable through the primary submodule navigation. The development database currently contains 800 active questions: those 100 samples, three other pre-existing questions, and 697 imported additions. The test database is managed separately and may contain different data. The question bank covers levels 1-3; later levels and some submodule/difficulty combinations remain empty. Current Affairs, Engineering Mathematics, and Data Interpretation Caselet Analysis have no curated samples yet and retain the existing empty state. Submission sends database question/option IDs and is scored on the server. A practice session binds the delivered question set to the authenticated account; replaying the same completed session returns its stored result without awarding rewards again. Server XP/coins/stars and level-up diamonds persist; diamonds follow the existing one-per-200-XP level-up rule. Server progress, profile balances, and quiz summary statistics refresh from the backend. Local mock quiz and game state remains browser-local.

Hints remain optional per question. The 100 entries in `backend/data/sample_questions.json` contain authored, checked hint text. The guarded importer adds questions without replacing existing data; the development database currently has 697 additions alongside its 103 pre-existing questions. The development and test databases are managed independently. `scripts/apply_question_hints.py` also added hints to the three exact pre-existing development questions without inserting or deleting questions. Importing into development requires explicit `--target-db cortex_quest --apply --confirm-db`; the importer verifies both the URL database name and PostgreSQL `current_database()`. The submodule retrieval test checks every original curated entry through the API. A question without a safe authored hint still reports unavailable without charging coins.

## Tests

Test setup is isolated by `backend/conftest.py`: it refuses to start unless the configured test URL names `cortex_quest_test`, and per-test database transactions are rolled back. Set `CORTEX_QUEST_TEST_DATABASE_URL` to the test connection when it is not the normal `DATABASE_URL`; the guard checks the database name and does not print the URL.

Install test-only dependencies into the backend virtual environment and run focused tests from `backend`:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest test_practice_sessions.py -q
```

No browser automation dependency is included. Manual browser checks are still required for the complete account and game flows, especially guest-session restoration, database practice through the existing renderer, logout/login progress restoration, account switching, local mock quizzes, lifelines, Block Puzzle, audio, themes, and responsive layout.
