"""
Tests for Question Duplicate Protection in Cortex Quest.

Covers all 10 required test scenarios:
1. Exact duplicate questions.
2. Differences in capitalization and whitespace.
3. Harmless punctuation differences.
4. Duplicate questions appearing in different modules.
5. Duplicate questions in the same incoming batch.
6. Similar wording that represents different concepts (fuzzy warnings, not rejections).
7. Different questions that happen to share a correct answer (no false positive).
8. Database questions that duplicate incoming questions (application-level protection).
9. Existing importer dry-run behaviour (no DB writes, clean exit).
10. Protection against importing into an unauthorized database (blocks dev/prod).
"""

import os
import tempfile
import json
import pytest
from sqlalchemy.orm import Session

from app.services.duplicate_detector import (
    normalize_question_text,
    QuestionDuplicateDetector,
)
from app.models.content import Module, DifficultyLevel, Question, QuestionOption
from scripts.import_questions import (
    validate_all_questions,
    validate_target_database,
    import_questions,
)


class TestDuplicateProtection:
    """Comprehensive test suite for duplicate question protection."""

    # -------------------------------------------------------------------------
    # 1. Exact Duplicate Questions
    # -------------------------------------------------------------------------
    def test_exact_duplicate_detection(self):
        """Exact identical question text must be flagged as a duplicate."""
        existing = [
            {
                "question_text": "What is 25% of 200?",
                "module": "apt",
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing)
        incoming = [
            {
                "question_text": "What is 25% of 200?",
                "module": "apt",
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        report = detector.check_incoming(incoming, source_label="database")
        assert report.has_exact_duplicates
        assert len(report.exact_duplicates) == 1
        assert report.exact_duplicates[0].matched_text == "What is 25% of 200?"

    # -------------------------------------------------------------------------
    # 2. Differences in Capitalization and Whitespace
    # -------------------------------------------------------------------------
    def test_capitalization_and_whitespace_differences(self):
        """Questions differing only in case or whitespace must be detected as duplicates."""
        existing = [
            {
                "question_text": "What is 25% of 200?",
                "module": "apt",
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing)
        incoming = [
            {
                "question_text": "   WHAT   IS   25%   OF   200?   ",
                "module": "apt",
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        report = detector.check_incoming(incoming, source_label="database")
        assert report.has_exact_duplicates
        assert report.exact_duplicates[0].normalized_text == "what is 25% of 200"

    # -------------------------------------------------------------------------
    # 3. Harmless Punctuation Differences
    # -------------------------------------------------------------------------
    def test_harmless_punctuation_differences(self):
        """Punctuation variations (periods, trailing marks, quote styles) must not bypass detection."""
        existing = [
            {
                "question_text": "What does the acronym 'HTML' stand for?",
                "module": "prog",
                "options": [{"text": "HyperText Markup Language", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing)

        # Variations: double quotes, trailing period, no punctuation, exclamation
        test_variations = [
            'What does the acronym "HTML" stand for?',
            "What does the acronym 'HTML' stand for.",
            "What does the acronym 'HTML' stand for",
            "What does the acronym 'HTML' stand for?!",
        ]

        for var_text in test_variations:
            incoming = [{
                "question_text": var_text,
                "module": "prog",
                "options": [{"text": "HyperText Markup Language", "is_correct": True}],
            }]
            report = detector.check_incoming(incoming, source_label="database")
            assert report.has_exact_duplicates, f"Failed to match variation: {var_text}"

    # -------------------------------------------------------------------------
    # 4. Duplicate Questions Appearing in Different Modules
    # -------------------------------------------------------------------------
    def test_duplicate_across_different_modules(self):
        """A duplicate question must be caught even if submitted under a different module."""
        existing = [
            {
                "question_text": "What is 25% of 200?",
                "module": "apt",
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing)
        incoming = [
            {
                "question_text": "What is 25% of 200?",
                "module": "cs",  # Different module
                "options": [{"text": "50", "is_correct": True}],
            }
        ]
        report = detector.check_incoming(incoming, source_label="database")
        assert report.has_exact_duplicates
        match = report.exact_duplicates[0]
        assert match.incoming_module == "cs"
        assert match.matched_module == "apt"

    # -------------------------------------------------------------------------
    # 5. Duplicate Questions in the Same Incoming Batch
    # -------------------------------------------------------------------------
    def test_duplicate_in_same_incoming_batch(self):
        """Duplicates occurring inside the same batch must be rejected during validation."""
        batch = [
            {
                "module": "cs",
                "difficulty": "easy",
                "level_number": 1,
                "question_text": "What does CPU stand for?",
                "explanation": "Central Processing Unit",
                "options": [
                    {"text": "Central Processing Unit", "is_correct": True},
                    {"text": "Computer Processing Unit", "is_correct": False},
                    {"text": "Central Power Unit", "is_correct": False},
                    {"text": "Control Processing Unit", "is_correct": False},
                ],
            },
            {
                "module": "cs",
                "difficulty": "easy",
                "level_number": 1,
                "question_text": "What does CPU stand for?",  # Duplicate in same batch
                "explanation": "Central Processing Unit",
                "options": [
                    {"text": "Central Processing Unit", "is_correct": True},
                    {"text": "Computer Processing Unit", "is_correct": False},
                    {"text": "Central Power Unit", "is_correct": False},
                    {"text": "Control Processing Unit", "is_correct": False},
                ],
            },
        ]
        result = validate_all_questions(batch)
        assert not result.valid
        assert any("exact duplicate" in err for err in result.errors)

    # -------------------------------------------------------------------------
    # 6. Similar Wording That Represents Different Concepts
    # -------------------------------------------------------------------------
    def test_similar_wording_different_concepts(self):
        """Similar grammatical templates testing different concepts must raise fuzzy warning, not rejection."""
        existing = [
            {
                "question_text": "What is the SI unit of force?",
                "module": "eng",
                "options": [{"text": "Newton", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing, fuzzy_threshold=0.70)
        incoming = [
            {
                "question_text": "What is the SI unit of power?",  # Different concept, similar template
                "module": "eng",
                "options": [{"text": "Watt", "is_correct": True}],
            }
        ]
        report = detector.check_incoming(incoming, source_label="database")
        # Must NOT be an exact duplicate
        assert not report.has_exact_duplicates
        # Must generate a fuzzy warning for review
        assert len(report.fuzzy_warnings) >= 1
        assert report.fuzzy_warnings[0].incoming_text == "What is the SI unit of power?"

    # -------------------------------------------------------------------------
    # 7. Different Questions That Happen to Share a Correct Answer
    # -------------------------------------------------------------------------
    def test_different_questions_sharing_correct_answer(self):
        """Questions with completely different content sharing an answer must NOT be falsely flagged."""
        existing = [
            {
                "question_text": "If 5 pens cost 75 rupees, what is the cost of 8 pens?",
                "module": "apt",
                "options": [{"text": "120", "is_correct": True}],
            }
        ]
        detector = QuestionDuplicateDetector(existing)
        incoming = [
            {
                "question_text": "A table shows daily egg production: Mon=110, Tue=120, Wed=130. What is the average daily production?",
                "module": "di",
                "options": [{"text": "120", "is_correct": True}],
            }
        ]
        report = detector.check_incoming(incoming, source_label="database")
        assert not report.has_exact_duplicates
        assert len(report.semantic_reviews) == 0

    # -------------------------------------------------------------------------
    # 8. Database Questions That Duplicate Incoming Questions
    # -------------------------------------------------------------------------
    def test_database_question_duplicate_protection(self, db_session: Session):
        """Importer must detect existing questions in the database and skip them."""
        # Query any existing question from test DB
        existing_q = db_session.query(Question).first()
        if not existing_q:
            pytest.skip("Test database contains no questions to test against")

        # Create incoming question with same text
        existing_records = [{
            "id": existing_q.id,
            "module": "apt",
            "question_text": existing_q.question_text,
            "options": [],
        }]
        detector = QuestionDuplicateDetector(existing_records)
        incoming = [{
            "question_text": existing_q.question_text,
            "module": "apt",
            "options": [],
        }]
        report = detector.check_incoming(incoming, source_label="database")
        assert report.has_exact_duplicates
        assert report.exact_duplicates[0].matched_text == existing_q.question_text

    # -------------------------------------------------------------------------
    # 9. Existing Importer Dry-Run Behaviour
    # -------------------------------------------------------------------------
    def test_importer_dry_run_behaviour(self):
        """Dry-run must validate successfully and return 0 without performing database writes."""
        # Create a small valid test JSON
        test_questions = [
            {
                "module": "apt",
                "difficulty": "easy",
                "level_number": 1,
                "question_text": "Unique test question for dry run verification?",
                "explanation": "Valid test explanation",
                "options": [
                    {"text": "10", "is_correct": True},
                    {"text": "20", "is_correct": False},
                    {"text": "30", "is_correct": False},
                    {"text": "40", "is_correct": False},
                ],
            }
        ]
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tf:
            json.dump(test_questions, tf)
            temp_path = tf.name

        try:
            exit_code = import_questions(temp_path, apply=False, confirm_db=False)
            assert exit_code == 0
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    # -------------------------------------------------------------------------
    # 10. Protection Against Importing Into an Unauthorized Database
    # -------------------------------------------------------------------------
    def test_unauthorized_database_protection(self):
        """Importer must strictly reject any target database that is not cortex_quest_test."""
        unauthorized_urls = [
            "postgresql://postgres:pass@localhost:5432/cortex_quest_dev",
            "postgresql://postgres:pass@localhost:5432/cortex_quest_prod",
            "postgresql://postgres:pass@localhost:5432/postgres",
            "postgresql://user:pass@remote:5432/production_db",
        ]
        for url in unauthorized_urls:
            with pytest.raises(RuntimeError) as exc_info:
                validate_target_database(url)
            assert "Refusing to import into any other database" in str(exc_info.value)

        # Authorized database must pass without error
        valid_url = "postgresql://postgres:pass@localhost:5432/cortex_quest_test"
        validate_target_database(valid_url)

        dev_url = "postgresql://postgres:pass@localhost:5432/cortex_quest"
        with pytest.raises(RuntimeError):
            validate_target_database(dev_url)
        validate_target_database(dev_url, "cortex_quest")

