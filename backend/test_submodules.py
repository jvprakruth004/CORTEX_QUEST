"""Tests for submodules API endpoints."""

import pytest
from httpx import AsyncClient


class TestSubmodules:
    """Test submodule listing and validation."""

    MODULE_SLUGS = ["apt", "di", "lr", "gk", "prog", "cs", "eng", "med"]

    @pytest.mark.asyncio
    async def test_three_submodules_per_module(self, async_client: AsyncClient):
        """Each main module should have exactly three active submodules."""
        for module_slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules")
            assert resp.status_code == 200, f"Failed for module {module_slug}: {resp.text}"
            data = resp.json()
            assert data["total"] == 3, f"Module {module_slug} has {data['total']} submodules, expected 3"
            assert len(data["submodules"]) == 3
            assert data["module_slug"] == module_slug
            assert data["module_name"] is not None

    @pytest.mark.asyncio
    async def test_all_24_submodules_seeded(self, async_client: AsyncClient):
        """Total of 24 submodules across all modules."""
        total = 0
        all_slugs = []
        for module_slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules")
            assert resp.status_code == 200
            data = resp.json()
            total += data["total"]
            all_slugs.extend([s["slug"] for s in data["submodules"]])
        assert total == 24, f"Expected 24 submodules total, got {total}"

    @pytest.mark.asyncio
    async def test_globally_unique_submodule_slugs(self, async_client: AsyncClient):
        """All 24 submodule slugs must be globally unique."""
        all_slugs = []
        for module_slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules")
            assert resp.status_code == 200
            all_slugs.extend([s["slug"] for s in resp.json()["submodules"]])
        assert len(all_slugs) == 24
        assert len(set(all_slugs)) == 24, f"Duplicate slugs found: {all_slugs}"

    @pytest.mark.asyncio
    async def test_valid_parent_module_relationships(self, async_client: AsyncClient):
        """Each submodule must reference a valid parent module via the API structure."""
        for module_slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules")
            assert resp.status_code == 200
            data = resp.json()
            assert data["module_slug"] == module_slug
            for submodule in data["submodules"]:
                # Submodule slug should start with parent module slug
                assert submodule["slug"].startswith(f"{module_slug}-"), \
                    f"Submodule {submodule['slug']} doesn't belong to module {module_slug}"

    @pytest.mark.asyncio
    async def test_display_order_sorting(self, async_client: AsyncClient):
        """Submodules should be returned in display_order ascending."""
        for module_slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{module_slug}/submodules")
            assert resp.status_code == 200
            data = resp.json()
            orders = [s["display_order"] for s in data["submodules"]]
            assert orders == sorted(orders), f"Module {module_slug} submodules not ordered: {orders}"
            # Should be 1, 2, 3
            assert orders == [1, 2, 3]

    @pytest.mark.asyncio
    async def test_unknown_module_returns_404(self, async_client: AsyncClient):
        """Requesting submodules for non-existent module returns 404."""
        resp = await async_client.get("/api/modules/nonexistent/submodules")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Module not found"

    @pytest.mark.asyncio
    async def test_inactive_module_returns_404(self, async_client: AsyncClient, db_session):
        """Requesting submodules for inactive module returns 404."""
        from app.models.content import Module
        # Deactivate a module
        module = db_session.query(Module).filter(Module.slug == "apt").first()
        original_active = module.is_active
        module.is_active = 0
        db_session.commit()

        try:
            resp = await async_client.get("/api/modules/apt/submodules")
            assert resp.status_code == 404
        finally:
            # Restore
            module.is_active = original_active
            db_session.commit()

    @pytest.mark.asyncio
    async def test_existing_module_endpoints_unaffected(self, async_client: AsyncClient):
        """Existing module endpoints should continue to work."""
        # GET /api/modules
        resp = await async_client.get("/api/modules")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 8
        assert len(data["modules"]) == 8

        # GET /api/modules/{slug}
        for slug in self.MODULE_SLUGS:
            resp = await async_client.get(f"/api/modules/{slug}")
            assert resp.status_code == 200
            assert resp.json()["slug"] == slug

    @pytest.mark.asyncio
    async def test_existing_quiz_endpoints_unaffected(self, async_client: AsyncClient, guest_account: dict):
        """Existing quiz endpoints should continue to work."""
        headers = guest_account["headers"]
        # Practice questions
        resp = await async_client.get(
            "/api/quiz/practice",
            params={"module": "apt", "difficulty": "easy", "level": 1, "count": 1},
            headers=headers
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["module"] == "apt"
        assert len(data["questions"]) >= 1

        # Submit a mock quiz (doesn't affect progress)
        q = data["questions"][0]
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

    @pytest.mark.asyncio
    async def test_submodule_response_schema(self, async_client: AsyncClient):
        """Verify submodule response contains all required fields."""
        resp = await async_client.get("/api/modules/apt/submodules")
        assert resp.status_code == 200
        data = resp.json()

        # Check top-level structure
        assert "module_slug" in data
        assert "module_name" in data
        assert "submodules" in data
        assert "total" in data

        # Check each submodule has required fields
        for submodule in data["submodules"]:
            assert "id" in submodule
            assert "slug" in submodule
            assert "name" in submodule
            assert "description" in submodule  # Can be null
            assert "display_order" in submodule
            assert "is_active" in submodule
            assert isinstance(submodule["is_active"], int)
            assert submodule["is_active"] == 1