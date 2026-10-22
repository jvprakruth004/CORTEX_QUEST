"""Focused tests for authenticated practice delivery and server lifelines."""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.account import PlayerProfile
from app.models.content import DifficultyLevel, Module, Question, QuestionOption, Submodule
from app.models.quiz_history import QuizAttempt


@pytest.fixture
def isolated_question(db_session: Session):
    suffix = uuid.uuid4().hex[:8]
    module = Module(slug=f"it{suffix}", name="Integration Test", emoji="T", display_order=900)
    db_session.add(module)
    db_session.flush()
    submodule = Submodule(
        module_id=module.id,
        slug=f"it{suffix}-sub",
        name="Integration Test Submodule",
        display_order=1,
        is_active=1,
    )
    difficulty = db_session.query(DifficultyLevel).filter_by(slug="easy").one()
    db_session.add(submodule)
    db_session.flush()
    question = Question(
        module_id=module.id,
        submodule_id=submodule.id,
        difficulty_id=difficulty.id,
        level_number=50,
        question_text=f"Integration question {suffix}?",
        hint_text="Think about the underlying definition.",
        explanation="This is the test explanation.",
        is_active=1,
        source="integration-test",
    )
    db_session.add(question)
    db_session.flush()
    options = [
        QuestionOption(
            question_id=question.id,
            option_text=f"Choice {index}",
            is_correct=int(index == 2),
            display_order=index,
        )
        for index in range(4)
    ]
    db_session.add_all(options)
    db_session.flush()
    return module, submodule, question, options


@pytest.mark.asyncio
async def test_practice_lifelines_are_private_safe_and_limited(
    async_client: AsyncClient, guest_account: dict, db_session: Session, isolated_question
):
    module, submodule, question, options = isolated_question
    headers = guest_account["headers"]
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.coins = 100
    profile.diamonds = 100
    db_session.commit()

    bought_hint = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "hint", "request_id": "f9c3d2ec-b6c8-4a5f-82c1-93637bcf407b"},
        headers=headers,
    )
    assert bought_hint.status_code == 200
    assert bought_hint.json()["balances"]["coins"] == 90
    assert bought_hint.json()["inventory"]["hint"] == 1
    bought_fifty_fifty = await async_client.post(
        "/api/store/purchase",
        json={"item_id": "5050", "request_id": "d82b483e-fd56-49f7-9fe3-cadd2e31f749"},
        headers=headers,
    )
    assert bought_fifty_fifty.status_code == 200
    assert bought_fifty_fifty.json()["balances"]["diamonds"] == 95
    assert bought_fifty_fifty.json()["inventory"]["fifty_fifty"] == 1

    delivered = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    assert delivered.status_code == 200
    data = delivered.json()
    assert len(data["questions"]) == 1 and data["session_id"]
    assert "hint_text" not in data["questions"][0]
    assert all("is_correct" not in option for option in data["questions"][0]["options"])

    payload = {"session_id": data["session_id"], "question_id": question.id}
    hint = await async_client.post("/api/quiz/lifeline/hint", json=payload, headers=headers)
    assert hint.status_code == 200
    assert hint.json()["hint"] == question.hint_text
    assert hint.json()["coins"] == 90
    assert hint.json()["inventory_hint"] == 0
    assert (await async_client.post("/api/quiz/lifeline/hint", json=payload, headers=headers)).status_code == 409

    half = await async_client.post("/api/quiz/lifeline/5050", json=payload, headers=headers)
    assert half.status_code == 200
    removed = half.json()["removed_option_ids"]
    assert len(removed) == 2
    assert options[2].id not in removed
    assert half.json()["diamonds"] == 95
    assert half.json()["inventory_5050"] == 0
    assert (await async_client.post("/api/quiz/lifeline/5050", json=payload, headers=headers)).status_code == 409

    store = await async_client.get("/api/store", headers=headers)
    assert store.status_code == 200
    assert store.json()["balances"] == {"coins": 90, "diamonds": 95}
    assert store.json()["inventory"] == {"hint": 0, "fifty_fifty": 0}
    assert [txn["item_id"] for txn in store.json()["transactions"]] == ["5050", "hint"]

    next_session = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    no_stock = await async_client.post(
        "/api/quiz/lifeline/hint",
        json={"session_id": next_session.json()["session_id"], "question_id": question.id},
        headers=headers,
    )
    assert no_stock.status_code == 422
    no_fifty_fifty = await async_client.post(
        "/api/quiz/lifeline/5050",
        json={"session_id": next_session.json()["session_id"], "question_id": question.id},
        headers=headers,
    )
    assert no_fifty_fifty.status_code == 422
    assert db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one().coins == 90
    assert db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one().diamonds == 95

    empty = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 49},
        headers=headers,
    )
    assert empty.status_code == 200
    assert empty.json()["total"] == 0 and empty.json()["session_id"] is None


