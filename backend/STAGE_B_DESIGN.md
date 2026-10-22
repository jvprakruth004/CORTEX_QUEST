# Stage B Design: Independent Submodule Progress Tracking & Submodule-Aware Quiz History

## Overview

Stage B extends the Stage A foundation (submodule-aware quiz retrieval/submission) to provide **independent progress tracking per submodule** and **submodule-aware quiz history**. This enables players to track mastery at the submodule level (e.g., "Arithmetic" within "Aptitude") rather than just at the module level.

---

## 1. Existing Model Inspection

### 1.1 PlayerLevelProgress (`app/models/player_progress.py`)

**Current PK:** `(account_id, module_id, difficulty_id, level_number)`  
**Tracks:** `best_accuracy`, `stars_earned`, `completed_at`

**Limitations:**
- No submodule granularity — progress is per `(module, difficulty, level)` only
- Cannot distinguish "Arithmetic L1 Easy" from "Time & Work L1 Easy" within same module/difficulty/level
- Rewards awarded on first completion of any submodule at that level; no per-submodule replay rewards

### 1.2 QuizAttempt (`app/models/quiz_history.py`)

**Current fields:** `module_id`, `difficulty_id`, `level_number` (all nullable)  
**No submodule_id** — cannot attribute attempts to specific submodules

### 1.3 QuizAttemptQuestion (`app/models/quiz_history.py`)

**References:** `question_id` (FK to Question)  
**Question has:** `submodule_id` (added in Stage A)  
**Implication:** Submodule can be inferred from questions, but not directly stored on attempt

### 1.4 Question (`app/models/content.py`)

**Has:** `submodule_id` (nullable, FK to Submodule)  
**All 101 questions in test DB assigned to one of 24 submodules**

---

## 2. Proposed Model Changes

### 2.1 PlayerLevelProgress — Add submodule_id to PK

```python
# NEW PK: (account_id, module_id, difficulty_id, submodule_id, level_number)
# submodule_id: nullable FK to Submodule, but required for submodule-scoped progress
```

**Migration strategy:**
- Add `submodule_id` column (nullable Integer, FK to submodules.id, ondelete=CASCADE)
- Update PK to include `submodule_id`
- Add `Index("ix_player_level_progress_account_submodule", "account_id", "submodule_id")`
- Add `CheckConstraint` for submodule_id validity

**Backward compatibility:**
- Legacy progress records (no submodule) → `submodule_id = NULL`
- New completions with submodule → `submodule_id = <submodule.id>`
- Query logic: `WHERE submodule_id IS NULL OR submodule_id = ?`
- **Risk:** First completion of a level via submodule A awards rewards; later completion via submodule B (same level) would NOT award rewards if we only check `(module, difficulty, level)`. Must update progress logic to check full PK including submodule.

### 2.2 QuizAttempt — Add submodule_id

```python
submodule_id = Column(
    Integer,
    ForeignKey("submodules.id", ondelete="SET NULL"),
    nullable=True,
    index=True,
)
```

**Migration strategy:**
- Add `submodule_id` column (nullable, FK to submodules.id, ondelete=SET NULL)
- Add `Index("ix_quiz_attempts_account_submodule", "account_id", "submodule_id")`
- Populate from submitted questions' submodule (all questions in a practice attempt must share same submodule per Stage A validation)

### 2.3 QuizAttemptQuestion — No change needed

Submodule is already inferable via `question.submodule_id`. For explicit denormalization (optional), could add `submodule_id` but not required.

---

## 3. Migration Strategy

### Migration File: `add_submodule_to_progress_and_attempts.py`

```python
"""Add submodule_id to player_level_progress and quiz_attempts"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1. Add submodule_id to quiz_attempts
    op.add_column("quiz_attempts", sa.Column("submodule_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_quiz_attempts_submodule_id",
        "quiz_attempts", "submodules",
        ["submodule_id"], ["id"],
        ondelete="SET NULL"
    )
    op.create_index("ix_quiz_attempts_account_submodule", "quiz_attempts", ["account_id", "submodule_id"])

    # 2. Add submodule_id to player_level_progress
    op.add_column("player_level_progress", sa.Column("submodule_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_player_level_progress_submodule_id",
        "player_level_progress", "submodules",
        ["submodule_id"], ["id"],
        ondelete="CASCADE"
    )
    op.create_index("ix_player_level_progress_account_submodule", "player_level_progress", ["account_id", "submodule_id"])

    # 3. Update PK of player_level_progress (requires recreating table in SQLite, but PostgreSQL supports ALTER)
    # For PostgreSQL: drop PK, add column to PK
    # op.drop_constraint("pk_player_level_progress", "player_level_progress", type_="primary")
    # op.create_primary_key("pk_player_level_progress", "player_level_progress", 
    #     ["account_id", "module_id", "difficulty_id", "submodule_id", "level_number"])

def downgrade():
    op.drop_index("ix_player_level_progress_account_submodule", table_name="player_level_progress")
    op.drop_constraint("fk_player_level_progress_submodule_id", "player_level_progress", type_="foreignkey")
    op.drop_column("player_level_progress", "submodule_id")

    op.drop_index("ix_quiz_attempts_account_submodule", table_name="quiz_attempts")
    op.drop_constraint("fk_quiz_attempts_submodule_id", "quiz_attempts", type_="foreignkey")
    op.drop_column("quiz_attempts", "submodule_id")
```

