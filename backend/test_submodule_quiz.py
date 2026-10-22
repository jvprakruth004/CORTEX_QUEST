"""
Tests for submodule-aware quiz retrieval and submission (Stage A).
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.models.content import Question, Submodule, Module, DifficultyLevel


class TestSubmoduleQuizRetrieval:
    """Test submodule filtering in quiz question retrieval."""

    @pytest.mark.asyncio
    async def test_retrieval_filters_by_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """GET /api/quiz/practice with submodule returns only questions from that submodule."""
        headers = guest_account["headers"]

        # Get questions from apt-arithmetic submodule
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 10,
            },
            headers=headers,
        )
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        assert data["module"] == "apt"
        assert data["submodule"] == "apt-arithmetic"
        assert data["difficulty"] == "easy"
        assert data["level"] == 1

        # Verify all returned questions belong to apt-arithmetic submodule
        question_ids = [q["id"] for q in data["questions"]]
        questions = db_session.query(Question).filter(Question.id.in_(question_ids)).all()
        submodule = db_session.query(Submodule).filter(Submodule.slug == "apt-arithmetic").first()
        for q in questions:
            assert q.submodule_id == submodule.id, f"Question {q.id} not in apt-arithmetic submodule"

    @pytest.mark.asyncio
    async def test_unknown_submodule_returns_404(self, async_client: AsyncClient, guest_account: dict):
        """Unknown submodule slug returns 404."""
        headers = guest_account["headers"]
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "nonexistent-submodule",
                "difficulty": "easy",
                "level": 1,
                "count": 5,
            },
            headers=headers,
        )
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Submodule not found"

    @pytest.mark.asyncio
    async def test_inactive_submodule_returns_404(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Inactive submodule returns 404."""
        headers = guest_account["headers"]
        # Deactivate a submodule
        submodule = db_session.query(Submodule).filter(Submodule.slug == "apt-arithmetic").first()
        original_active = submodule.is_active
        submodule.is_active = 0
        db_session.commit()

        try:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={
                    "module": "apt",
                    "submodule": "apt-arithmetic",
                    "difficulty": "easy",
                    "level": 1,
                    "count": 5,
                },
                headers=headers,
            )
            assert resp.status_code == 404
            assert resp.json()["detail"] == "Submodule not found"
        finally:
            submodule.is_active = original_active
            db_session.commit()

    @pytest.mark.asyncio
    async def test_submodule_from_another_module_rejected(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Submodule belonging to a different main module returns 422."""
        headers = guest_account["headers"]
        # di-tables-charts belongs to module 'di', not 'apt'
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "di-tables-charts",
                "difficulty": "easy",
                "level": 1,
                "count": 5,
            },
            headers=headers,
        )
        assert resp.status_code == 422
        assert "does not belong to the specified module" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_submodule_response_includes_submodule_field(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Practice response includes submodule field when provided."""
        headers = guest_account["headers"]
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 5,
            },
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "submodule" in data
        assert data["submodule"] == "apt-arithmetic"

    @pytest.mark.asyncio
    async def test_legacy_request_without_submodule_still_works(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Legacy requests without submodule parameter continue working."""
        headers = guest_account["headers"]
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "count": 5,
            },
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["module"] == "apt"
        assert data["difficulty"] == "easy"
        assert data["level"] == 1
        # submodule field should be present but None
        assert "submodule" in data
        assert data["submodule"] is None

    @pytest.mark.asyncio
    async def test_legacy_request_returns_questions_from_all_submodules(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy request (no submodule) returns questions from all submodules in module."""
        headers = guest_account["headers"]
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "count": 20,  # Request more to see distribution
            },
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["submodule"] is None

        # Verify questions can come from multiple submodules
        question_ids = [q["id"] for q in data["questions"]]
        questions = db_session.query(Question).filter(Question.id.in_(question_ids)).all()
        submodule_ids = {q.submodule_id for q in questions if q.submodule_id}
        # Should have questions from at least 2 different submodules
        assert len(submodule_ids) >= 2, "Expected questions from multiple submodules"


