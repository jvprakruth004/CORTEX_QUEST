"""Authored sample hints must exist and must not disclose correct options."""

import json
from pathlib import Path


def test_sample_hints_are_authored_and_do_not_repeat_correct_options():
    sample_path = Path(__file__).parent / "data" / "sample_questions.json"
    questions = json.loads(sample_path.read_text(encoding="utf-8"))

    assert questions
    for index, question in enumerate(questions, 1):
        hint = question.get("hint_text")
        assert isinstance(hint, str) and hint.strip(), f"Question {index} has no authored hint"
        assert len(hint) <= 1000

        normalized_hint = " ".join(hint.casefold().split())
        correct_options = [option["text"] for option in question["options"] if option["is_correct"]]
        assert len(correct_options) == 1
        normalized_answer = " ".join(correct_options[0].casefold().split())
        if len(normalized_answer) >= 2:
            assert normalized_answer not in normalized_hint, f"Question {index} hint discloses its answer"