@pytest.mark.asyncio
async def test_answer_feedback_is_immediate_locked_and_compatible_with_submission(
    async_client: AsyncClient, guest_account: dict, isolated_question
):
    module, submodule, question, options = isolated_question
    headers = guest_account["headers"]
    delivered = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    assert delivered.status_code == 200
    session_id = delivered.json()["session_id"]
    wrong_option = options[0]
    answer_payload = {
        "session_id": session_id,
        "question_id": question.id,
        "selected_option_id": wrong_option.id,
        "time_seconds": 6,
    }

    answer = await async_client.post("/api/quiz/answer", json=answer_payload, headers=headers)
    assert answer.status_code == 200
    feedback = answer.json()
    assert feedback["correct"] is False
    assert feedback["selected_option_id"] == wrong_option.id
    assert feedback["correct_option_id"] == options[2].id
    assert feedback["correct_option_text"] == options[2].option_text
    assert feedback["explanation"] == question.explanation

    repeated = await async_client.post("/api/quiz/answer", json=answer_payload, headers=headers)
    assert repeated.status_code == 200
    assert repeated.json() == feedback
    changed_answer = await async_client.post(
        "/api/quiz/answer",
        json={**answer_payload, "selected_option_id": options[1].id},
        headers=headers,
    )
    assert changed_answer.status_code == 409

    submitted = await async_client.post(
        "/api/quiz/submit",
        json={
            "session_type": "practice",
            "session_id": session_id,
            "module": module.slug,
            "submodule": submodule.slug,
            "difficulty": "easy",
            "level": 50,
            "answers": [{
                "question_id": question.id,
                "selected_option_id": wrong_option.id,
                "time_seconds": 6,
            }],
        },
        headers=headers,
    )
    assert submitted.status_code == 200
    assert submitted.json()["results"][0]["correct"] is False


@pytest.mark.asyncio
async def test_answer_feedback_is_immediate_locked_and_compatible_with_submission(
    async_client: AsyncClient, guest_account: dict, isolated_question
):
    module, submodule, question, options = isolated_question
    headers = guest_account["headers"]
    delivered = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    assert delivered.status_code == 200
    session_id = delivered.json()["session_id"]
    wrong_option = options[0]
    answer_payload = {
        "session_id": session_id,
        "question_id": question.id,
        "selected_option_id": wrong_option.id,
        "time_seconds": 6,
    }

    answer = await async_client.post("/api/quiz/answer", json=answer_payload, headers=headers)
    assert answer.status_code == 200
    feedback = answer.json()
    assert feedback["correct"] is False
    assert feedback["selected_option_id"] == wrong_option.id
    assert feedback["correct_option_id"] == options[2].id
    assert feedback["correct_option_text"] == options[2].option_text
    assert feedback["explanation"] == question.explanation

    repeated = await async_client.post("/api/quiz/answer", json=answer_payload, headers=headers)
    assert repeated.status_code == 200
    assert repeated.json() == feedback
    changed_answer = await async_client.post(
        "/api/quiz/answer",
        json={**answer_payload, "selected_option_id": options[1].id},
        headers=headers,
    )
    assert changed_answer.status_code == 409

    submitted = await async_client.post(
        "/api/quiz/submit",
        json={
            "session_type": "practice",
            "session_id": session_id,
            "module": module.slug,
            "submodule": submodule.slug,
            "difficulty": "easy",
            "level": 50,
            "answers": [{
                "question_id": question.id,
                "selected_option_id": wrong_option.id,
                "time_seconds": 6,
            }],
        },
        headers=headers,
    )
    assert submitted.status_code == 200
    assert submitted.json()["results"][0]["correct"] is False