**Note:** PK change on `player_level_progress` requires careful handling. In PostgreSQL:
```sql
ALTER TABLE player_level_progress DROP CONSTRAINT pk_player_level_progress;
ALTER TABLE player_level_progress ADD PRIMARY KEY (account_id, module_id, difficulty_id, submodule_id, level_number);
```
But `submodule_id` is nullable — PostgreSQL allows NULL in PK only if all columns allow NULL (not the case). **Solution:** Make `submodule_id` non-nullable with a sentinel value (0) for "no submodule", or keep nullable and use a partial unique index instead of PK.

**Recommended approach:** Keep PK as-is, add **unique constraint** on `(account_id, module_id, difficulty_id, submodule_id, level_number)` where `submodule_id` is nullable (PostgreSQL treats NULL as distinct). Then add `submodule_id` as nullable column.

```python
op.create_unique_constraint(
    "uq_player_level_progress_account_module_difficulty_submodule_level",
    "player_level_progress",
    ["account_id", "module_id", "difficulty_id", "submodule_id", "level_number"]
)
```

This avoids PK modification and handles legacy NULL submodule correctly.

---

## 4. API Response Changes

### 4.1 Schemas (`app/schemas/quiz.py`)

**Add to `AttemptSummaryResponse`:**
```python
submodule: Optional[str] = None  # submodule slug
```

**Add to `AttemptDetailResponse`:** (inherits from AttemptSummaryResponse)

**Add to `LevelProgressResponse`:**
```python
submodule: Optional[str] = None  # submodule slug for submodule-scoped progress
```

**Add to `ModuleProgressResponse`:**
```python
# levels now include submodule field
```

**New schema for submodule-level summary:**
```python
class SubmoduleProgressResponse(BaseModel):
    module_slug: str
    module_name: str
    submodule_slug: str
    submodule_name: str
    difficulties: List[DifficultyProgressResponse]  # nested difficulty progress

class DifficultyProgressResponse(BaseModel):
    difficulty: str
    levels: List[LevelProgressResponse]  # with submodule field
```

**Add to `AttemptSummaryStats`:**
```python
by_submodule: List[dict]  # {submodule, module, attempts, questions, correct, xp}
```

### 4.2 Endpoint Updates

| Endpoint | Changes |
|----------|---------|
| `GET /api/quiz/attempts` | Add `submodule` filter param; include `submodule` in response items |
| `GET /api/quiz/attempts/summary` | Add `by_submodule` aggregation |
| `GET /api/quiz/attempts/{attempt_id}` | Include `submodule` in response |
| `GET /api/quiz/progress` | **Major restructure**: Return nested `ModuleProgressResponse` with `submodules` array containing `DifficultyProgressResponse` with `LevelProgressResponse` (each with `submodule` field) |

---

## 5. Backward Compatibility Risks

| Risk | Mitigation |
|------|------------|
| Legacy progress records have `submodule_id = NULL` | Query with `WHERE submodule_id IS NULL OR submodule_id = ?`; treat NULL as "module-wide" |
| Existing `GET /progress` consumers expect flat structure | **Option A:** Add new endpoint `/progress/v2` with nested structure; keep `/progress` unchanged (safest). **Option B:** Add `?include_submodules=true` query param to toggle format. |
| Reward logic: first completion via submodule A awards rewards; submodule B same level should also award | Update `submit_quiz` progress logic: query by full PK including `submodule_id`; only skip rewards if exact same `(module, difficulty, submodule, level)` completed before |
| Migration: existing unique PK on `(account_id, module_id, difficulty_id, level_number)` conflicts with new unique constraint | Drop old PK, add new unique constraint with submodule_id (see Migration Strategy) |

---

## 6. Required Files to Modify