class TestSubmoduleQuizSubmission:
    """Test submodule validation in quiz submission."""

    @pytest.mark.asyncio
    async def test_submission_with_valid_submodule_succeeds(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submitting with valid submodule and matching questions succeeds."""
        headers = guest_account["headers"]

        # Get questions from apt-arithmetic submodule
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 3,
            },
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        # Answer first 2 correctly
        answers = []
        for i, q in enumerate(questions[:2]):
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            })

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
        data = submit_resp.json()
        assert data["submodule"] == "apt-arithmetic"
        assert data["summary"]["correct_answers"] == 2

    @pytest.mark.asyncio
    async def test_submission_rejects_question_from_another_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submitting a question from a different submodule is rejected."""
        headers = guest_account["headers"]

        # Get one question from apt-arithmetic and one from apt-time-work
        resp1 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        resp2 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-time-work", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        q1 = resp1.json()["questions"][0]
        q2 = resp2.json()["questions"][0]

        # Verify they're from different submodules
        db_q1 = db_session.query(Question).filter(Question.id == q1["id"]).first()
        db_q2 = db_session.query(Question).filter(Question.id == q2["id"]).first()
        assert db_q1.submodule_id != db_q2.submodule_id

        # Try to submit q2 (from apt-quantitative) with submodule=apt-arithmetic
        db_q2_correct = next(o for o in db_q2.options if o.is_correct == 1)
        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q2["id"],
                "selected_option_id": db_q2_correct.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 422
        assert "does not belong to submodule" in submit_resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_submission_without_submodule_still_works(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy submission without submodule continues working."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 2},
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
                "time_seconds": 10,
            })

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200
        data = submit_resp.json()
        assert data["submodule"] is None

    @pytest.mark.asyncio
    async def test_submission_unknown_submodule_rejected(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with unknown submodule returns 404."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        q = resp.json()["questions"][0]
        db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "nonexistent-submodule",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 404
        assert submit_resp.json()["detail"] == "Submodule not found"

    @pytest.mark.asyncio
    async def test_submission_inactive_submodule_rejected(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with inactive submodule returns 404."""
        headers = guest_account["headers"]

        # Deactivate apt-arithmetic submodule
        submodule = db_session.query(Submodule).filter(Submodule.slug == "apt-arithmetic").first()
        original_active = submodule.is_active
        submodule.is_active = 0
        db_session.commit()

        try:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
                headers=headers,
            )
            q = resp.json()["questions"][0]
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)

            submit_resp = await async_client.post("/api/quiz/submit", json={
                "session_type": "practice",
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "answers": [{
                    "question_id": q["id"],
                    "selected_option_id": correct_opt.id,
                    "time_seconds": 10,
                }],
            }, headers=headers)
            assert submit_resp.status_code == 404
            assert submit_resp.json()["detail"] == "Submodule not found"
        finally:
            submodule.is_active = original_active
            db_session.commit()

    @pytest.mark.asyncio
    async def test_submission_submodule_module_mismatch_rejected(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with submodule from different module returns 422."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        q = resp.json()["questions"][0]
        db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)

        # Submit with module=apt but submodule=di-tables-charts (belongs to di)
        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "di-tables-charts",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 422
        assert "does not belong to the specified module" in submit_resp.json()["detail"]


class TestSubmoduleQuizMasking:
    """Test that answer masking works correctly with submodule parameter."""

    @pytest.mark.asyncio
    async def test_correct_answers_hidden_before_submission(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Correct answers and explanations are hidden before submission with submodule."""
        headers = guest_account["headers"]
        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 3,
            },
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()

        for q in data["questions"]:
            assert "explanation" not in q
            for opt in q["options"]:
                assert "is_correct" not in opt

    @pytest.mark.asyncio
    async def test_correct_answers_returned_after_submission(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Correct answers and explanations are returned after submission with submodule."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 2,
            },
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
                "time_seconds": 10,
            })

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200
        data = submit_resp.json()

        for res in data["results"]:
            assert "correct_option_id" in res
            assert "explanation" in res
            assert len(res["explanation"]) > 0

    @pytest.mark.asyncio
    async def test_client_forged_rewards_ignored_with_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Server ignores client-injected reward values even with submodule."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "count": 2,
            },
            headers=headers,
        )
        questions = resp.json()["questions"]

        answers = []
        for q in questions:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
                "is_correct": False,  # Attempt to forge
            })

        # Inject fake high rewards
        payload = {
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
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

        # 100% accuracy on easy (multiplier 1.0): 2 correct * 20 XP = 40 XP, 2 * 5 = 10 coins
        rewards = data["rewards"]
        assert rewards["xp_earned"] == 40
        assert rewards["coins_earned"] == 10
        assert rewards["stars_earned"] == 3  # 100% accuracy = 3 stars


class TestSubmoduleQuizBackwardCompatibility:
    """Ensure all existing quiz and module tests still pass."""

    @pytest.mark.asyncio
    async def test_all_existing_modules_work_with_submodule(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """All 8 modules support submodule parameter."""
        headers = guest_account["headers"]
        modules = ["apt", "di", "lr", "gk", "prog", "cs", "eng", "med"]

        for module in modules:
            # Get first submodule for this module
            submodules_resp = await async_client.get(f"/api/modules/{module}/submodules")
            assert submodules_resp.status_code == 200
            first_submodule = submodules_resp.json()["submodules"][0]["slug"]

            resp = await async_client.get(
                "/api/quiz/practice",
                params={
                    "module": module,
                    "submodule": first_submodule,
                    "difficulty": "easy",
                    "level": 1,
                    "count": 1,
                },
                headers=headers,
            )
            assert resp.status_code == 200, f"Module {module} with submodule {first_submodule} failed"
            data = resp.json()
            assert data["module"] == module
            assert data["submodule"] == first_submodule

    @pytest.mark.asyncio
    async def test_existing_quiz_endpoints_unaffected(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """All existing quiz endpoints from test_submodules still work."""
        headers = guest_account["headers"]

        # Practice questions (legacy)
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp.status_code == 200

        # Submit mock quiz (doesn't require module/difficulty/level)
        q = resp.json()["questions"][0]
        from app.models.content import Question, QuestionOption
        from app.database import get_db
        db_gen = get_db()
        db = next(db_gen)
        try:
            db_q = db.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
        finally:
            try: next(db_gen)
            except: pass

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [{"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}]
        }, headers=headers)
        assert submit_resp.status_code == 200


class TestSubmoduleProgressRetrieval:
    """Regression tests for submodule-aware progress retrieval (B1.1)."""

    @pytest.mark.asyncio
    async def test_two_submodules_independent_progress_same_level(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Two submodules can each have progress for the same module/difficulty/level."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        # Create progress records directly for two submodules at same module/difficulty/level
        # apt-arithmetic (id=1) and apt-time-work (id=3) both have easy level 1 questions
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Progress for apt-arithmetic (submodule_id=1) - 100% accuracy, 3 stars
        progress1 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress1)
        
        # Progress for apt-time-work (submodule_id=3) - 50% accuracy, 0 stars
        progress2 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=3,  # apt-time-work
            level_number=1,
            best_accuracy=50,
            stars_earned=0,
        )
        db_session.add(progress2)
        db_session.commit()
        
        # Now check progress endpoint - both should be visible independently
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        assert progress_resp.status_code == 200
        data = progress_resp.json()
        
        # Find apt module
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        
        # Find level 1 entries for easy difficulty
        level1_entries = [
            l for l in apt_module["levels"] 
            if l["difficulty"] == "easy" and l["level"] == 1
        ]
        
        # Should have at least 2 entries (one per submodule)
        submodule_entries = [l for l in level1_entries if l.get("submodule") is not None]
        assert len(submodule_entries) >= 2, f"Expected >=2 submodule entries, got {len(submodule_entries)}"
        
        # Check arithmetic has 3 stars
        arithmetic_entry = next(l for l in submodule_entries if l["submodule"] == "apt-arithmetic")
        assert arithmetic_entry["stars_earned"] == 3
        assert arithmetic_entry["best_accuracy"] == 100
        
        # Check time-work has 0 stars (50% < 70%)
        time_work_entry = next(l for l in submodule_entries if l["submodule"] == "apt-time-work")
        assert time_work_entry["stars_earned"] == 0
        assert time_work_entry["best_accuracy"] == 50

    @pytest.mark.asyncio
    async def test_different_star_counts_not_overwritten(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Different star counts for different submodules are not overwritten."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        # Create progress records directly for two submodules at same module/difficulty/level
        # apt-arithmetic (id=1) and apt-time-work (id=3) both have easy level 1 questions
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Progress for apt-arithmetic (submodule_id=1) - 100% accuracy, 3 stars
        progress1 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress1)
        
        # Progress for apt-time-work (submodule_id=3) - 75% accuracy, 1 star
        progress2 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=3,  # apt-time-work
            level_number=1,
            best_accuracy=75,
            stars_earned=1,
        )
        db_session.add(progress2)
        db_session.commit()
        
        # Check progress
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        submodule_entries = {l["submodule"]: l for l in level1_entries if l.get("submodule") is not None}
        
        # Each submodule should have its own stars
        assert submodule_entries["apt-arithmetic"]["stars_earned"] == 3
        assert submodule_entries["apt-time-work"]["stars_earned"] == 1
        
        # Verify they are independent - arithmetic should not be 1 star
        assert submodule_entries["apt-arithmetic"]["stars_earned"] != 1

    @pytest.mark.asyncio
    async def test_legacy_progress_not_overwritten_by_submodule_progress(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy sentinel progress (submodule_id=0) does not overwrite real submodule progress."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create legacy progress (submodule_id=0) for level 1
        legacy_progress = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=0,  # sentinel / legacy
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(legacy_progress)
        
        # Create submodule-specific progress for same level (apt-arithmetic, submodule_id=1)
        submodule_progress = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(submodule_progress)
        db_session.commit()
        
        # Check progress - both should be visible
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        
        # Should have at least 2 entries: one with submodule, one without
        submodule_entries = [l for l in level1_entries if l.get("submodule") is not None]
        legacy_entries = [l for l in level1_entries if l.get("submodule") is None]
        
        assert len(submodule_entries) >= 1, "Submodule progress missing"
        assert len(legacy_entries) >= 1, "Legacy progress missing"
        
        # Legacy should have 3 stars (100% accuracy)
        assert legacy_entries[0]["stars_earned"] == 3
        # Submodule should also have 3 stars
        assert submodule_entries[0]["stars_earned"] == 3

    @pytest.mark.asyncio
    async def test_legacy_progress_not_attributed_to_real_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy progress appears with submodule=None, not attributed to any real submodule."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create legacy progress (submodule_id=0) for level 1
        legacy_progress = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=0,  # sentinel / legacy
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(legacy_progress)
        db_session.commit()
        
        # Check progress
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        legacy_entries = [l for l in level1_entries if l.get("submodule") is None]
        
        assert len(legacy_entries) == 1, "Legacy progress should appear once with submodule=None"
        assert legacy_entries[0]["submodule"] is None
        assert legacy_entries[0]["stars_earned"] == 3

    @pytest.mark.asyncio
    async def test_sentinel_not_exposed_as_normal_submodule(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """The no-submodule sentinel is not exposed as a normal learning submodule."""
        headers = guest_account["headers"]
        
        # Check submodules API - sentinel should not appear
        for module_slug in ["apt", "di", "lr", "gk", "prog", "cs", "eng", "med"]:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules", headers=headers)
            assert resp.status_code == 200
            data = resp.json()
            slugs = [s["slug"] for s in data["submodules"]]
            assert "no-submodule" not in slugs, f"Sentinel exposed in {module_slug}"
            assert all(s.startswith(f"{module_slug}-") for s in slugs), f"Invalid slug in {module_slug}"
        
        # Also check progress - sentinel submodule_id=0 should appear as submodule=None
        # (already tested in test_legacy_progress_not_attributed_to_real_submodule)

    @pytest.mark.asyncio
    async def test_existing_progress_tests_still_pass(
        self, async_client: AsyncClient, guest_account: dict, test_questions: dict
    ):
        """Existing module-level progress tests continue to pass (backward compatibility)."""
        headers = guest_account["headers"]
        
        # Complete level 1 without submodule (legacy style)
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 10},
            ]
        }, headers=headers)
        
        # Check progress endpoint returns expected structure
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        assert progress_resp.status_code == 200
        data = progress_resp.json()
        
        # Verify structure
        assert "profile" in data
        assert "modules" in data
        assert len(data["modules"]) == 8
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        assert "module_name" in apt_module
        assert "levels" in apt_module
        
        # Legacy progress should be visible (submodule=None)
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        legacy_entries = [l for l in level1_entries if l.get("submodule") is None]
        assert len(legacy_entries) >= 1, "Legacy progress should be visible"
        assert legacy_entries[0]["stars_earned"] == 3


