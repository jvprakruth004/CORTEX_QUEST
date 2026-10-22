"""Test that imported sample questions are retrievable via the practice endpoint."""

import json
from pathlib import Path

import pytest
from httpx import AsyncClient


class TestSampleQuestionBank:
    """Verify the curated question bank is correctly retrievable."""

    MODULES = ['apt', 'di', 'lr', 'gk', 'prog', 'cs', 'eng', 'med']

    @pytest.mark.asyncio
    async def test_curated_questions_are_retrievable_from_their_declared_submodules(
        self, async_client: AsyncClient, guest_account: dict
    ):
        """Every curated sample is reachable through its mapped UI submodule."""
        catalog = json.loads((Path(__file__).parent / "data" / "sample_questions.json").read_text(encoding="utf-8"))
        grouped = {}
        for question in catalog:
            key = (question["module"], question["submodule"], question["difficulty"], question["level_number"])
            grouped.setdefault(key, set()).add(question["question_text"])

        for (module, submodule, difficulty, level), expected_texts in grouped.items():
            response = await async_client.get(
                "/api/quiz/practice",
                params={
                    "module": module,
                    "submodule": submodule,
                    "difficulty": difficulty,
                    "level": level,
                    "count": 20,
                },
                headers=guest_account["headers"],
            )
            assert response.status_code == 200, f"{module}/{submodule} failed: {response.text}"
            returned = {question["question_text"] for question in response.json()["questions"]}
            assert expected_texts <= returned, f"Missing curated questions from {module}/{submodule} level {level}"

    @pytest.mark.asyncio
    async def test_all_modules_have_at_least_three_seed_questions(self, async_client: AsyncClient, guest_account: dict):
        """Each module should return at least 3 curated questions for easy/level=1."""
        headers = guest_account["headers"]
        
        for module in self.MODULES:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": module, "difficulty": "easy", "level": 1, "count": 20},
                headers=headers
            )
            
            assert resp.status_code == 200, f"Module {module} failed: {resp.text}"
            data = resp.json()
            
            # Each module has at least 3 questions in the curated bank.
            assert data['total'] >= 3, f"Module {module}: expected at least 3 questions, got {data['total']}"
            assert len(data['questions']) >= 3, f"Module {module}: expected at least 3 questions in array"
            
            # Verify structure of first 3 questions (the seed ones)
            for q in data['questions'][:3]:
                assert 'id' in q
                assert 'question_text' in q
                assert len(q['question_text']) > 0
                assert 'options' in q
                assert len(q['options']) == 4, f"Question {q['id']} should have 4 options"
                
                for opt in q['options']:
                    assert 'id' in opt
                    assert 'text' in opt
                    assert 'display_order' in opt
                    assert 'is_correct' not in opt, f"Option {opt['id']} should not expose is_correct"

    @pytest.mark.asyncio
    async def test_question_texts_match_expected_modules(self, async_client: AsyncClient, guest_account: dict):
        """Verify question content matches expected module topics."""
        headers = guest_account["headers"]
        
        # Check apt module has percentage/math questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        apt_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('%' in q for q in apt_questions), "apt should have percentage questions"
        
        # Check di module has data interpretation questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "di", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        di_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('chart' in q.lower() or 'graph' in q.lower() or 'pie' in q.lower() for q in di_questions)
        
        # Check lr module has logic questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "lr", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        lr_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('pattern' in q.lower() or 'odd' in q.lower() or 'flower' in q.lower() for q in lr_questions)
        
        # Check gk module has general knowledge questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "gk", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        gk_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('capital' in q.lower() or 'planet' in q.lower() or 'continent' in q.lower() for q in gk_questions)
        
        # Check prog module has programming questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "prog", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        prog_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('HTML' in q or 'Python' in q or 'function' in q or 'print' in q for q in prog_questions)
        
        # Check cs module has computer science questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "cs", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        cs_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('CPU' in q or 'RAM' in q or 'binary' in q for q in cs_questions)
        
        # Check eng module has engineering questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "eng", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        eng_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('force' in q.lower() or 'energy' in q.lower() or 'resistance' in q.lower() or 'ohm' in q.lower() for q in eng_questions)
        
        # Check med module has medical questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "med", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        med_questions = [q['question_text'] for q in resp.json()['questions']]
        assert any('heart' in q.lower() or 'blood' in q.lower() or 'temperature' in q.lower() for q in med_questions)

    @pytest.mark.asyncio
    async def test_options_structure_no_correct_exposed(self, async_client: AsyncClient, guest_account: dict):
        """Every option should have id, text, display_order but NOT is_correct."""
        headers = guest_account["headers"]
        
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 20},
            headers=headers
        )
        data = resp.json()
        
        for q in data['questions']:
            for opt in q['options']:
                # Must have these fields
                assert 'id' in opt
                assert 'text' in opt
                assert 'display_order' in opt
                # Must NOT have is_correct
                assert 'is_correct' not in opt, f"Option {opt['id']} incorrectly exposes is_correct"
                # display_order should be 0, 1, 2, or 3
                assert opt['display_order'] in [0, 1, 2, 3]
            # All 4 display_orders should be present
            orders = sorted(opt['display_order'] for opt in q['options'])
            assert orders == [0, 1, 2, 3], f"Question {q['id']} has invalid display_order sequence: {orders}"

    @pytest.mark.asyncio
    async def test_all_eight_modules_in_one_call(self, async_client: AsyncClient, guest_account: dict):
        """Quick smoke test: all 8 modules respond successfully."""
        headers = guest_account["headers"]
        
        for module in self.MODULES:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": module, "difficulty": "easy", "level": 1, "count": 5},
                headers=headers
            )
            assert resp.status_code == 200, f"Module {module} returned {resp.status_code}"
            assert resp.json()['total'] >= 3, f"Module {module} has fewer than 3 questions"

    @pytest.mark.asyncio
    async def test_seed_questions_count_across_modules(self, async_client: AsyncClient, guest_account: dict):
        """Verify at least 3 easy level-one questions per module."""
        headers = guest_account["headers"]
        
        seed_total = 0
        for module in self.MODULES:
            resp = await async_client.get(
                "/api/quiz/practice",
                params={"module": module, "difficulty": "easy", "level": 1, "count": 20},
                headers=headers
            )
            seed_count = min(3, resp.json()['total'])
            seed_total += seed_count
        
        assert seed_total == 24, f"Expected 24 seed questions across modules, got {seed_total}"
