import pytest
from httpx import AsyncClient
from sqlalchemy import func
from datetime import date, timedelta
import asyncio

from app.models import (
    account, session, content, quiz_history, player_progress
)
from app.models.account import Account, PlayerProfile
from app.models.quiz_history import QuizAttempt, QuizAttemptQuestion
from app.models.player_progress import PlayerLevelProgress


class TestStarBoundaries:
    """Tests for star boundary thresholds: 70% -> 1★, 85% -> 2★, 100% -> 3★"""
    
    @pytest.mark.asyncio
    async def test_70_percent_accuracy_1_star(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """70% accuracy (7/10 correct) should award 1 star"""
        headers = guest_account["headers"]
        
        # Get module and difficulty IDs dynamically
        from app.models.content import Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        
        # Use 10 questions from level 2, answer 7 correctly
        answers = []
        for i in range(10):
            if i < 7:
                answers.append({
                    "question_id": test_questions['q4_ids'][i],
                    "selected_option_id": test_questions['q4_correct_opts'][i],
                    "time_seconds": 10
                })
            else:
                answers.append({
                    "question_id": test_questions['q4_ids'][i],
                    "selected_option_id": test_questions['q4_wrong_opts'][i],
                    "time_seconds": 10
                })
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 2,
            "answers": answers
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['summary']['accuracy_percent'] == 70
        assert data['rewards']['stars_earned'] == 1
        
        # Verify XP/coins awarded (7 correct * 20 * 1.0 = 140 XP, 7 * 5 * 1.0 = 35 coins)
        assert data['rewards']['xp_earned'] == 140
        assert data['rewards']['coins_earned'] == 35
        
        # Verify progress record
        progress = db_session.query(PlayerLevelProgress).filter(
            PlayerLevelProgress.account_id == guest_account["account_id"],
            PlayerLevelProgress.module_id == module.id,
            PlayerLevelProgress.difficulty_id == difficulty.id,
            PlayerLevelProgress.level_number == 2
        ).first()
        assert progress is not None
        assert progress.stars_earned == 1
        assert progress.best_accuracy == 70
    
    @pytest.mark.asyncio
    async def test_85_percent_accuracy_2_stars(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """85% accuracy (17/20 correct) should award 2 stars"""
        headers = guest_account["headers"]
        
        # Get module and difficulty IDs dynamically
        from app.models.content import Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        
        # Use 20 questions from level 3, answer 17 correctly
        answers = []
        for i in range(20):
            if i < 17:
                answers.append({
                    "question_id": test_questions['q5_ids'][i],
                    "selected_option_id": test_questions['q5_correct_opts'][i],
                    "time_seconds": 10
                })
            else:
                answers.append({
                    "question_id": test_questions['q5_ids'][i],
                    "selected_option_id": test_questions['q5_wrong_opts'][i],
                    "time_seconds": 10
                })
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 3,
            "answers": answers
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['summary']['accuracy_percent'] == 85
        assert data['rewards']['stars_earned'] == 2
        
        # Verify XP/coins awarded (17 correct * 20 * 1.0 = 340 XP, 17 * 5 * 1.0 = 85 coins)
        assert data['rewards']['xp_earned'] == 340
        assert data['rewards']['coins_earned'] == 85
        
        # Verify progress record
        progress = db_session.query(PlayerLevelProgress).filter(
            PlayerLevelProgress.account_id == guest_account["account_id"],
            PlayerLevelProgress.module_id == module.id,
            PlayerLevelProgress.difficulty_id == difficulty.id,
            PlayerLevelProgress.level_number == 3
        ).first()
        assert progress is not None
        assert progress.stars_earned == 2
        assert progress.best_accuracy == 85
    
    @pytest.mark.asyncio
    async def test_100_percent_accuracy_3_stars(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """100% accuracy should award 3 stars"""
        headers = guest_account["headers"]
        
        # Get module and difficulty IDs dynamically
        from app.models.content import Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        
        # Use level 1 questions, answer both correctly
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 10},
        ]
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['summary']['accuracy_percent'] == 100
        assert data['rewards']['stars_earned'] == 3
        
        # Verify XP/coins awarded (2 correct * 20 * 1.0 = 40 XP, 2 * 5 * 1.0 = 10 coins)
        assert data['rewards']['xp_earned'] == 40
        assert data['rewards']['coins_earned'] == 10
        
        # Verify progress record
        progress = db_session.query(PlayerLevelProgress).filter(
            PlayerLevelProgress.account_id == guest_account["account_id"],
            PlayerLevelProgress.module_id == module.id,
            PlayerLevelProgress.difficulty_id == difficulty.id,
            PlayerLevelProgress.level_number == 1
        ).first()
        assert progress is not None
        assert progress.stars_earned == 3
        assert progress.best_accuracy == 100


class TestReplayImprovement:
    """Tests for replay improving stars without duplicate XP/coins"""
    
    @pytest.mark.asyncio
    async def test_replay_improves_stars_no_duplicate_rewards(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """Replay with better accuracy should improve stars but not award duplicate XP/coins"""
        headers = guest_account["headers"]
        
        # Get module and difficulty IDs dynamically
        from app.models.content import Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        
        # First attempt: 70% (1 star)
        answers_70 = []
        for i in range(10):
            if i < 7:
                answers_70.append({
                    "question_id": test_questions['q4_ids'][i],
                    "selected_option_id": test_questions['q4_correct_opts'][i],
                    "time_seconds": 10
                })
            else:
                answers_70.append({
                    "question_id": test_questions['q4_ids'][i],
                    "selected_option_id": test_questions['q4_wrong_opts'][i],
                    "time_seconds": 10
                })
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 2,
            "answers": answers_70
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['stars_earned'] == 1
        first_xp = data['rewards']['xp_earned']
        first_coins = data['rewards']['coins_earned']
        
        # Verify profile has the XP/coins
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == first_xp
        assert profile['coins'] == first_coins
        assert profile['stars'] == 1
        
        # Second attempt: 100% (3 stars)
        answers_100 = []
        for i in range(10):
            answers_100.append({
                "question_id": test_questions['q4_ids'][i],
                "selected_option_id": test_questions['q4_correct_opts'][i],
                "time_seconds": 10
            })
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 2,
            "answers": answers_100
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['stars_earned'] == 2  # 3 - 1 = 2 stars improvement
        assert data['rewards']['xp_earned'] == 0
        assert data['rewards']['coins_earned'] == 0
        
        # Verify profile: XP/coins unchanged, stars increased by exactly 2
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == first_xp
        assert profile['coins'] == first_coins
        assert profile['stars'] == 3  # 1 + 2 = 3
        
        # Verify progress record shows 3 stars
        progress = db_session.query(PlayerLevelProgress).filter(
            PlayerLevelProgress.account_id == guest_account["account_id"],
            PlayerLevelProgress.module_id == module.id,
            PlayerLevelProgress.difficulty_id == difficulty.id,
            PlayerLevelProgress.level_number == 2
        ).first()
        assert progress is not None
        assert progress.stars_earned == 3
        assert progress.best_accuracy == 100


class TestStreakTracking:
    """Tests for streak tracking: consecutive days and missed days"""
    
    @pytest.mark.asyncio
    async def test_consecutive_day_streak(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """Activity on consecutive days should increment streak"""
        headers = guest_account["headers"]
        
        # First activity today
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
        ]
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        assert resp.status_code == 200
        
        # Verify streak is 1
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1
        
        # Manually update last_activity_date to yesterday
        db_session.query(PlayerProfile).filter(
            PlayerProfile.account_id == guest_account["account_id"]
        ).update({PlayerProfile.last_activity_date: date.today() - timedelta(days=1)})
        db_session.commit()
        
        # Second activity today (consecutive day)
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [{"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10}]
        }, headers=headers)
        assert resp.status_code == 200
        
        # Verify streak is 2
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 2
    
    @pytest.mark.asyncio
    async def test_missed_day_streak_resets(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """Activity after a missed day should reset streak to 1"""
        headers = guest_account["headers"]
        
        # First activity
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
        ]
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        assert resp.status_code == 200
        
        # Manually update last_activity_date to 2 days ago (missed yesterday)
        db_session.query(PlayerProfile).filter(
            PlayerProfile.account_id == guest_account["account_id"]
        ).update({PlayerProfile.last_activity_date: date.today() - timedelta(days=2)})
        db_session.commit()
        
        # Activity today (missed a day)
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [{"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10}]
        }, headers=headers)
        assert resp.status_code == 200
        
        # Verify streak reset to 1
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1
    
    @pytest.mark.asyncio
    async def test_same_day_no_streak_increment(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """Multiple activities on same day should not increment streak"""
        headers = guest_account["headers"]
        
        # First activity
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
        ]
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        assert resp.status_code == 200
        
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1
        
        # Second activity same day
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [{"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10}]
        }, headers=headers)
        assert resp.status_code == 200
        
        # Streak should still be 1
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1


class TestConcurrency:
    """Tests for concurrent submission protection"""
    
    @pytest.mark.asyncio
    async def test_concurrent_submissions_no_double_award(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """Concurrent submissions for same level should not double-award rewards"""
        headers = guest_account["headers"]
        
        # Get module and difficulty IDs dynamically
        from app.models.content import Module, DifficultyLevel
        module = db_session.query(Module).filter(Module.slug == 'apt').first()
        difficulty = db_session.query(DifficultyLevel).filter(DifficultyLevel.slug == 'easy').first()
        
        # Prepare two identical submissions for the same level
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 10},
        ]
        
        # Submit concurrently
        async def submit_once():
            return await async_client.post("/api/quiz/submit", json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": 1,
                "answers": answers
            }, headers=headers)
        
        results = await asyncio.gather(submit_once(), submit_once())
        
        # Both should succeed (or one might fail with conflict)
        # But only one should award rewards
        total_xp = sum(r.json()['rewards']['xp_earned'] for r in results)
        total_coins = sum(r.json()['rewards']['coins_earned'] for r in results)
        total_stars = sum(r.json()['rewards']['stars_earned'] for r in results)
        
        # Should only award once: 40 XP, 10 coins, 3 stars
        assert total_xp == 40
        assert total_coins == 10
        assert total_stars == 3
        
        # Verify profile
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 40
        assert profile['coins'] == 10
        assert profile['stars'] == 3
        
        # Verify only one progress record
        count = db_session.query(PlayerLevelProgress).filter(
            PlayerLevelProgress.account_id == guest_account["account_id"],
            PlayerLevelProgress.module_id == module.id,
            PlayerLevelProgress.difficulty_id == difficulty.id,
            PlayerLevelProgress.level_number == 1
        ).count()
        assert count == 1