class TestSubmoduleQuizSubmissionRewards:
    """Test submodule-aware quiz submission with independent progress and rewards."""

    @pytest.mark.asyncio
    async def test_submodule_progress_independent_first_completion_rewards(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """First completion in each submodule awards rewards independently."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]

        # Get questions from apt-arithmetic submodule (easy level 1) - has 9 questions
        resp1 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp1.status_code == 200
        questions1 = resp1.json()["questions"]
        assert len(questions1) >= 2

        # Create test questions for apt-time-work at easy level 1 (only has 1 existing question)
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        sub_time_work = db_session.query(Submodule).filter(Submodule.slug == 'apt-time-work').first()

        # Create 2 test questions for apt-time-work
        tw_q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            submodule_id=sub_time_work.id,
            level_number=1,
            question_text="Test TW: What is 60 km in 1 hour?",
            explanation="Speed = distance/time = 60 km/h",
            is_active=1,
            source="test_tw",
        )
        db_session.add(tw_q1)
        db_session.flush()
        opts1 = [
            QuestionOption(question_id=tw_q1.id, option_text="50", is_correct=0, display_order=0),
            QuestionOption(question_id=tw_q1.id, option_text="60", is_correct=1, display_order=1),
            QuestionOption(question_id=tw_q1.id, option_text="70", is_correct=0, display_order=2),
            QuestionOption(question_id=tw_q1.id, option_text="80", is_correct=0, display_order=3),
        ]
        for opt in opts1:
            db_session.add(opt)
        
        tw_q2 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            submodule_id=sub_time_work.id,
            level_number=1,
            question_text="Test TW: 2 hours at 30 km/h = ?",
            explanation="Distance = speed * time = 60 km",
            is_active=1,
            source="test_tw",
        )
        db_session.add(tw_q2)
        db_session.flush()
        opts2 = [
            QuestionOption(question_id=tw_q2.id, option_text="30", is_correct=0, display_order=0),
            QuestionOption(question_id=tw_q2.id, option_text="60", is_correct=1, display_order=1),
            QuestionOption(question_id=tw_q2.id, option_text="90", is_correct=0, display_order=2),
            QuestionOption(question_id=tw_q2.id, option_text="120", is_correct=0, display_order=3),
        ]
        for opt in opts2:
            db_session.add(opt)
        
        db_session.commit()

        # Get questions from apt-time-work (now has 3 total)
        resp2 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-time-work", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp2.status_code == 200
        questions2 = resp2.json()["questions"]
        assert len(questions2) >= 2

        # Verify they're from different submodules
        from app.models.content import Question
        db_q1 = db_session.query(Question).filter(Question.id == questions1[0]["id"]).first()
        db_q2 = db_session.query(Question).filter(Question.id == questions2[0]["id"]).first()
        assert db_q1.submodule_id != db_q2.submodule_id

        # Complete apt-arithmetic level 1 with 100% (3 stars, first completion)
        answers1 = []
        for q in questions1[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers1.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit1 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers1,
        }, headers=headers)
        assert submit1.status_code == 200
        data1 = submit1.json()
        assert data1["rewards"]["xp_earned"] > 0, "First completion should award XP"
        assert data1["rewards"]["coins_earned"] > 0, "First completion should award coins"
        assert data1["rewards"]["stars_earned"] == 3, "100% accuracy should give 3 stars"

        # Complete apt-time-work level 1 with 100% (3 stars, first completion)
        answers2 = []
        for q in questions2[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers2.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit2 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-time-work",
            "difficulty": "easy",
            "level": 1,
            "answers": answers2,
        }, headers=headers)
        assert submit2.status_code == 200
        data2 = submit2.json()
        assert data2["rewards"]["xp_earned"] > 0, "First completion in second submodule should award XP"
        assert data2["rewards"]["coins_earned"] > 0, "First completion in second submodule should award coins"
        assert data2["rewards"]["stars_earned"] == 3, "100% accuracy should give 3 stars"

        # Verify both submodules have independent progress with 3 stars each
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        submodule_entries = {l["submodule"]: l for l in level1_entries if l.get("submodule") is not None}

        assert submodule_entries["apt-arithmetic"]["stars_earned"] == 3
        assert submodule_entries["apt-time-work"]["stars_earned"] == 3
        assert submodule_entries["apt-arithmetic"]["best_accuracy"] == 100
        assert submodule_entries["apt-time-work"]["best_accuracy"] == 100

        # Profile should have accumulated stars from BOTH submodules (6 total)
        profile_resp = await async_client.get("/api/auth/me", headers=headers)
        profile = profile_resp.json()["profile"]
        assert profile["stars"] == 6, f"Expected 6 stars (3+3), got {profile['stars']}"

    @pytest.mark.asyncio
    async def test_submodule_replay_no_duplicate_rewards(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Replay in a submodule does not duplicate first-completion rewards."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]

        # Get questions from apt-arithmetic submodule (easy level 1)
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        # First completion - 100%
        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit1 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit1.status_code == 200
        data1 = submit1.json()
        first_xp = data1["rewards"]["xp_earned"]
        first_coins = data1["rewards"]["coins_earned"]
        first_stars = data1["rewards"]["stars_earned"]
        assert first_xp > 0
        assert first_coins > 0
        assert first_stars == 3

        # Replay - 100% again
        submit2 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit2.status_code == 200
        data2 = submit2.json()
        assert data2["rewards"]["xp_earned"] == 0, "Replay should not award XP"
        assert data2["rewards"]["coins_earned"] == 0, "Replay should not award coins"
        assert data2["rewards"]["stars_earned"] == 0, "Replay at same accuracy should not award stars"

        # Profile should still have only first completion rewards
        profile_resp = await async_client.get("/api/auth/me", headers=headers)
        profile = profile_resp.json()["profile"]
        assert profile["xp"] == first_xp
        assert profile["coins"] == first_coins
        assert profile["stars"] == first_stars

    @pytest.mark.asyncio
    async def test_submodule_replay_improved_accuracy_awards_star_difference(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Replay with improved accuracy awards only the star difference."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]

        # Get questions from apt-arithmetic submodule (easy level 1) - has 9 questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 4},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 4

        # First completion - 75% accuracy (4 questions, 3 correct = 1 star) - this creates progress record
        answers_75 = []
        for i in range(4):
            db_q = db_session.query(Question).filter(Question.id == questions[i]["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            wrong_opt = next(o for o in db_q.options if o.is_correct == 0)
            selected = correct_opt if i < 3 else wrong_opt  # 3 correct, 1 wrong = 75%
            answers_75.append({"question_id": questions[i]["id"], "selected_option_id": selected.id, "time_seconds": 10})

        submit1 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers_75,
        }, headers=headers)
        assert submit1.status_code == 200
        data1 = submit1.json()
        assert data1["rewards"]["stars_earned"] == 1, "75% accuracy gives 1 star"
        first_xp = data1["rewards"]["xp_earned"]
        first_coins = data1["rewards"]["coins_earned"]

        # Replay - 100% accuracy (4 questions, all correct = 3 stars)
        answers_100 = []
        for i in range(4):
            db_q = db_session.query(Question).filter(Question.id == questions[i]["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers_100.append({"question_id": questions[i]["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit2 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers_100,
        }, headers=headers)
        assert submit2.status_code == 200
        data2 = submit2.json()
        assert data2["rewards"]["xp_earned"] == 0, "Replay should not award XP"
        assert data2["rewards"]["coins_earned"] == 0, "Replay should not award coins"
        assert data2["rewards"]["stars_earned"] == 2, "Improved from 1 to 3 stars should award 2 stars"

        # Profile should have 3 stars total (1 + 2)
        profile_resp = await async_client.get("/api/auth/me", headers=headers)
        profile = profile_resp.json()["profile"]
        assert profile["stars"] == 3
        assert profile["xp"] == first_xp
        assert profile["coins"] == first_coins

        # Progress should show 100% best accuracy and 3 stars
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        sub_entry = next(l for l in level1_entries if l.get("submodule") == "apt-arithmetic")
        assert sub_entry["stars_earned"] == 3
        assert sub_entry["best_accuracy"] == 100

    @pytest.mark.asyncio
    async def test_submodule_replay_improved_stars_only_awards_difference(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Replay improving from 1 star to 3 stars awards only 2 additional stars."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]

        # Get questions from apt-arithmetic submodule (easy level 1) - has 9 questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 4},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 4

        # First completion - 75% accuracy (4 questions, 3 correct = 1 star)
        answers_75 = []
        for i in range(4):
            db_q = db_session.query(Question).filter(Question.id == questions[i]["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            wrong_opt = next(o for o in db_q.options if o.is_correct == 0)
            selected = correct_opt if i < 3 else wrong_opt  # 3 correct, 1 wrong = 75%
            answers_75.append({"question_id": questions[i]["id"], "selected_option_id": selected.id, "time_seconds": 10})

        submit1 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers_75,
        }, headers=headers)
        assert submit1.status_code == 200
        data1 = submit1.json()
        assert data1["rewards"]["stars_earned"] == 1, "75% accuracy gives 1 star"

        # Replay - 100% accuracy (4 questions, all correct = 3 stars)
        answers_100 = []
        for i in range(4):
            db_q = db_session.query(Question).filter(Question.id == questions[i]["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers_100.append({"question_id": questions[i]["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit2 = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers_100,
        }, headers=headers)
        assert submit2.status_code == 200
        data2 = submit2.json()
        assert data2["rewards"]["xp_earned"] == 0, "Replay should not award XP"
        assert data2["rewards"]["coins_earned"] == 0, "Replay should not award coins"
        assert data2["rewards"]["stars_earned"] == 2, "Improved from 1 to 3 stars should award 2 stars"

        # Profile should have 3 stars total (1 + 2)
        profile_resp = await async_client.get("/api/auth/me", headers=headers)
        profile = profile_resp.json()["profile"]
        assert profile["stars"] == 3

    @pytest.mark.asyncio
    async def test_legacy_progress_unaffected_by_submodule_progress(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy (no submodule) progress is unaffected by submodule-specific progress."""
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]

        # Use test_questions fixture questions for legacy (no submodule) completion
        # These are module-level questions at easy level 1
        from conftest import test_questions as create_test_questions
        # The test_questions fixture creates questions without submodule at level 1
        # Let's use the existing test_questions fixture indirectly by creating similar questions
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        
        # Get module and difficulty
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        # Create test questions for legacy (no submodule) at level 1
        q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="Legacy test: What is 10% of 200?",
            explanation="200 * 10 / 100 = 20",
            is_active=1,
            source="test_legacy",
        )
        db_session.add(q1)
        db_session.flush()
        opts1 = [
            QuestionOption(question_id=q1.id, option_text="10", is_correct=0, display_order=0),
            QuestionOption(question_id=q1.id, option_text="20", is_correct=1, display_order=1),
            QuestionOption(question_id=q1.id, option_text="30", is_correct=0, display_order=2),
            QuestionOption(question_id=q1.id, option_text="40", is_correct=0, display_order=3),
        ]
        for opt in opts1:
            db_session.add(opt)

        q2 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="Legacy test: Profit on 500 sold at 600?",
            explanation="Profit 100 / cost 500 = 20%",
            is_active=1,
            source="test_legacy",
        )
        db_session.add(q2)
        db_session.flush()
        opts2 = [
            QuestionOption(question_id=q2.id, option_text="10%", is_correct=0, display_order=0),
            QuestionOption(question_id=q2.id, option_text="20%", is_correct=1, display_order=1),
            QuestionOption(question_id=q2.id, option_text="30%", is_correct=0, display_order=2),
            QuestionOption(question_id=q2.id, option_text="40%", is_correct=0, display_order=3),
        ]
        for opt in opts2:
            db_session.add(opt)
        db_session.commit()

        correct1 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()
        correct2 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q2.id, QuestionOption.is_correct == 1).first()

        # Complete legacy (no submodule) level 1 with 100%
        submit_legacy = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": q1.id, "selected_option_id": correct1.id, "time_seconds": 10},
                {"question_id": q2.id, "selected_option_id": correct2.id, "time_seconds": 10},
            ]
        }, headers=headers)
        assert submit_legacy.status_code == 200
        legacy_data = submit_legacy.json()
        assert legacy_data["submodule"] is None
        assert legacy_data["rewards"]["stars_earned"] == 3
        legacy_xp = legacy_data["rewards"]["xp_earned"]
        legacy_coins = legacy_data["rewards"]["coins_earned"]

        # Now complete apt-arithmetic submodule level 1 with 100%
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers_sub = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers_sub.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit_sub = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers_sub,
        }, headers=headers)
        assert submit_sub.status_code == 200
        sub_data = submit_sub.json()
        assert sub_data["submodule"] == "apt-arithmetic"
        assert sub_data["rewards"]["stars_earned"] == 3

        # Both progress entries should exist independently
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        data = progress_resp.json()
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]

        legacy_entries = [l for l in level1_entries if l.get("submodule") is None]
        submodule_entries = [l for l in level1_entries if l.get("submodule") is not None]

        assert len(legacy_entries) >= 1, "Legacy progress should exist"
        assert len(submodule_entries) >= 1, "Submodule progress should exist"
        assert legacy_entries[0]["stars_earned"] == 3
        assert submodule_entries[0]["stars_earned"] == 3

        # Profile should have accumulated rewards from BOTH
        profile_resp = await async_client.get("/api/auth/me", headers=headers)
        profile = profile_resp.json()["profile"]
        assert profile["stars"] == 6  # 3 + 3
        assert profile["xp"] == legacy_xp + sub_data["rewards"]["xp_earned"]
        assert profile["coins"] == legacy_coins + sub_data["rewards"]["coins_earned"]

    @pytest.mark.asyncio
    async def test_mock_session_unaffected_by_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Mock sessions remain unaffected by submodule parameter."""
        headers = guest_account["headers"]

        # Get any question
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp.status_code == 200
        question = resp.json()["questions"][0]
        db_q = db_session.query(Question).filter(Question.id == question["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)

        # Submit mock test with submodule parameter (should be ignored for mock)
        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "submodule": "apt-arithmetic",  # This should be ignored for mock
            "answers": [{"question_id": question["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}],
        }, headers=headers)
        assert submit_resp.status_code == 200
        data = submit_resp.json()
        assert data["session_type"] == "mock"
        assert data["rewards"]["xp_earned"] > 0
        assert data["rewards"]["coins_earned"] > 0
        assert data["rewards"]["stars_earned"] == 0  # Mock never awards stars

        # Verify no level progress was created
        progress_resp = await async_client.get("/api/quiz/progress", headers=headers)
        prog_data = progress_resp.json()
        apt_module = next(m for m in prog_data["modules"] if m["module_slug"] == "apt")
        level1_entries = [l for l in apt_module["levels"] if l["difficulty"] == "easy" and l["level"] == 1]
        # Should have no progress entries for this mock test
        completed_entries = [l for l in level1_entries if l["stars_earned"] > 0]
        assert len(completed_entries) == 0, "Mock should not create level progress"

    @pytest.mark.asyncio
    async def test_server_side_scoring_security_with_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Server ignores client-injected reward values even with submodule."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]

        answers = []
        for q in questions:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            })

        # Inject fake high rewards
        payload = {
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
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

        # 100% accuracy on easy (multiplier 1.0): 2 correct * 20 XP = 40 XP, 2 * 5 = 10 coins
        rewards = data["rewards"]
        assert rewards["xp_earned"] == 40
        assert rewards["coins_earned"] == 10
        assert rewards["stars_earned"] == 3  # 100% accuracy = 3 stars

    @pytest.mark.asyncio
    async def test_submodule_module_mismatch_rejected_in_submission(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with submodule from different module returns 422."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp.status_code == 200
        q = resp.json()["questions"][0]
        db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)

        # Submit with module=apt but submodule=di-tables-charts (belongs to di)
        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "di-tables-charts",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 422
        assert "does not belong to the specified module" in submit_resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_unknown_submodule_rejected_in_submission(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with unknown submodule returns 404."""
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        q = resp.json()["questions"][0]
        db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "nonexistent-submodule",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q["id"],
                "selected_option_id": correct_opt.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 404
        assert submit_resp.json()["detail"] == "Submodule not found"

    @pytest.mark.asyncio
    async def test_inactive_submodule_rejected_in_submission(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submission with inactive submodule returns 404."""
        headers = guest_account["headers"]

        # Deactivate apt-arithmetic submodule
        submodule = db_session.query(Submodule).filter(Submodule.slug == "apt-arithmetic").first()
        original_active = submodule.is_active
        submodule.is_active = 0
        db_session.commit()

        try:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
                headers=headers,
            )
            q = resp.json()["questions"][0]
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)

            submit_resp = await async_client.post("/api/quiz/submit", json={
                "session_type": "practice",
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "answers": [{
                    "question_id": q["id"],
                    "selected_option_id": correct_opt.id,
                    "time_seconds": 10,
                }],
            }, headers=headers)
            assert submit_resp.status_code == 404
            assert submit_resp.json()["detail"] == "Submodule not found"
        finally:
            submodule.is_active = original_active
            db_session.commit()

    @pytest.mark.asyncio
    async def test_question_from_wrong_submodule_rejected(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submitting a question from a different submodule is rejected."""
        headers = guest_account["headers"]

        # Get one question from apt-arithmetic and one from apt-time-work
        resp1 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        resp2 = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-time-work", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        q1 = resp1.json()["questions"][0]
        q2 = resp2.json()["questions"][0]

        # Verify they're from different submodules
        from app.models.content import Question
        db_q1 = db_session.query(Question).filter(Question.id == q1["id"]).first()
        db_q2 = db_session.query(Question).filter(Question.id == q2["id"]).first()
        assert db_q1.submodule_id != db_q2.submodule_id

        # Try to submit q2 (from apt-time-work) with submodule=apt-arithmetic
        db_q2_correct = next(o for o in db_q2.options if o.is_correct == 1)
        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": [{
                "question_id": q2["id"],
                "selected_option_id": db_q2_correct.id,
                "time_seconds": 10,
            }],
        }, headers=headers)
        assert submit_resp.status_code == 422
        assert "does not belong to submodule" in submit_resp.json()["detail"]


