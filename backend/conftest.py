import os
from pathlib import Path
from sqlalchemy.engine import make_url
from app.config import Settings, get_settings

_test_database_url = (
    os.environ.get("CORTEX_QUEST_TEST_DATABASE_URL")
    or os.environ.get("DATABASE_URL")
    or Settings(_env_file=Path(__file__).with_name(".env")).database_url
)
if make_url(_test_database_url).database != "cortex_quest_test":
    raise RuntimeError("Tests require the isolated cortex_quest_test database")
os.environ["DATABASE_URL"] = _test_database_url
os.environ["SECRET_KEY"] = "test-secret-key-min-32-characters-long"
os.environ["ENVIRONMENT"] = "test"
get_settings.cache_clear()
_TEST_DATABASE_URL = _test_database_url

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import get_db
from app import models as _models  # noqa: F401 - register SQLAlchemy models
from app.config import get_settings, Settings


class TestSettings(Settings):
    database_url: str = _TEST_DATABASE_URL
    secret_key: str = "test-secret-key-min-32-characters-long"
    environment: str = "test"


@pytest.fixture(scope="session")
def test_settings() -> Settings:
    return TestSettings()


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    engine = create_engine(
        _TEST_DATABASE_URL,
        poolclass=None,
    )
    connection = engine.connect()
    transaction = connection.begin()
    
    SessionLocal = sessionmaker(bind=connection, expire_on_commit=False)
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        transaction.rollback()
        connection.close()
        engine.dispose()


@pytest.fixture(scope="function")
def override_get_db(db_session: Session):
    """Override the get_db dependency to use the test session."""
    def _get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_client(override_get_db) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture(scope="function")
async def guest_account(async_client: AsyncClient) -> dict:
    """Create a guest account and return auth headers."""
    resp = await async_client.post("/api/auth/guest", json={})
    assert resp.status_code == 201
    auth_data = resp.json()
    return {
        "headers": {"Authorization": f"Bearer {auth_data['access_token']}"},
        "account_id": auth_data['account']['id'],
        "token": auth_data['access_token'],
    }


