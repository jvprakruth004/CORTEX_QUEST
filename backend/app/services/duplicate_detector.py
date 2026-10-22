"""
Duplicate Question Detection and Prevention Engine for Cortex Quest.

Enforces zero-duplicate requirements across all modules, submodules, levels,
and difficulties:
- Stage 1: Exact duplicate detection using robust normalization (case, whitespace, punctuation).
- Stage 2: Fuzzy duplicate detection flagging suspiciously similar wording for review.
- Stage 3: Semantic duplicate detection identifying questions with different wording testing the same problem.
- Stage 4: Database duplicate protection checking against existing records and batch items.
"""

import re
from difflib import SequenceMatcher
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple, Optional, Any


# Common stopwords ignored during semantic content token analysis
STOPWORDS: Set[str] = {
    "a", "an", "the", "is", "are", "was", "were", "what", "which", "who", "whom",
    "how", "many", "much", "in", "on", "at", "to", "for", "of", "with", "by",
    "from", "about", "into", "through", "during", "before", "after", "above",
    "below", "under", "all", "some", "any", "no", "not", "does", "do", "did",
    "has", "have", "had", "be", "been", "being", "it", "its", "that", "this",
    "these", "those", "can", "could", "will", "would", "shall", "should"
}

# Semantic equivalences for numbers / percentages / common phrases
SEMANTIC_EQUIVALENCES: List[Tuple[re.Pattern, str]] = [
    (re.compile(r"\b(one-quarter|one quarter|a quarter)\b", re.IGNORECASE), "25%"),
    (re.compile(r"\b(one-half|one half|a half|half)\b", re.IGNORECASE), "50%"),
    (re.compile(r"\b(three-quarters|three quarters)\b", re.IGNORECASE), "75%"),
    (re.compile(r"\b(double|twice)\b", re.IGNORECASE), "2x"),
    (re.compile(r"\b(triple|three times)\b", re.IGNORECASE), "3x"),
    (re.compile(r"\b(calculate|find|compute|determine|what is|evaluate)\b", re.IGNORECASE), "find"),
]


def normalize_question_text(text: str) -> str:
    """
    Stage 1: Normalize question text consistently for exact-duplicate comparison.
    - Converts text to lowercase
    - Normalizes typographical quotes, dashes, and smart apostrophes
    - Normalizes harmless punctuation differences (question marks, periods, commas, quotes)
    - Trims leading and trailing whitespace
    - Collapses repeated internal whitespace
    """
    if not text:
        return ""

    # Convert to lowercase
    t = text.lower()

    # Normalize unicode quotes and dashes
    t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    t = t.replace("–", "-").replace("—", "-")

    # Replace harmless punctuation marks with space (keeping alphanumeric, math operators, and symbols like %)
    # Harmless punctuation: ? . ! , ; : ' " ` ~ ^
    t = re.sub(r"[\?\.!,;:\"'`~]", " ", t)

    # Collapse repeated whitespace
    t = re.sub(r"\s+", " ", t).strip()

    return t


def extract_content_tokens(text: str) -> Set[str]:
    """Extract significant content tokens (excluding stopwords)."""
    normalized = normalize_question_text(text)
    words = normalized.split()
    return {w for w in words if w not in STOPWORDS and len(w) > 1}


def extract_numbers_and_units(text: str) -> Set[str]:
    """Extract numbers, percentages, and units from question text."""
    # Matches integers, decimals, percentages, e.g. '25%', '200', '12.5'
    return set(re.findall(r"\b\d+(?:\.\d+)?%?", text))


def get_correct_answer(question: Dict[str, Any]) -> str:
    """Extract and normalize the correct answer text from question options."""
    options = question.get("options", [])
    if isinstance(options, list):
        for opt in options:
            if isinstance(opt, dict) and opt.get("is_correct") is True:
                return str(opt.get("text", "")).strip().lower()
    return ""


@dataclass
class DuplicateMatch:
    """Represents an exact duplicate match."""
    incoming_index: int
    incoming_text: str
    incoming_module: str
    matched_source: str  # 'batch' or 'database' or 'bank'
    matched_index: Optional[int]
    matched_text: str
    matched_module: str
    normalized_text: str


@dataclass
class FuzzyWarning:
    """Represents a suspicious fuzzy similarity warning."""
    similarity: float
    incoming_index: int
    incoming_text: str
    incoming_module: str
    matched_source: str
    matched_index: Optional[int]
    matched_text: str
    matched_module: str
    reason: str