class TestSubmoduleQuizHistory:
    """Test submodule-aware quiz history endpoints."""

    @pytest.mark.asyncio
    async def test_submodule_in_attempt_summaries(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submodule is included in attempt summaries."""
        from app.models.content import Question
        headers = guest_account["headers"]

        # Create submodule-specific attempt
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200

        # Create legacy attempt (no submodule)
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="History test legacy: What is 50% of 100?",
            explanation="50",
            is_active=1,
            source="test_history",
        )
        db_session.add(q1)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("25", 0), ("50", 1), ("75", 0), ("100", 0)]):
            db_session.add(QuestionOption(question_id=q1.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        q2 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="History test legacy: 10 * 10 = ?",
            explanation="100",
            is_active=1,
            source="test_history",
        )
        db_session.add(q2)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("90", 0), ("100", 1), ("110", 0), ("80", 0)]):
            db_session.add(QuestionOption(question_id=q2.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        db_session.commit()

        correct1 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()
        correct2 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q2.id, QuestionOption.is_correct == 1).first()

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": q1.id, "selected_option_id": correct1.id, "time_seconds": 10},
                {"question_id": q2.id, "selected_option_id": correct2.id, "time_seconds": 10},
            ]
        }, headers=headers)

        # Get attempt list
        history_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert history_resp.status_code == 200
        data = history_resp.json()
        attempts = data["attempts"]

        # Find the two attempts
        submodule_attempt = next(a for a in attempts if a["submodule"] == "apt-arithmetic")
        legacy_attempt = next(a for a in attempts if a["submodule"] is None)

        assert submodule_attempt["submodule"] == "apt-arithmetic"
        assert legacy_attempt["submodule"] is None

        # Both should have expected fields
        for a in [submodule_attempt, legacy_attempt]:
            assert "id" in a
            assert "session_type" in a
            assert "module" in a
            assert "difficulty" in a
            assert "level" in a
            assert "total_questions" in a
            assert "correct_answers" in a
            assert "accuracy_percent" in a
            assert "total_time_seconds" in a
            assert "xp_earned" in a
            assert "coins_earned" in a
            assert "multiplier" in a
            assert "completed_at" in a

    @pytest.mark.asyncio
    async def test_submodule_in_attempt_details(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Submodule is included in attempt details."""
        from app.models.content import Question
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200
        # Get attempt_id from database (not from response)
        from app.models.quiz_history import QuizAttempt
        attempt = db_session.query(QuizAttempt).filter(QuizAttempt.account_id == guest_account["account_id"]).order_by(QuizAttempt.id.desc()).first()
        attempt_id = attempt.id

        # Get attempt detail
        detail_resp = await async_client.get(f"/api/quiz/attempts/{attempt_id}", headers=headers)
        assert detail_resp.status_code == 200
        detail = detail_resp.json()

        assert detail["submodule"] == "apt-arithmetic"
        assert detail["module"] == "apt"
        assert detail["difficulty"] == "easy"
        assert detail["level"] == 1
        assert len(detail["questions"]) == 2

    @pytest.mark.asyncio
    async def test_filter_history_by_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Filtering history by submodule works correctly."""
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        headers = guest_account["headers"]

        # Create submodule-specific attempt
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)

        # Create legacy attempt (no submodule)
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="History filter test: What is 25% of 200?",
            explanation="50",
            is_active=1,
            source="test_history_filter",
        )
        db_session.add(q1)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("25", 0), ("50", 1), ("75", 0), ("100", 0)]):
            db_session.add(QuestionOption(question_id=q1.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        db_session.commit()
        correct1 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": q1.id, "selected_option_id": correct1.id, "time_seconds": 10},
            ]
        }, headers=headers)

        # Filter by submodule - should only get apt-arithmetic attempt
        filtered_resp = await async_client.get("/api/quiz/attempts", params={"submodule": "apt-arithmetic"}, headers=headers)
        assert filtered_resp.status_code == 200
        filtered_data = filtered_resp.json()
        filtered_attempts = filtered_data["attempts"]
        assert len(filtered_attempts) == 1
        assert filtered_attempts[0]["submodule"] == "apt-arithmetic"

        # Filter by submodule that doesn't match - should get empty
        empty_resp = await async_client.get("/api/quiz/attempts", params={"submodule": "apt-time-work"}, headers=headers)
        assert empty_resp.status_code == 200
        empty_data = empty_resp.json()
        assert len(empty_data["attempts"]) == 0

        # No filter - should get both
        all_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert all_resp.status_code == 200
        all_data = all_resp.json()
        assert len(all_data["attempts"]) >= 2

    @pytest.mark.asyncio
    async def test_filter_by_unknown_submodule_returns_404(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Filtering by unknown submodule returns 404."""
        headers = guest_account["headers"]
        resp = await async_client.get("/api/quiz/attempts", params={"submodule": "nonexistent-submodule"}, headers=headers)
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Submodule not found"

    @pytest.mark.asyncio
    async def test_filter_submodule_module_mismatch_returns_422(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Filtering by submodule from different module returns 422."""
        headers = guest_account["headers"]
        # di-tables-charts belongs to di module, not apt
        resp = await async_client.get("/api/quiz/attempts", params={"module": "apt", "submodule": "di-tables-charts"}, headers=headers)
        assert resp.status_code == 422
        assert "does not belong to the specified module" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_no_cross_submodule_history_leakage(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Attempts from one submodule don't leak into another's filtered history."""
        from app.models.content import Question
        headers = guest_account["headers"]

        # Create attempts for two different submodules
        for submodule_slug in ["apt-arithmetic", "apt-time-work"]:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": "apt", "submodule": submodule_slug, "difficulty": "easy", "level": 1, "count": 1},
                headers=headers,
            )
            # apt-time-work may not have questions at easy level 1
            if resp.status_code == 200 and len(resp.json()["questions"]) > 0:
                questions = resp.json()["questions"]
                q = questions[0]
                db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
                correct_opt = next(o for o in db_q.options if o.is_correct == 1)
                await async_client.post("/api/quiz/submit", json={
                    "session_type": "practice",
                    "module": "apt",
                    "submodule": submodule_slug,
                    "difficulty": "easy",
                    "level": 1,
                    "answers": [{"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}],
                }, headers=headers)

        # Filter by apt-arithmetic should only show arithmetic attempts
        arith_resp = await async_client.get("/api/quiz/attempts", params={"submodule": "apt-arithmetic"}, headers=headers)
        assert arith_resp.status_code == 200
        arith_data = arith_resp.json()
        for a in arith_data["attempts"]:
            assert a["submodule"] == "apt-arithmetic"

        # Filter by apt-time-work should only show time-work attempts (if any)
        time_resp = await async_client.get("/api/quiz/attempts", params={"submodule": "apt-time-work"}, headers=headers)
        assert time_resp.status_code == 200
        time_data = time_resp.json()
        for a in time_data["attempts"]:
            assert a["submodule"] == "apt-time-work"

    @pytest.mark.asyncio
    async def test_legacy_attempts_with_null_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy attempts with NULL submodule_id appear with submodule=None."""
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        headers = guest_account["headers"]

        # Create legacy attempt
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="Legacy history: What is 1 + 1?",
            explanation="2",
            is_active=1,
            source="test_legacy_history",
        )
        db_session.add(q1)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("1", 0), ("2", 1), ("3", 0), ("4", 0)]):
            db_session.add(QuestionOption(question_id=q1.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        db_session.commit()
        correct1 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [{"question_id": q1.id, "selected_option_id": correct1.id, "time_seconds": 10}],
        }, headers=headers)

        # Get attempts - legacy should have submodule=None
        history_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert history_resp.status_code == 200
        data = history_resp.json()

        # Find legacy attempt
        legacy_attempt = next(a for a in data["attempts"] if a["submodule"] is None)
        assert legacy_attempt["submodule"] is None
        assert legacy_attempt["module"] == "apt"
        assert legacy_attempt["difficulty"] == "easy"

        # Detail should also have submodule=None
        detail_resp = await async_client.get(f"/api/quiz/attempts/{legacy_attempt['id']}", headers=headers)
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["submodule"] is None

    @pytest.mark.asyncio
    async def test_existing_history_behavior_without_filter(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Existing history behavior without filter is preserved."""
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        headers = guest_account["headers"]

        # Create a mix of attempts
        # 1. Legacy attempt
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        q1 = Question(
            module_id=module.id,
            difficulty_id=difficulty.id,
            level_number=1,
            question_text="Behavior test: 5 + 5?",
            explanation="10",
            is_active=1,
            source="test_behavior",
        )
        db_session.add(q1)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("5", 0), ("10", 1), ("15", 0), ("20", 0)]):
            db_session.add(QuestionOption(question_id=q1.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        db_session.commit()
        correct1 = db_session.query(QuestionOption).filter(QuestionOption.question_id == q1.id, QuestionOption.is_correct == 1).first()

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [{"question_id": q1.id, "selected_option_id": correct1.id, "time_seconds": 10}],
        }, headers=headers)

        # 2. Submodule attempt
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        if resp.status_code == 200 and len(resp.json()["questions"]) > 0:
            q = resp.json()["questions"][0]
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            await async_client.post("/api/quiz/submit", json={
                "session_type": "practice",
                "module": "apt",
                "submodule": "apt-arithmetic",
                "difficulty": "easy",
                "level": 1,
                "answers": [{"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}],
            }, headers=headers)

        # 3. Mock attempt
        mock_resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        if mock_resp.status_code == 200 and len(mock_resp.json()["questions"]) > 0:
            q = mock_resp.json()["questions"][0]
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            await async_client.post("/api/quiz/submit", json={
                "session_type": "mock",
                "answers": [{"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}],
            }, headers=headers)

        # Get all attempts without filter
        all_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert all_resp.status_code == 200
        all_data = all_resp.json()

        # Should have all attempt types
        attempt_types = {a["session_type"] for a in all_data["attempts"]}
        assert "practice" in attempt_types
        assert "mock" in attempt_types

        submodules = {a["submodule"] for a in all_data["attempts"]}
        assert "apt-arithmetic" in submodules or None in submodules

    @pytest.mark.asyncio
    async def test_mock_attempt_compatibility(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Mock attempts work correctly with submodule-aware history."""
        from app.models.content import Question
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        if resp.status_code == 200 and len(resp.json()["questions"]) > 0:
            q = resp.json()["questions"][0]
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)

            submit_resp = await async_client.post("/api/quiz/submit", json={
                "session_type": "mock",
                "answers": [{"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10}],
            }, headers=headers)
            assert submit_resp.status_code == 200
            # Get attempt_id from database
            from app.models.quiz_history import QuizAttempt
            attempt = db_session.query(QuizAttempt).filter(QuizAttempt.account_id == guest_account["account_id"]).order_by(QuizAttempt.id.desc()).first()
            attempt_id = attempt.id

            # Get detail - mock should have submodule=None (not stored)
            detail_resp = await async_client.get(f"/api/quiz/attempts/{attempt_id}", headers=headers)
            assert detail_resp.status_code == 200
            detail = detail_resp.json()
            # Mock attempts don't have module/difficulty/level/submodule
            assert detail["session_type"] == "mock"
            assert detail["submodule"] is None
            assert detail["module"] is None
            assert detail["difficulty"] is None

    @pytest.mark.asyncio
    async def test_attempt_ownership_and_access_control(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Attempt ownership is enforced - users can't access others' attempts."""
        from app.models.content import Question
        from app.models.quiz_history import QuizAttempt
        headers1 = guest_account["headers"]
        account_id1 = guest_account["account_id"]

        # Create attempt for account 1
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers1,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers1)
        assert submit_resp.status_code == 200
        # Get attempt_id from database
        attempt = db_session.query(QuizAttempt).filter(QuizAttempt.account_id == account_id1).order_by(QuizAttempt.id.desc()).first()
        attempt_id = attempt.id

        # Create account 2
        resp2 = await async_client.post("/api/auth/guest", json={})
        auth_data2 = resp2.json()
        headers2 = {"Authorization": f"Bearer {auth_data2['access_token']}"}

        # Account 2 cannot access account 1's attempt
        detail_resp = await async_client.get(f"/api/quiz/attempts/{attempt_id}", headers=headers2)
        assert detail_resp.status_code == 404

        # Account 2's list should be empty
        list_resp = await async_client.get("/api/quiz/attempts", headers=headers2)
        assert list_resp.status_code == 200
        assert len(list_resp.json()["attempts"]) == 0

    @pytest.mark.asyncio
    async def test_submodule_specific_attempts_store_correct_submodule(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """New submodule-specific attempts store the correct submodule_id."""
        from app.models.content import Question, QuestionOption, Module, DifficultyLevel
        headers = guest_account["headers"]

        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        questions = resp.json()["questions"]
        assert len(questions) >= 2

        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})

        submit_resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers,
        }, headers=headers)
        assert submit_resp.status_code == 200
        # Get attempt_id from database
        from app.models.quiz_history import QuizAttempt
        attempt = db_session.query(QuizAttempt).filter(QuizAttempt.account_id == guest_account["account_id"]).order_by(QuizAttempt.id.desc()).first()
        attempt_id = attempt.id

        # Verify in database
        attempt = db_session.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        assert attempt is not None
        assert attempt.submodule_id is not None
        from app.models.content import Submodule
        sub = db_session.query(Submodule).filter(Submodule.id == attempt.submodule_id).first()
        assert sub.slug == "apt-arithmetic"

        # Also verify legacy attempt has NULL submodule_id
        module_obj = db_session.query(Module).filter(Module.slug == 'apt').first()
        diff_obj = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()

        q_legacy = Question(
            module_id=module_obj.id,
            difficulty_id=diff_obj.id,
            level_number=1,
            question_text="Legacy store test: 3 * 3?",
            explanation="9",
            is_active=1,
            source="test_legacy_store",
        )
        db_session.add(q_legacy)
        db_session.flush()
        for i, (opt_text, is_correct) in enumerate([("6", 0), ("9", 1), ("12", 0), ("15", 0)]):
            db_session.add(QuestionOption(question_id=q_legacy.id, option_text=opt_text, is_correct=is_correct, display_order=i))

        db_session.commit()
        correct_legacy = db_session.query(QuestionOption).filter(QuestionOption.question_id == q_legacy.id, QuestionOption.is_correct == 1).first()

        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [{"question_id": q_legacy.id, "selected_option_id": correct_legacy.id, "time_seconds": 10}],
        }, headers=headers)

        history_resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert history_resp.status_code == 200
        data = history_resp.json()

        # Find legacy attempt
        legacy_attempt = next(a for a in data["attempts"] if a["submodule"] is None)
        assert legacy_attempt["submodule"] is None

        # Verify in database
        db_legacy = db_session.query(QuizAttempt).filter(QuizAttempt.id == legacy_attempt["id"]).first()
        assert db_legacy.submodule_id is None