@pytest.fixture(scope="function")
async def test_questions(db_session: Session) -> dict:
    """Create test questions and return their IDs and correct option IDs."""
    from app.models.content import Module, DifficultyLevel, Question, QuestionOption
    
    # Get module and difficulty
    module = db_session.query(Module).filter(Module.slug == 'apt').first()
    difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
    difficulty_medium = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'medium').first()
    difficulty_hard = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'hard').first()
    
    if not module or not difficulty:
        raise Exception("Module or difficulty not found")
    
    # Question 1: Easy - for 100% accuracy tests
    q1 = Question(
        module_id=module.id,
        difficulty_id=difficulty.id,
        level_number=1,
        question_text="What is 20% of 150? (test)",
        explanation="150 * 20 / 100 = 30",
        is_active=1,
        source="test",
    )
    db_session.add(q1)
    db_session.flush()
    
    opts1 = [
        QuestionOption(question_id=q1.id, option_text="20", is_correct=0, display_order=0),
        QuestionOption(question_id=q1.id, option_text="30", is_correct=1, display_order=1),
        QuestionOption(question_id=q1.id, option_text="25", is_correct=0, display_order=2),
        QuestionOption(question_id=q1.id, option_text="35", is_correct=0, display_order=3),
    ]
    for opt in opts1:
        db_session.add(opt)
    
    # Question 2: Easy - for 50% accuracy tests
    q2 = Question(
        module_id=module.id,
        difficulty_id=difficulty.id,
        level_number=1,
        question_text="A shirt costs 400 and sells at 500. Profit %? (test)",
        explanation="Profit 100 / cost 400 = 25%",
        is_active=1,
        source="test",
    )
    db_session.add(q2)
    db_session.flush()
    
    opts2 = [
        QuestionOption(question_id=q2.id, option_text="20%", is_correct=0, display_order=0),
        QuestionOption(question_id=q2.id, option_text="25%", is_correct=1, display_order=1),
        QuestionOption(question_id=q2.id, option_text="30%", is_correct=0, display_order=2),
        QuestionOption(question_id=q2.id, option_text="10%", is_correct=0, display_order=3),
    ]
    for opt in opts2:
        db_session.add(opt)
    
    # Question 3: Medium - single question for 100% tests
    q3 = Question(
        module_id=module.id,
        difficulty_id=difficulty_medium.id,
        level_number=1,
        question_text="Medium question: 2+2? (test)",
        explanation="Basic addition",
        is_active=1,
        source="test",
    )
    db_session.add(q3)
    db_session.flush()
    
    opts3 = [
        QuestionOption(question_id=q3.id, option_text="3", is_correct=0, display_order=0),
        QuestionOption(question_id=q3.id, option_text="4", is_correct=1, display_order=1),
        QuestionOption(question_id=q3.id, option_text="5", is_correct=0, display_order=2),
        QuestionOption(question_id=q3.id, option_text="6", is_correct=0, display_order=3),
    ]
    for opt in opts3:
        db_session.add(opt)
    
    # Question 4: Easy - for 70% accuracy test (7 correct out of 10)
    # We'll create 10 questions for this
    q4_questions = []
    for i in range(10):
        q = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=2,
            question_text=f"Level 2 Q{i+1}: What is {i+1} + {i+1}? (test)",
            explanation=f"{i+1} + {i+1} = {2*(i+1)}",
            is_active=1,
            source="test",
        )
        db_session.add(q)
        db_session.flush()
        q4_questions.append(q)
        
        opts = [
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)), is_correct=1, display_order=0),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)+1), is_correct=0, display_order=1),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)-1), is_correct=0, display_order=2),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)+2), is_correct=0, display_order=3),
        ]
        for opt in opts:
            db_session.add(opt)
    
    # Question 5: Easy - for 85% accuracy test (17 correct out of 20)
    q5_questions = []
    for i in range(20):
        q = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=3,
            question_text=f"Level 3 Q{i+1}: What is {i+1} * 2? (test)",
            explanation=f"{i+1} * 2 = {2*(i+1)}",
            is_active=1,
            source="test",
        )
        db_session.add(q)
        db_session.flush()
        q5_questions.append(q)
        
        opts = [
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)), is_correct=1, display_order=0),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)+1), is_correct=0, display_order=1),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)-1), is_correct=0, display_order=2),
            QuestionOption(question_id=q.id, option_text=str(2*(i+1)+2), is_correct=0, display_order=3),
        ]
        for opt in opts:
            db_session.add(opt)
    
    db_session.commit()
    
    # Get correct option IDs
    opt1_correct = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()
    opt1_wrong = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 0).first()
    opt2_correct = db_session.query(QuestionOption).filter(QuestionOption.question_id == q2.id, QuestionOption.is_correct == 1).first()
    opt2_wrong = db_session.query(QuestionOption).filter(QuestionOption.question_id == q2.id, QuestionOption.is_correct == 0).first()
    opt3_correct = db_session.query(QuestionOption).filter(QuestionOption.question_id == q3.id, QuestionOption.is_correct == 1).first()
    
    q4_correct_opts = [db_session.query(QuestionOption).filter(QuestionOption.question_id == q.id, QuestionOption.is_correct == 1).first() for q in q4_questions]
    q4_wrong_opts = [db_session.query(QuestionOption).filter(QuestionOption.question_id == q.id, QuestionOption.is_correct == 0).first() for q in q4_questions]
    q5_correct_opts = [db_session.query(QuestionOption).filter(QuestionOption.question_id == q.id, QuestionOption.is_correct == 1).first() for q in q5_questions]
    q5_wrong_opts = [db_session.query(QuestionOption).filter(QuestionOption.question_id == q.id, QuestionOption.is_correct == 0).first() for q in q5_questions]
    
    return {
        'q1_id': q1.id, 'q1_correct_opt': opt1_correct.id, 'q1_wrong_opt': opt1_wrong.id,
        'q2_id': q2.id, 'q2_correct_opt': opt2_correct.id, 'q2_wrong_opt': opt2_wrong.id,
        'q3_id': q3.id, 'q3_correct_opt': opt3_correct.id,
        'q4_ids': [q.id for q in q4_questions],
        'q4_correct_opts': [o.id for o in q4_correct_opts],
        'q4_wrong_opts': [o.id for o in q4_wrong_opts],
        'q5_ids': [q.id for q in q5_questions],
        'q5_correct_opts': [o.id for o in q5_correct_opts],
        'q5_wrong_opts': [o.id for o in q5_wrong_opts],
    }