| File | Purpose |
|------|---------|
| `app/models/player_progress.py` | Add `submodule_id` column, unique constraint, index, relationship |
| `app/models/quiz_history.py` | Add `submodule_id` column, FK, index to `QuizAttempt` |
| `app/schemas/quiz.py` | Add `submodule` field to response schemas; add new submodule progress schemas |
| `app/api/quiz.py` | Update `submit_quiz` to save `submodule_id` on attempt; update progress logic to use submodule-scoped PK; update `list_attempts`, `get_attempts_summary`, `get_attempt`, `get_player_progress` |
| `migrations/versions/xxx_add_submodule_to_progress_and_attempts.py` | New migration file |
| `test_submodule_quiz.py` | Add Stage B tests (see Test Plan) |
| `test_progress.py` | Update for submodule-aware progress |

---

## 7. Test Plan

### 7.1 Model Tests
- [ ] `PlayerLevelProgress` with `submodule_id` creates/reads correctly
- [ ] Unique constraint prevents duplicate `(account, module, difficulty, submodule, level)`
- [ ] NULL submodule treated as distinct from specific submodule
- [ ] `QuizAttempt` with `submodule_id` creates/reads correctly
- [ ] FK cascades work (submodule deletion → SET NULL on attempt, CASCADE on progress)

### 7.2 API Tests — Progress Endpoint
- [ ] `GET /quiz/progress` returns nested structure with submodules
- [ ] Legacy progress (NULL submodule) appears under module with `submodule: null`
- [ ] New submodule progress appears under correct submodule
- [ ] Stars/accuracy tracked independently per submodule
- [ ] Completing "Arithmetic L1 Easy" doesn't mark "Time & Work L1 Easy" complete

### 7.3 API Tests — History Endpoints
- [ ] `GET /quiz/attempts?submodule=apt-arithmetic` filters correctly
- [ ] `GET /quiz/attempts` includes `submodule` in each item
- [ ] `GET /quiz/attempts/summary` includes `by_submodule` aggregation
- [ ] `GET /quiz/attempts/{id}` includes `submodule` field
- [ ] Legacy attempts (no submodule) show `submodule: null`

### 7.4 Integration Tests — Submission Flow
- [ ] Submit with submodule → attempt saved with `submodule_id`
- [ ] Submit with submodule → progress created with `submodule_id` in PK
- [ ] Replay same submodule/level → no XP/coins, stars update if improved
- [ ] Different submodule, same level → awards XP/coins/stars (independent)
- [ ] Legacy submit (no submodule) → progress with `submodule_id = NULL`

### 7.5 Backward Compatibility Tests
- [ ] All existing `test_milestone4.py` tests pass
- [ ] All existing `test_progress.py` tests pass
- [ ] All existing `test_quiz_api_e2e.py` tests pass
- [ ] All Stage A tests (`test_submodule_quiz.py`) pass

---

## 8. Recommended Implementation Order

1. **Migration** — Create and run migration adding `submodule_id` to both tables with unique constraint
2. **Models** — Update `PlayerLevelProgress` and `QuizAttempt` models
3. **Schemas** — Add `submodule` fields to response schemas; add new nested progress schemas
4. **Quiz Submit Logic** — Update `submit_quiz` to:
   - Save `submodule_id` on `QuizAttempt`
   - Query/create `PlayerLevelProgress` using full PK including `submodule_id`
   - Award rewards independently per submodule
5. **History Endpoints** — Update `list_attempts`, `get_attempts_summary`, `get_attempt` to include/filter by submodule
6. **Progress Endpoint** — Implement new nested structure (consider `/progress/v2` or query param for backward compatibility)
7. **Tests** — Add comprehensive test coverage per Test Plan
8. **Verify** — Run full test suite (57 existing + new tests)

---

## 9. Open Questions

1. **Progress endpoint backward compatibility:** New endpoint (`/progress/v2`) vs query param (`?v=2` or `?include_submodules=true`)?
2. **NULL submodule semantics:** Should legacy "module-wide" progress be visible under each submodule, or only at module root?
3. **Submodule completion definition:** Is a submodule "complete" when all 50 levels at all 3 difficulties have ≥1 star? Or per-difficulty?
4. **Mock tests:** Should mock attempts also track submodule? (Currently mock doesn't require module/difficulty/level)

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Migration + Models | 1-2 hours |
| Submit logic update | 1-2 hours |
| History endpoints | 1 hour |
| Progress endpoint (nested) | 2-3 hours |
| Tests | 2-3 hours |
| **Total** | **7-11 hours** |

---

*Design complete. Ready for implementation upon approval.*