@dataclass
class SemanticReviewItem:
    """Represents a pair of questions flagged for manual semantic duplicate review."""
    incoming_index: int
    incoming_text: str
    incoming_module: str
    incoming_answer: str
    matched_source: str
    matched_index: Optional[int]
    matched_text: str
    matched_module: str
    matched_answer: str
    shared_features: List[str]
    confidence_reason: str


@dataclass
class DuplicateCheckReport:
    """Complete duplicate check report."""
    exact_duplicates: List[DuplicateMatch] = field(default_factory=list)
    fuzzy_warnings: List[FuzzyWarning] = field(default_factory=list)
    semantic_reviews: List[SemanticReviewItem] = field(default_factory=list)

    @property
    def has_exact_duplicates(self) -> bool:
        return len(self.exact_duplicates) > 0


class QuestionDuplicateDetector:
    """
    Engine for detecting exact, fuzzy, and semantic duplicate questions.
    Can be used in standalone validation or integrated with the database importer.
    """

    def __init__(
        self,
        existing_questions: Optional[List[Dict[str, Any]]] = None,
        fuzzy_threshold: float = 0.75,
    ):
        """
        Initialize detector with an optional baseline list of existing questions.
        existing_questions: list of dicts with at least 'question_text' and 'module'.
        """
        self.fuzzy_threshold = fuzzy_threshold
        # Pre-indexed existing questions by normalized text
        # normalized_text -> list of (index, question_dict)
        self.existing_normalized: Dict[str, List[Tuple[int, Dict[str, Any]]]] = {}
        self.existing_list: List[Dict[str, Any]] = []

        if existing_questions:
            self.load_existing(existing_questions)

    def load_existing(self, questions: List[Dict[str, Any]]) -> None:
        """Index existing questions."""
        self.existing_list = questions
        self.existing_normalized.clear()
        for i, q in enumerate(questions):
            norm = normalize_question_text(q.get("question_text", ""))
            if norm:
                if norm not in self.existing_normalized:
                    self.existing_normalized[norm] = []
                self.existing_normalized[norm].append((i, q))

    def check_incoming(
        self,
        incoming_questions: List[Dict[str, Any]],
        source_label: str = "database",
    ) -> DuplicateCheckReport:
        """
        Check incoming batch against:
        1. Pre-existing questions
        2. Questions within the incoming batch itself
        """
        report = DuplicateCheckReport()
        # Track normalized text inside current batch: norm -> (batch_index, question)
        batch_seen: Dict[str, Tuple[int, Dict[str, Any]]] = {}

        for i, q in enumerate(incoming_questions):
            text = q.get("question_text", "")
            mod = q.get("module", "unknown")
            norm = normalize_question_text(text)
            ans = get_correct_answer(q)
            q_numbers = extract_numbers_and_units(text)
            q_tokens = extract_content_tokens(text)

            if not norm:
                continue

            # ==============================================================
            # STAGE 1: Exact Duplicate Detection
            # ==============================================================
            # A. Check against previous items in the same batch
            if norm in batch_seen:
                prev_idx, prev_q = batch_seen[norm]
                report.exact_duplicates.append(DuplicateMatch(
                    incoming_index=i,
                    incoming_text=text,
                    incoming_module=mod,
                    matched_source="batch",
                    matched_index=prev_idx,
                    matched_text=prev_q.get("question_text", ""),
                    matched_module=prev_q.get("module", "unknown"),
                    normalized_text=norm,
                ))
            # B. Check against pre-existing questions
            elif norm in self.existing_normalized:
                for match_idx, match_q in self.existing_normalized[norm]:
                    report.exact_duplicates.append(DuplicateMatch(
                        incoming_index=i,
                        incoming_text=text,
                        incoming_module=mod,
                        matched_source=source_label,
                        matched_index=match_idx,
                        matched_text=match_q.get("question_text", ""),
                        matched_module=match_q.get("module", "unknown"),
                        normalized_text=norm,
                    ))

            # Record in batch_seen
            if norm not in batch_seen:
                batch_seen[norm] = (i, q)

            # ==============================================================
            # STAGE 2: Fuzzy Duplicate Detection (Similarity >= threshold)
            # ==============================================================
            # Compare with existing questions
            for match_idx, match_q in enumerate(self.existing_list):
                match_text = match_q.get("question_text", "")
                match_norm = normalize_question_text(match_text)
                if not match_norm or match_norm == norm:
                    continue  # Exact duplicates handled above

                sim = SequenceMatcher(None, norm, match_norm).ratio()
                if sim >= self.fuzzy_threshold:
                    report.fuzzy_warnings.append(FuzzyWarning(
                        similarity=round(sim, 3),
                        incoming_index=i,
                        incoming_text=text,
                        incoming_module=mod,
                        matched_source=source_label,
                        matched_index=match_idx,
                        matched_text=match_text,
                        matched_module=match_q.get("module", "unknown"),
                        reason=f"High lexical similarity ({sim:.1%}) between questions.",
                    ))

            # Compare with earlier items in current batch
            for prev_idx in range(i):
                prev_q = incoming_questions[prev_idx]
                prev_text = prev_q.get("question_text", "")
                prev_norm = normalize_question_text(prev_text)
                if not prev_norm or prev_norm == norm:
                    continue

                sim = SequenceMatcher(None, norm, prev_norm).ratio()
                if sim >= self.fuzzy_threshold:
                    report.fuzzy_warnings.append(FuzzyWarning(
                        similarity=round(sim, 3),
                        incoming_index=i,
                        incoming_text=text,
                        incoming_module=mod,
                        matched_source="batch",
                        matched_index=prev_idx,
                        matched_text=prev_text,
                        matched_module=prev_q.get("module", "unknown"),
                        reason=f"High lexical similarity ({sim:.1%}) within incoming batch.",
                    ))

            # ==============================================================
            # STAGE 3: Semantic Duplicate Review
            # ==============================================================
            # Detect questions testing essentially the same problem with different wording
            all_comparisons = [
                (idx, match_q, source_label) for idx, match_q in enumerate(self.existing_list)
            ] + [
                (idx, incoming_questions[idx], "batch") for idx in range(i)
            ]

            for comp_idx, comp_q, comp_src in all_comparisons:
                comp_text = comp_q.get("question_text", "")
                comp_norm = normalize_question_text(comp_text)
                if not comp_norm or comp_norm == norm:
                    continue

                comp_ans = get_correct_answer(comp_q)
                if not ans or not comp_ans or ans != comp_ans:
                    continue  # Matching answer is a necessary (though not sufficient) condition for semantic duplicate

                comp_numbers = extract_numbers_and_units(comp_text)
                comp_tokens = extract_content_tokens(comp_text)

                shared_numbers = q_numbers.intersection(comp_numbers)
                shared_tokens = q_tokens.intersection(comp_tokens)

                # Check semantic canonical forms (e.g. 'one-quarter of 200' vs '25% of 200')
                canonical_a = text
                canonical_b = comp_text
                for pattern, replacement in SEMANTIC_EQUIVALENCES:
                    canonical_a = pattern.sub(replacement, canonical_a)
                    canonical_b = pattern.sub(replacement, canonical_b)

                canon_norm_a = normalize_question_text(canonical_a)
                canon_norm_b = normalize_question_text(canonical_b)
                canon_sim = SequenceMatcher(None, canon_norm_a, canon_norm_b).ratio()

                is_suspicious = False
                reasons: List[str] = []

                if canon_sim >= 0.80:
                    is_suspicious = True
                    reasons.append(f"Canonical semantic equivalence ({canon_sim:.1%}) with identical answer '{ans}'")
                elif shared_numbers and (len(shared_tokens) >= 2 or len(shared_numbers) >= 2):
                    is_suspicious = True
                    reasons.append(f"Identical answer '{ans}' with shared problem parameters: {sorted(shared_numbers)} and tokens: {sorted(shared_tokens)}")

                if is_suspicious:
                    report.semantic_reviews.append(SemanticReviewItem(
                        incoming_index=i,
                        incoming_text=text,
                        incoming_module=mod,
                        incoming_answer=ans,
                        matched_source=comp_src,
                        matched_index=comp_idx,
                        matched_text=comp_text,
                        matched_module=comp_q.get("module", "unknown"),
                        matched_answer=comp_ans,
                        shared_features=reasons,
                        confidence_reason="Questions have different wording but share numerical parameters and identical answer key. Requires manual human verification.",
                    ))

        return report