@pytest.mark.asyncio
async def test_module_level_practice_includes_child_questions_and_submits(
    async_client: AsyncClient, guest_account: dict, isolated_question
):
    module, _submodule, question, options = isolated_question
    headers = guest_account["headers"]

    delivered = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    assert delivered.status_code == 200
    response_data = delivered.json()
    assert response_data["total"] == 1
    assert response_data["questions"][0]["id"] == question.id
    assert response_data["session_id"]

    submitted = await async_client.post(
        "/api/quiz/submit",
        json={
            "session_type": "practice",
            "session_id": response_data["session_id"],
            "module": module.slug,
            "difficulty": "easy",
            "level": 50,
            "answers": [{
                "question_id": question.id,
                "selected_option_id": options[2].id,
                "time_seconds": 8,
            }],
        },
        headers=headers,
    )
    assert submitted.status_code == 200
    assert submitted.json()["results"][0]["correct"] is True
    assert submitted.json()["submodule"] is None


@pytest.mark.asyncio
async def test_submission_persists_once_and_is_account_scoped(
    async_client: AsyncClient, guest_account: dict, db_session: Session, isolated_question
):
    module, submodule, question, options = isolated_question
    headers = guest_account["headers"]
    profile = db_session.query(PlayerProfile).filter_by(account_id=guest_account["account_id"]).one()
    profile.xp = 190
    profile.diamonds = 2
    db_session.commit()
    delivered = await async_client.get(
        "/api/quiz/practice",
        params={"module": module.slug, "submodule": submodule.slug, "difficulty": "easy", "level": 50},
        headers=headers,
    )
    assert delivered.status_code == 200
    payload = {
        "session_type": "practice",
        "session_id": delivered.json()["session_id"],
        "module": module.slug,
        "submodule": submodule.slug,
        "difficulty": "easy",
        "level": 50,
        "answers": [{"question_id": question.id, "selected_option_id": options[2].id, "time_seconds": 12}],
    }
    response = await async_client.post("/api/quiz/submit", json=payload, headers=headers)
    assert response.status_code == 200
    result = response.json()
    assert result["results"][0]["correct"] is True
    assert result["summary"]["accuracy_percent"] == 100
    assert result["rewards"]["xp_earned"] == 20
    assert result["rewards"]["coins_earned"] == 5
    assert result["rewards"]["stars_earned"] == 3
    assert result["rewards"]["diamonds_earned"] == 1

    repeated = await async_client.post("/api/quiz/submit", json=payload, headers=headers)
    assert repeated.status_code == 200 and repeated.json() == result
    assert db_session.query(QuizAttempt).filter_by(account_id=guest_account["account_id"]).count() == 1

    profile = (await async_client.get("/api/auth/me", headers=headers)).json()["profile"]
    assert (profile["xp"], profile["coins"], profile["stars"], profile["diamonds"]) == (210, 5, 3, 3)
    progress = (await async_client.get("/api/quiz/progress/v2", headers=headers)).json()
    module_progress = next(item for item in progress["modules"] if item["module_slug"] == module.slug)
    difficulty_progress = next(item for item in module_progress["difficulties"] if item["difficulty"] == "easy")
    submodule_progress = next(item for item in difficulty_progress["submodules"] if item["submodule"] == submodule.slug)
    level_progress = next(item for item in submodule_progress["levels"] if item["level"] == 50)
    assert level_progress["completed"] is True

    second = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
    try:
        guest = await second.post("/api/auth/guest", json={})
        other_headers = {"Authorization": f"Bearer {guest.json()['access_token']}"}
        denied = await second.post(
            "/api/quiz/lifeline/5050",
            json={"session_id": payload["session_id"], "question_id": question.id},
            headers=other_headers,
        )
        assert denied.status_code == 404
        other_progress = (await second.get("/api/quiz/progress/v2", headers=other_headers)).json()
        other_module = next(item for item in other_progress["modules"] if item["module_slug"] == module.slug)
        other_difficulty = next(item for item in other_module["difficulties"] if item["difficulty"] == "easy")
        other_submodule = next(item for item in other_difficulty["submodules"] if item["submodule"] == submodule.slug)
        other_level = next(item for item in other_submodule["levels"] if item["level"] == 50)
        assert other_level["completed"] is False
    finally:
        await second.aclose()
