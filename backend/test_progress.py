"""Legacy progress tests migrated to pytest with test database isolation."""

import pytest
from httpx import AsyncClient


class TestLegacyProgress:
    """Migrated legacy progress tracking tests using pytest fixtures."""

    @pytest.mark.asyncio
    async def test_first_completion_100_percent_accuracy(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """First completion with 100% accuracy awards 3 stars."""
        headers = guest_account["headers"]
        
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 40
        assert data['rewards']['coins_earned'] == 10
        assert data['rewards']['stars_earned'] == 3
        assert data['summary']['accuracy_percent'] == 100

        # Verify profile updated
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 40
        assert profile['coins'] == 10
        assert profile['stars'] == 3
        assert profile['streak'] == 1

    @pytest.mark.asyncio
    async def test_replay_no_duplicate_rewards(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """Replay with same accuracy awards no duplicate rewards."""
        headers = guest_account["headers"]
        
        # First completion
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers)
        
        # Replay
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 15},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 20},
            ]
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 0
        assert data['rewards']['coins_earned'] == 0
        assert data['rewards']['stars_earned'] == 0
        
        # Verify profile unchanged
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 40
        assert profile['coins'] == 10
        assert profile['stars'] == 3

    @pytest.mark.asyncio
    async def test_below_threshold_then_medium_then_mock(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """Sequential test: below threshold -> medium 100% -> mock test."""
        headers = guest_account["headers"]
        
        # First completion (100% easy) - already done in test_first_completion, but we need it here for sequence
        # Actually, each test is isolated, so we need to do the full sequence in one test
        # Let's do: first completion -> below threshold -> medium -> mock
        
        # First completion: 100% easy level 1
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 40
        assert data['rewards']['coins_earned'] == 10
        assert data['rewards']['stars_earned'] == 3
        
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 40
        assert profile['coins'] == 10
        assert profile['stars'] == 3
        assert profile['streak'] == 1
        
        # Below threshold: 50% accuracy on same level
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_wrong_opt'], "time_seconds": 25},
            ]
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 0
        assert data['rewards']['coins_earned'] == 0
        assert data['rewards']['stars_earned'] == 0
        assert data['summary']['accuracy_percent'] == 50
        
        # Verify profile unchanged
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 40
        assert profile['coins'] == 10
        assert profile['stars'] == 3
        
        # Medium difficulty 100%
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "medium",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q3_id'], "selected_option_id": test_questions['q3_correct_opt'], "time_seconds": 10},
            ]
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 30
        assert data['rewards']['coins_earned'] == 7
        assert data['rewards']['stars_earned'] == 3
        
        # Verify profile updated
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 70  # 40 + 30
        assert profile['coins'] == 17  # 10 + 7
        assert profile['stars'] == 6  # 3 + 3
        
        # Mock test: global XP only
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers)
        
        assert resp.status_code == 200
        data = resp.json()
        assert data['rewards']['xp_earned'] == 40
        assert data['rewards']['coins_earned'] == 10
        assert data['rewards']['stars_earned'] == 0
        
        # Verify profile updated with mock XP but no stars
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['xp'] == 110  # 70 + 40
        assert profile['coins'] == 27  # 17 + 10
        assert profile['stars'] == 6  # unchanged

    @pytest.mark.asyncio
    async def test_same_day_streak_no_increment(self, async_client: AsyncClient, guest_account: dict, test_questions: dict):
        """Multiple activities on same day do not increment streak."""
        headers = guest_account["headers"]
        
        # First activity
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            ]
        }, headers=headers)
        
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1
        
        # Second activity same day
        await async_client.post("/api/quiz/submit", json={
            "session_type": "mock",
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 10},
            ]
        }, headers=headers)
        
        # Streak should still be 1
        resp = await async_client.get("/api/auth/me", headers=headers)
        profile = resp.json()['profile']
        assert profile['streak'] == 1

    @pytest.mark.asyncio
    async def test_account_isolation(self, async_client: AsyncClient, test_questions: dict):
        """Different accounts have isolated progress."""
        # Account 1
        resp1 = await async_client.post("/api/auth/guest", json={})
        auth_data1 = resp1.json()
        headers1 = {"Authorization": f"Bearer {auth_data1['access_token']}"}
        
        # Account 1 completes level
        await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers1)
        
        # Account 2
        resp2 = await async_client.post("/api/auth/guest", json={})
        auth_data2 = resp2.json()
        headers2 = {"Authorization": f"Bearer {auth_data2['access_token']}"}
        
        # Account 2 completes same level
        resp = await async_client.post("/api/quiz/submit", json={
            "session_type": "practice",
            "module": "apt",
            "difficulty": "easy",
            "level": 1,
            "answers": [
                {"question_id": test_questions['q1_id'], "selected_option_id": test_questions['q1_correct_opt'], "time_seconds": 20},
                {"question_id": test_questions['q2_id'], "selected_option_id": test_questions['q2_correct_opt'], "time_seconds": 25},
            ]
        }, headers=headers2)
        
        data = resp.json()
        assert data['rewards']['xp_earned'] == 40
        assert data['rewards']['stars_earned'] == 3
        
        # Verify account 1 unchanged
        resp = await async_client.get("/api/auth/me", headers=headers1)
        profile1 = resp.json()['profile']
        assert profile1['xp'] == 40
        assert profile1['stars'] == 3
        
        # Verify account 2 has own progress
        resp = await async_client.get("/api/auth/me", headers=headers2)
        profile2 = resp.json()['profile']
        assert profile2['xp'] == 40
        assert profile2['stars'] == 3