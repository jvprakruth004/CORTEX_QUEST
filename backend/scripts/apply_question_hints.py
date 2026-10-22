"""Apply authored sample hints to matching existing development questions.

This utility only fills empty `questions.hint_text` fields. It never inserts,
updates, or deletes questions, options, accounts, attempts, or progress.
`--apply --confirm-db cortex_quest` is required for database writes.
"""

import argparse
import json
import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.models.content import DifficultyLevel, Module, Question
from app.services.duplicate_detector import normalize_question_text


BACKEND_DIR = Path(__file__).resolve().parents[1]
HINT_CATALOG = BACKEND_DIR / "data" / "development_question_hints.json"
EXPECTED_DATABASE = "cortex_quest"


def load_hint_catalog() -> list[dict]:
    questions = json.loads(HINT_CATALOG.read_text(encoding="utf-8"))
    for index, question in enumerate(questions, 1):
        hint = question.get("hint_text")
        if not isinstance(hint, str) or not hint.strip() or len(hint) > 1000:
            raise ValueError(f"Hint catalog entry {index} has invalid hint text")
        required = ("module", "difficulty", "level_number", "question_text")
        if any(not question.get(field) for field in required):
            raise ValueError(f"Hint catalog entry {index} is missing its exact question key")
    return questions


def plan_hint_updates(session: Session, samples: list[dict]) -> tuple[list[tuple[Question, str]], int, int]:
    modules = {item.id: item.slug for item in session.query(Module).all()}
    difficulties = {item.id: item.slug for item in session.query(DifficultyLevel).all()}
    candidates: dict[tuple[str, str, int, str], list[Question]] = {}

    for question in session.query(Question).all():
        module_slug = modules.get(question.module_id)
        difficulty_slug = difficulties.get(question.difficulty_id)
        if not module_slug or not difficulty_slug:
            continue
        key = (module_slug, difficulty_slug, question.level_number, normalize_question_text(question.question_text))
        candidates.setdefault(key, []).append(question)

    updates: list[tuple[Question, str]] = []
    already_authored = 0
    unmatched = 0
    ambiguous: list[str] = []
    for sample in samples:
        key = (
            sample["module"],
            sample["difficulty"],
            sample["level_number"],
            normalize_question_text(sample["question_text"]),
        )
        matches = candidates.get(key, [])
        if not matches:
            unmatched += 1
            continue
        if len(matches) != 1:
            ambiguous.append(f"{sample['module']} level {sample['level_number']}")
            continue
        question = matches[0]
        correct_options = [option.option_text for option in question.options if option.is_correct]
        if len(correct_options) != 1:
            raise ValueError(f"Question {question.id} must have exactly one correct option")
        answer = " ".join(correct_options[0].casefold().split())
        hint_normalized = " ".join(sample["hint_text"].casefold().split())
        if len(answer) >= 2 and answer in hint_normalized:
            raise ValueError(f"Hint catalog text for question {question.id} repeats its correct option")
        if question.hint_text and question.hint_text.strip():
            already_authored += 1
        else:
            updates.append((question, sample["hint_text"]))

    if ambiguous:
        raise ValueError(f"Refusing ambiguous question matches ({len(ambiguous)} found)")
    return updates, already_authored, unmatched


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write missing hints after all safety checks")
    parser.add_argument("--confirm-db", help="Must be exactly cortex_quest when --apply is specified")
    args = parser.parse_args()

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        parser.error("DATABASE_URL must be explicitly set; this tool never loads a database URL from .env")
    if make_url(database_url).database != EXPECTED_DATABASE:
        raise SystemExit("Refusing: DATABASE_URL must target cortex_quest")
    if args.apply and args.confirm_db != EXPECTED_DATABASE:
        raise SystemExit("Refusing writes: pass --confirm-db cortex_quest")

    samples = load_hint_catalog()
    engine = create_engine(database_url, connect_args={"connect_timeout": 3})
    try:
        with engine.connect() as connection:
            actual_database = connection.execute(text("SELECT current_database()")).scalar_one()
        if actual_database != EXPECTED_DATABASE:
            raise SystemExit("Refusing: server connection is not cortex_quest")

        with Session(engine) as session:
            with session.begin():
                updates, already_authored, unmatched = plan_hint_updates(session, samples)
                if args.apply and unmatched:
                    raise SystemExit(f"Refusing partial import: {unmatched} authored samples have no exact existing question")

                mode = "APPLY" if args.apply else "DRY RUN"
                print(
                    f"{mode} on verified {actual_database}: {len(updates)} empty hints to fill, "
                    f"{already_authored} existing hints preserved, {unmatched} unmatched samples."
                )
                if args.apply:
                    for question, hint in updates:
                        question.hint_text = hint
            if args.apply:
                print(f"Filled {len(updates)} hint fields; no question records were inserted or deleted.")
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