class TestV2ProgressEndpoint:
    """Tests for the new V2 submodule-aware progress endpoint."""

    @pytest.mark.asyncio
    async def test_v2_progress_endpoint_returns_200(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """V2 progress endpoint returns 200 and correct structure."""
        headers = guest_account["headers"]
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # Verify top-level structure
        assert "profile" in data
        assert "modules" in data
        assert isinstance(data["modules"], list)
        assert len(data["modules"]) == 8  # 8 modules
        
        # Verify profile fields
        profile = data["profile"]
        assert "player_id" in profile
        assert "xp" in profile
        assert "coins" in profile
        assert "stars" in profile
        assert "streak" in profile

    @pytest.mark.asyncio
    async def test_v2_progress_module_structure(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """V2 progress has correct module -> difficulty -> submodule -> level structure."""
        headers = guest_account["headers"]
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # Find apt module
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        assert apt_module["module_name"] == "General Aptitude"
        assert "difficulties" in apt_module
        assert isinstance(apt_module["difficulties"], list)
        assert len(apt_module["difficulties"]) == 3  # easy, medium, hard
        
        # Check difficulty structure
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        assert "submodules" in easy_diff
        assert isinstance(easy_diff["submodules"], list)
        
        # Should have at least the legacy (None) submodule and apt-arithmetic, apt-quantitative, apt-time-work
        submodule_slugs = {s["submodule"] for s in easy_diff["submodules"]}
        assert None in submodule_slugs  # legacy
        assert "apt-arithmetic" in submodule_slugs
        assert "apt-quantitative" in submodule_slugs
        assert "apt-time-work" in submodule_slugs

    @pytest.mark.asyncio
    async def test_v2_progress_level_structure(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Each level has correct fields in V2."""
        headers = guest_account["headers"]
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        legacy_submodule = next(s for s in easy_diff["submodules"] if s["submodule"] is None)
        
        # Check level 1
        level1 = next(l for l in legacy_submodule["levels"] if l["level"] == 1)
        assert level1["module"] == "apt"
        assert level1["module_name"] == "General Aptitude"
        assert level1["difficulty"] == "easy"
        assert level1["level"] == 1
        assert "completed" in level1
        assert "stars_earned" in level1
        assert "best_accuracy" in level1
        assert "completed_at" in level1
        assert "attempts_count" in level1
        assert "total_xp_earned" in level1
        
        # All 50 levels should exist
        assert len(legacy_submodule["levels"]) == 50
        
        # Levels 2-50 should be not completed
        for level_num in range(2, 51):
            lvl = next(l for l in legacy_submodule["levels"] if l["level"] == level_num)
            assert lvl["completed"] is False
            assert lvl["stars_earned"] == 0
            assert lvl["best_accuracy"] == 0
            assert lvl["completed_at"] is None

    @pytest.mark.asyncio
    async def test_v2_progress_independent_submodule_progress(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Different submodules have independent progress in V2."""
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create progress for apt-arithmetic (submodule_id=1) - 100% accuracy, 3 stars
        progress1 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress1)
        
        # Create progress for apt-time-work (submodule_id=3) - 75% accuracy, 1 star
        progress2 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=3,  # apt-time-work
            level_number=1,
            best_accuracy=75,
            stars_earned=1,
        )
        db_session.add(progress2)
        db_session.commit()
        
        # Check V2 progress
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        
        # Find arithmetic submodule
        arith_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        arith_level1 = next(l for l in arith_sub["levels"] if l["level"] == 1)
        assert arith_level1["completed"] is True
        assert arith_level1["stars_earned"] == 3
        assert arith_level1["best_accuracy"] == 100
        assert arith_level1["submodule"] == "apt-arithmetic"
        assert arith_level1["submodule_name"] == "Arithmetic"
        
        # Find time-work submodule
        time_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-time-work")
        time_level1 = next(l for l in time_sub["levels"] if l["level"] == 1)
        assert time_level1["completed"] is True
        assert time_level1["stars_earned"] == 1
        assert time_level1["best_accuracy"] == 75
        assert time_level1["submodule"] == "apt-time-work"
        assert time_level1["submodule_name"] == "Time and Work"
        
        # They should be independent
        assert arith_level1["stars_earned"] != time_level1["stars_earned"]

    @pytest.mark.asyncio
    async def test_v2_progress_independent_difficulty_progress(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Different difficulties have independent progress in V2."""
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        diff_medium = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "medium").first()
        
        # Create progress for easy level 1
        progress1 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress1)
        
        # Create progress for medium level 1 (same submodule)
        progress2 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_medium.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=80,
            stars_earned=1,
        )
        db_session.add(progress2)
        db_session.commit()
        
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        
        # Easy difficulty
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        arith_sub_easy = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        easy_level1 = next(l for l in arith_sub_easy["levels"] if l["level"] == 1)
        assert easy_level1["completed"] is True
        assert easy_level1["stars_earned"] == 3
        assert easy_level1["best_accuracy"] == 100
        
        # Medium difficulty
        medium_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "medium")
        arith_sub_medium = next(s for s in medium_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        medium_level1 = next(l for l in arith_sub_medium["levels"] if l["level"] == 1)
        assert medium_level1["completed"] is True
        assert medium_level1["stars_earned"] == 1
        assert medium_level1["best_accuracy"] == 80
        
        # They should be independent
        assert easy_level1["stars_earned"] != medium_level1["stars_earned"]

    @pytest.mark.asyncio
    async def test_v2_progress_independent_level_progress(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Different levels have independent progress in V2."""
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create progress for level 1
        progress1 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress1)
        
        # Create progress for level 2 (same submodule, same difficulty)
        progress2 = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,  # apt-arithmetic
            level_number=2,
            best_accuracy=85,
            stars_earned=2,
        )
        db_session.add(progress2)
        db_session.commit()
        
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        arith_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        
        # Level 1
        level1 = next(l for l in arith_sub["levels"] if l["level"] == 1)
        assert level1["completed"] is True
        assert level1["stars_earned"] == 3
        assert level1["best_accuracy"] == 100
        
        # Level 2
        level2 = next(l for l in arith_sub["levels"] if l["level"] == 2)
        assert level2["completed"] is True
        assert level2["stars_earned"] == 2
        assert level2["best_accuracy"] == 85
        
        # Level 3 should be not completed
        level3 = next(l for l in arith_sub["levels"] if l["level"] == 3)
        assert level3["completed"] is False
        assert level3["stars_earned"] == 0
        assert level3["best_accuracy"] == 0
        
        # They should be independent
        assert level1["stars_earned"] != level2["stars_earned"]

    @pytest.mark.asyncio
    async def test_v2_progress_legacy_representation(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Legacy progress (submodule_id=0) appears with submodule=None in V2."""
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        headers = guest_account["headers"]
        account_id = guest_account["account_id"]
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create legacy progress (submodule_id=0)
        progress = PlayerLevelProgress(
            account_id=account_id,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=0,  # Legacy sentinel
            level_number=1,
            best_accuracy=90,
            stars_earned=2,
        )
        db_session.add(progress)
        db_session.commit()
        
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        
        # Legacy should appear as submodule=None
        legacy_sub = next(s for s in easy_diff["submodules"] if s["submodule"] is None)
        assert legacy_sub["submodule"] is None
        assert legacy_sub["submodule_name"] is None
        
        level1 = next(l for l in legacy_sub["levels"] if l["level"] == 1)
        assert level1["completed"] is True
        assert level1["stars_earned"] == 2
        assert level1["best_accuracy"] == 90
        assert level1["submodule"] is None
        assert level1["submodule_name"] is None

    @pytest.mark.asyncio
    async def test_v2_progress_empty_progress(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Empty progress returns all levels as not completed."""
        headers = guest_account["headers"]
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # All levels should be not completed
        for module in data["modules"]:
            for diff in module["difficulties"]:
                for submodule in diff["submodules"]:
                    for level in submodule["levels"]:
                        assert level["completed"] is False
                        assert level["stars_earned"] == 0
                        assert level["best_accuracy"] == 0
                        assert level["completed_at"] is None

    @pytest.mark.asyncio
    async def test_v2_progress_user_ownership(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """Users can only access their own progress in V2."""
        from app.models.player_progress import PlayerLevelProgress
        from app.models.content import DifficultyLevel
        headers1 = guest_account["headers"]
        account_id1 = guest_account["account_id"]
        
        diff_easy = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == "easy").first()
        
        # Create progress for account 1
        progress = PlayerLevelProgress(
            account_id=account_id1,
            module_id=1,
            difficulty_id=diff_easy.id,
            submodule_id=1,
            level_number=1,
            best_accuracy=100,
            stars_earned=3,
        )
        db_session.add(progress)
        db_session.commit()
        
        # Create account 2
        resp2 = await async_client.post("/api/auth/guest", json={})
        auth_data2 = resp2.json()
        headers2 = {"Authorization": f"Bearer {auth_data2['access_token']}"}
        
        # Account 2 should see empty progress
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers2)
        assert resp.status_code == 200
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        arith_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        level1 = next(l for l in arith_sub["levels"] if l["level"] == 1)
        
        assert level1["completed"] is False
        assert level1["stars_earned"] == 0

    @pytest.mark.asyncio
    async def test_v2_progress_attempts_and_xp(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """V2 progress includes attempts_count and total_xp_earned from QuizAttempt."""
        from app.models.content import Question
        headers = guest_account["headers"]
        
        # Get questions from apt-arithmetic submodule
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 2},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 2
        
        answers = []
        for q in questions[:2]:
            db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
            correct_opt = next(o for o in db_q.options if o.is_correct == 1)
            answers.append({"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10})
        
        # Submit a practice quiz for apt-arithmetic
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        
        # Check V2 progress
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        arith_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        level1 = next(l for l in arith_sub["levels"] if l["level"] == 1)
        
        # Should have 1 attempt and some XP
        assert level1["attempts_count"] >= 1
        assert level1["total_xp_earned"] > 0
        assert level1["completed"] is True

    @pytest.mark.asyncio
    async def test_v1_progress_endpoint_still_works(
        self, async_client: AsyncClient, guest_account: dict, test_questions: dict
    ):
        """Existing GET /api/quiz/progress remains backward compatible."""
        headers = guest_account["headers"]
        
        # Submit a quiz
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 10},
        ]
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        
        # V1 endpoint should still work
        resp = await async_client.get("/api/quiz/progress", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert "profile" in data
        assert "modules" in data
        assert len(data["modules"]) == 8
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        level1 = next(l for l in apt_module["levels"] if l["module"] == "apt" and l["difficulty"] == "easy" and l["level"] == 1)
        assert level1["stars_earned"] == 3
        assert level1["best_accuracy"] == 100

    @pytest.mark.asyncio
    async def test_v2_progress_excludes_mock_attempts_from_counts(
        self, async_client: AsyncClient, guest_account: dict, db_session: Session
    ):
        """V2 progress attempts_count only includes practice attempts, not mock."""
        from app.models.content import Question
        headers = guest_account["headers"]
        
        # Get questions from apt-arithmetic submodule
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "submodule": "apt-arithmetic", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers,
        )
        assert resp.status_code == 200
        questions = resp.json()["questions"]
        assert len(questions) >= 1
        
        q = questions[0]
        db_q = db_session.query(Question).filter(Question.id == q["id"]).first()
        correct_opt = next(o for o in db_q.options if o.is_correct == 1)
        
        # Submit a practice quiz
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "submodule": "apt-arithmetic",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10},
            ]
        }, headers=headers)
        
        # Submit a mock quiz (should not count towards practice attempts)
        await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [
                {"question_id": q["id"], "selected_option_id": correct_opt.id, "time_seconds": 10},
            ]
        }, headers=headers)
        
        resp = await async_client.get("/api/quiz/progress/v2", headers=headers)
        data = resp.json()
        
        apt_module = next(m for m in data["modules"] if m["module_slug"] == "apt")
        easy_diff = next(d for d in apt_module["difficulties"] if d["difficulty"] == "easy")
        arith_sub = next(s for s in easy_diff["submodules"] if s["submodule"] == "apt-arithmetic")
        level1 = next(l for l in arith_sub["levels"] if l["level"] == 1)
        
        # Should only count practice attempts
        assert level1["attempts_count"] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])