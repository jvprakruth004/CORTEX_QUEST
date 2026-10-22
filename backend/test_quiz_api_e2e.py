"""
End-to-End Quiz API Verification Test Suite for Cortex Quest.

Verifies the complete quiz API workflow against cortex_quest_test:
1. Modules retrieval (all 8 modules, single module, 404 handling).
2. Question delivery (4 options, is_correct masked, explanation masked).
3. Quiz submission and server-side evaluation.
4. Rejection of invalid submissions (invalid question ID, invalid option ID,
   option mismatch, duplicate questions).
5. Results payload structure (accuracy, score, explanation reveal).
6. Server-side reward enforcement (ignoring client-tampered reward payloads).
7. History and progress persistence (attempts list, attempt detail, summary, progress).
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.content import Question, Module, DifficultyLevel


class TestQuizApiE2E:
    """Complete End-to-End verification of the Quiz API workflows."""

    MODULE_SLUGS = ["apt", "di", "lr", "gk", "prog", "cs", "eng", "med"]

    # =========================================================================
    # 1. MODULES WORKFLOW
    # =========================================================================
    @pytest.mark.asyncio
    async def test_all_eight_modules_can_be_retrieved(self, async_client: AsyncClient):
        """Verify that GET /api/modules returns all 8 active modules."""
        resp = await async_client.get("/api/modules")
        assert resp.status_code == 200, f"Failed to list modules: {resp.text}"
        data = resp.json()
        assert "modules" in data
        assert data["total"] == 8
        slugs = [m["slug"] for m in data["modules"]]
        assert sorted(slugs) == sorted(self.MODULE_SLUGS)

        for mod in data["modules"]:
            assert "id" in mod
            assert "name" in mod
            assert "emoji" in mod
            assert "description" in mod
            assert "display_order" in mod

    @pytest.mark.asyncio
    async def test_single_module_retrieval_and_404(self, async_client: AsyncClient):
        """Verify that GET /api/modules/{slug} works for each module and returns 404 for invalid."""
        for slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{slug}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["slug"] == slug
            assert len(data["name"]) > 0

        # Invalid module slug
        resp_invalid = await async_client.get("/api/modules/nonexistent_slug")
        assert resp_invalid.status_code == 404
        assert resp_invalid.json()["detail"] == "Module not found"

    # =========================================================================
    # 2. QUESTION RETRIEVAL WORKFLOW
    # =========================================================================
    @pytest.mark.asyncio
    async def test_question_retrieval_masks_answers_and_explanations(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Verify practice delivery masks correct answers and explanations across all 8 modules."""
        headers = guest_account["headers"]
        for slug in self.MODULE_SLUGS:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": slug, "difficulty": "easy", "level": 1, "count": 5},
                headers=headers,
            )
            assert resp.status_code == 200, f"Module {slug} failed: {resp.text}"
            data = resp.json()
            assert data["module"] == slug
            assert data["difficulty"] == "easy"
            assert data["level"] == 1
            assert len(data["questions"]) >= 5

            for q in data["questions"]:
                assert "id" in q
                assert "question_text" in q
                assert len(q["question_text"]) > 0

                # EXPLANATION must NOT be exposed before submission
                assert "explanation" not in q, f"Question {q['id']} exposed explanation!"

                # Options check: exactly 4 options
                assert len(q["options"]) == 4, f"Question {q['id']} does not have 4 options"
                display_orders = []
                for opt in q["options"]:
                    assert "id" in opt
                    assert "text" in opt
                    assert "display_order" in opt
                    display_orders.append(opt["display_order"])

                    # IS_CORRECT must NOT be exposed before submission
                    assert "is_correct" not in opt, f"Option {opt['id']} exposed is_correct!"

                assert sorted(display_orders) == [0, 1, 2, 3]

    # =========================================================================
    # 3. QUIZ SUBMISSION WORKFLOW
    # =========================================================================
    @pytest.mark.asyncio
    async def test_valid_quiz_submission_and_evaluation(
        self,
        async_client: AsyncClient,
        guest_account: dict,
        db_session: Session
    ):
        """Submit a practice quiz and verify server evaluates correctness accurately."""
        headers = guest_account["headers"]

        # Fetch practice questions for apt
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 3},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]

        # Look up true correct option IDs in database to submit intentional answers
        submission_answers = []
        expected_evaluations = {}

        for i, q in enumerate(questions):
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            wrong_opt = next(o for o in db_q.options if o.is_correct == 0)

            # Answer first 2 correctly, 3rd incorrectly
            if i < 2:
                selected_id = correct_opt.id
                expected_evaluations[q["id"]] = True
            else:
                selected_id = wrong_opt.id
                expected_evaluations[q["id"]] = False

            submission_answers.append({
                "question_id": q["id"],
                "selected_option_id": selected_id,
                "time_seconds": 12,
            })

        # Submit attempt
        submit_payload = {
            "session_type": "practice",
            "session_id": resp.json()["session_id"],
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": submission_answers,
        }
        submit_resp = await async_client.post("/api/quiz/submit", json=submit_payload, headers=headers)
        assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
        data = submit_resp.json()

        assert data["session_type"] == "practice"
        assert data["module"] == "apt"
        assert len(data["results"]) == 3

        for res in data["results"]:
            qid = res["question_id"]
            assert res["correct"] == expected_evaluations[qid]
            assert "correct_option_id" in res
            assert "explanation" in res
            assert len(res["explanation"]) > 0

        # Verify summary counts
        summary = data["summary"]
        assert summary["total_questions"] == 3
        assert summary["correct_answers"] == 2
        assert summary["incorrect_answers"] == 1
        assert summary["accuracy_percent"] == 67
        assert summary["total_time_seconds"] == 36

    # =========================================================================
    # 4. INVALID SUBMISSIONS WORKFLOW
    # =========================================================================
    @pytest.mark.asyncio
    async def test_invalid_submissions_are_safely_rejected(
        self,
        async_client: AsyncClient,
        guest_account: dict,
        db_session: Session
    ):
        """Test rejection of non-existent question IDs, option IDs, cross-question options, and duplicates."""
        headers = guest_account["headers"]

        # Get 2 real questions from apt
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp.status_code == 200
        q1 = resp.json()["questions"][0]
        q2 = resp.json()["questions"][1]

        # 4a. Non-existent question ID (Expect 404)
        resp_bad_q = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": [{"question_id": 9999999, "selected_option_id": q1["options"][0]["id"], "time_seconds": 5}],
            },
            headers=headers
        )
        assert resp_bad_q.status_code == 404
        assert "Questions not found" in resp_bad_q.json()["detail"]

        # 4b. Non-existent option ID (Expect 422)
        resp_bad_opt = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": [{"question_id": q1["id"], "selected_option_id": 9999999, "time_seconds": 5}],
            },
            headers=headers
        )
        assert resp_bad_opt.status_code == 422
        assert "not found" in resp_bad_opt.json()["detail"]

        # 4c. Option belonging to another question (Expect 422)
        resp_mismatch_opt = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": [
                    # Give Q1 the option ID from Q2!
                    {"question_id": q1["id"], "selected_option_id": q2["options"][0]["id"], "time_seconds": 5}
                ],
            },
            headers=headers
        )
        assert resp_mismatch_opt.status_code == 422
        assert "does not belong to question" in resp_mismatch_opt.json()["detail"]

        # 4d. Duplicate question IDs in answers list (Expect 422)
        resp_dup = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": [
                    {"question_id": q1["id"], "selected_option_id": q1["options"][0]["id"], "time_seconds": 5},
                    {"question_id": q1["id"], "selected_option_id": q1["options"][1]["id"], "time_seconds": 5},
                ],
            },
            headers=headers
        )
        assert resp_dup.status_code == 422
        assert "Duplicate question IDs" in resp_dup.json()["detail"]

        # 4e. Empty answers list (Expect 422)
        resp_empty = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": [],
            },
            headers=headers
        )
        assert resp_empty.status_code == 422

    # =========================================================================
    # 5 & 6. RESULTS & SERVER-SIDE REWARD ENFORCEMENT
    # =========================================================================
    @pytest.mark.asyncio
    async def test_rewards_calculated_server_side_and_client_tampering_ignored(
        self,
        async_client: AsyncClient,
        guest_account: dict,
        db_session: Session
    ):
        """Verify server calculates XP and coins and ignores client-injected reward values."""
        headers = guest_account["headers"]

        # Fetch 2 practice questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "cs", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]

        # Answer both 100% correctly
        answers = []
        for q in questions:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
                # Attempt to inject client-side forged correctness
                "is_correct": False,
            })

        # Inject fake high rewards in payload
        payload = {
            "session_type": "practice",
            "session_id": resp.json()["session_id"],
            "module": "cs",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
            "xp_earned": 999999,
            "coins_earned": 999999,
            "stars_earned": 50,
        }

        submit_resp = await async_client.post("/api/quiz/submit", json=payload, headers=headers)
        assert submit_resp.status_code == 200
        data = submit_resp.json()

        # 100% accuracy on easy difficulty (multiplier 1.0)
        # Expected base rewards: 2 correct * 20 XP = 40 XP; 2 correct * 5 coins = 10 coins
        # Accuracy >= 100% -> 3 stars
        rewards = data["rewards"]
        assert rewards["xp_earned"] == 40, f"Expected 40 XP, got {rewards['xp_earned']}"
        assert rewards["coins_earned"] == 10, f"Expected 10 coins, got {rewards['coins_earned']}"
        assert rewards["stars_earned"] == 3, f"Expected 3 stars, got {rewards['stars_earned']}"

    # =========================================================================
    # 7. HISTORY AND PROGRESS WORKFLOW
    # =========================================================================
    @pytest.mark.asyncio
    async def test_quiz_history_and_progress_retrieval(
        self,
        async_client: AsyncClient,
        guest_account: dict,
        db_session: Session
    ):
        """Submit a quiz attempt and verify it appears in attempts history and progress."""
        headers = guest_account["headers"]

        # Submit an attempt for gk level 1
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "gk", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]

        answers = []
        for q in questions:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 8,
            })

        submit_resp = await async_client.post(
            "/api/quiz/submit",
            json={
                "session_type": "practice",
                "session_id": resp.json()["session_id"],
                "module": "gk",
                "difficulty": "easy",
                "level": 1,
                "answers": answers,
            },
            headers=headers
        )
        assert submit_resp.status_code == 200

        # 7a. GET /api/quiz/attempts
        attempts_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert attempts_resp.status_code == 200
        attempts_data = attempts_resp.json()
        assert attempts_data["total"] >= 1
        latest_attempt = attempts_data["attempts"][0]
        assert latest_attempt["module"] == "gk"
        assert latest_attempt["difficulty"] == "easy"
        assert latest_attempt["level"] == 1
        assert latest_attempt["accuracy_percent"] == 100
        attempt_id = latest_attempt["id"]

        # 7b. GET /api/quiz/attempts/{attempt_id}
        detail_resp = await async_client.get(f"/api/quiz/attempts/{attempt_id}", headers=headers)
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert detail_data["id"] == attempt_id
        assert len(detail_data["questions"]) == 2
        for q_detail in detail_data["questions"]:
            assert q_detail["is_correct"] is True
            assert len(q_detail["question_text"]) > 0
            assert len(q_detail["explanation"]) > 0

        # 7c. GET /api/quiz/attempts/summary
        summary_resp = await async_client.get("/api/quiz/attempts/summary", headers=headers)
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert summary_data["total_attempts"] >= 1
        assert summary_data["total_questions"] >= 2
        assert summary_data["total_correct"] >= 2

        # 7d. GET /api/quiz/progress
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        assert progress_resp.status_code == 200
        prog_data = progress_resp.json()
        assert "profile" in prog_data
        assert prog_data["profile"]["stars"] >= 3

        # Locate gk module progress
        gk_module_prog = next(m for m in prog_data["modules"] if m["module_slug"] == "gk")
        # Locate easy level 1 progress
        l1_prog = next(l for l in gk_module_prog["levels"] if l["difficulty"] == "easy" and l["level"] == 1)
        assert l1_prog["stars_earned"] == 3
        assert l1_prog["best_accuracy"] == 100
        assert l1_prog["completed_at"] is not None