class TestProgressEndpoint:
    """Tests for the progress endpoint"""
    
    @pytest.mark.asyncio
    async def test_get_progress_returns_all_modules(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """GET /api/quiz/progress should return progress for all 8 modules × 3 difficulties × 50 levels"""
        headers = guest_account["headers"]
        
        # Complete a few levels first
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
        
        resp = await async_client.get("/api/quiz/progress", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        # Should have profile and modules
        assert 'profile' in data
        assert 'modules' in data
        
        # Verify profile fields
        profile = data['profile']
        assert 'xp' in profile
        assert 'coins' in profile
        assert 'stars' in profile
        assert 'streak' in profile
        assert 'player_id' in profile
        
        # Should have 8 modules
        assert len(data['modules']) == 8
        
        # Each module has module_slug, module_name, and levels (flat list of 150 levels = 3 difficulties × 50 levels)
        for module in data['modules']:
            assert 'module_slug' in module
            assert 'module_name' in module
            assert 'levels' in module
            assert len(module['levels']) == 150  # 3 difficulties × 50 levels
            
            for level in module['levels']:
                assert 'module' in level
                assert 'difficulty' in level
                assert 'level' in level
                assert 'stars_earned' in level
                assert 'best_accuracy' in level
                assert 'completed_at' in level
        
        # Verify apt/easy/1 has progress
        apt_module = next(m for m in data['modules'] if m['module_slug'] == 'apt')
        level1 = next(l for l in apt_module['levels'] if l['module'] == 'apt' and l['difficulty'] == 'easy' and l['level'] == 1)
        assert level1['stars_earned'] == 3
        assert level1['best_accuracy'] == 100
        assert level1['completed_at'] is not None
        
        # Other levels should not be completed
        level2 = next(l for l in apt_module['levels'] if l['module'] == 'apt' and l['difficulty'] == 'easy' and l['level'] == 2)
        assert level2['stars_earned'] == 0
        assert level2['best_accuracy'] == 0
        assert level2['completed_at'] is None
        
        # Verify another player's progress cannot be accessed through this endpoint
        # (endpoint is auth-protected and returns only current user's progress)
        # This is implicitly tested by the auth dependency


class TestQuizHistory:
    """Tests for quiz attempt history endpoints"""
    
    @pytest.mark.asyncio
    async def test_get_attempts_list(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """GET /api/quiz/attempts should return paginated attempt history"""
        headers = guest_account["headers"]
        
        # Submit a few attempts
        for level in [1, 2]:
            answers = [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            ]
            if level == 2:
                answers = [
                    {"question_id": test_questions['q4_ids'][i], "selected_option_id": test_questions['q4_correct_opts'][i], "time_seconds": 10}
                    for i in range(10)
                ]
            await async_client.post("/api/quiz/submit", json={
                "session_type": "practice",
                "module": "apt",
                "difficulty": "easy",
                "level": level,
                "answers": answers
            }, headers=headers)
        
        resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert 'attempts' in data
        assert 'total' in data
        assert 'page' in data
        assert 'size' in data
        assert len(data['attempts']) >= 2
        assert data['total'] >= 2
        
        # Check attempt structure
        attempt = data['attempts'][0]
        assert 'id' in attempt
        assert 'session_type' in attempt
        assert 'module' in attempt
        assert 'difficulty' in attempt
        assert 'level' in attempt
        assert 'total_questions' in attempt
        assert 'correct_answers' in attempt
        assert 'accuracy_percent' in attempt
        assert 'total_time_seconds' in attempt
        assert 'xp_earned' in attempt
        assert 'coins_earned' in attempt
        assert 'multiplier' in attempt
        assert 'completed_at' in attempt
    
    @pytest.mark.asyncio
    async def test_get_attempt_detail(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """GET /api/quiz/attempts/{id} should return detailed attempt with questions"""
        headers = guest_account["headers"]
        
        # Submit an attempt
        answers = [
            {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_wrong_opt'], "time_seconds": 10},
        ]
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": answers
        }, headers=headers)
        
        # Get the attempt ID from the list endpoint
        resp = await async_client.get("/api/quiz/attempts", headers=headers)
        assert resp.status_code == 200
        attempt_id = resp.json()['attempts'][0]['id']
        
        # Get detail
        resp = await async_client.get(f"/api/quiz/attempts/{attempt_id}", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert data['id'] == attempt_id
        assert 'questions' in data
        assert len(data['questions']) == 2
        
        for q in data['questions']:
            assert 'question_id' in q
            assert 'question_text' in q
            assert 'explanation' in q
            assert 'selected_option_id' in q
            assert 'selected_option_text' in q
            assert 'correct_option_id' in q
            assert 'correct_option_text' in q
            assert 'is_correct' in q
            assert 'time_seconds' in q
    
    @pytest.mark.asyncio
    async def test_get_attempts_summary(self, async_client: AsyncClient, guest_account: dict, test_questions: dict, db_session):
        """GET /api/quiz/attempts/summary should return aggregated stats"""
        headers = guest_account["headers"]
        
        # Submit attempts
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
        
        await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            ]
        }, headers=headers)
        
        resp = await async_client.get("/api/quiz/attempts/summary", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        
        assert 'total_attempts' in data
        assert 'total_questions' in data
        assert 'total_correct' in data
        assert 'avg_accuracy_percent' in data
        assert 'total_time_seconds' in data
        assert 'total_xp_earned' in data
        assert 'total_coins_earned' in data
        assert 'by_module' in data
        assert 'by_difficulty' in data
        assert 'by_session_type' in data
        
        assert data['total_attempts'] >= 2


# Import get_db for direct database queries in tests
from app.database import get_db