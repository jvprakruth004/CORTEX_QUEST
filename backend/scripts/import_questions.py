#!/usr/bin/env python3
"""
Safe question importer for Cortex Quest with permanent duplicate protection.

Enforces:
- Stage 1: Exact duplicate detection across all modules/levels/difficulties.
- Stage 2: Fuzzy duplicate detection flagging suspiciously similar wording.
- Stage 3: Semantic duplicate review for equivalent questions with different wording.
- Stage 4: Database duplicate protection checking existing DB records and incoming batch.
- Stage 5: Safe import behavior (dry run by default, test DB by default, explicit target confirmation).

Imports questions from data/sample_questions.json into PostgreSQL.
Defaults to DRY RUN. Use --apply with explicit environment DATABASE_URL to write.
"""

import os
import sys
import json
import argparse
import urllib.parse
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.content import Module, Submodule, DifficultyLevel, Question, QuestionOption
from app.services.duplicate_detector import (
    normalize_question_text,
    QuestionDuplicateDetector,
    DuplicateCheckReport,
    get_correct_answer,
)


@dataclass
class ValidationResult:
    valid: bool
    errors: List[str]
    warnings: List[str] = field(default_factory=list)


def validate_question(q: Dict[str, Any], index: int) -> ValidationResult:
    """Validate a single question entry."""
    errors = []
    
    required_fields = ['module', 'difficulty', 'level_number', 'question_text', 'explanation', 'options']
    for field_name in required_fields:
        if field_name not in q:
            errors.append(f"Question {index}: missing required field '{field_name}'")
        elif isinstance(q[field_name], str) and not q[field_name].strip():
            errors.append(f"Question {index}: required field '{field_name}' is empty")

    hint_text = q.get('hint_text')
    if hint_text is not None and (not isinstance(hint_text, str) or len(hint_text) > 1000):
        errors.append(f"Question {index}: hint_text must be a string of at most 1000 characters")
    submodule = q.get('submodule')
    if submodule is not None and (not isinstance(submodule, str) or not submodule.strip()):
        errors.append(f"Question {index}: submodule must be a non-empty slug when provided")
    
    if 'level_number' in q:
        level = q['level_number']
        if not isinstance(level, int) or level < 1 or level > 50:
            errors.append(f"Question {index}: level_number must be integer 1-50, got {level}")
    
    if 'options' in q:
        options = q['options']
        if not isinstance(options, list) or len(options) != 4:
            errors.append(f"Question {index}: must have exactly 4 options, got {len(options) if isinstance(options, list) else 'non-list'}")
        else:
            correct_count = sum(1 for opt in options if isinstance(opt, dict) and opt.get('is_correct') is True)
            if correct_count != 1:
                errors.append(f"Question {index}: must have exactly 1 correct option, got {correct_count}")
            
            opt_texts = set()
            for j, opt in enumerate(options):
                if not isinstance(opt, dict):
                    errors.append(f"Question {index}, option {j}: must be a dictionary")
                    continue
                if 'text' not in opt or not str(opt['text']).strip():
                    errors.append(f"Question {index}, option {j}: missing or empty 'text'")
                else:
                    opt_texts.add(str(opt['text']).strip())
                if 'is_correct' not in opt:
                    errors.append(f"Question {index}, option {j}: missing 'is_correct'")
                elif not isinstance(opt['is_correct'], bool):
                    errors.append(f"Question {index}, option {j}: is_correct must be boolean")
            
            if len(opt_texts) != len(options):
                errors.append(f"Question {index}: options must be distinct, got duplicates")
    
    return ValidationResult(valid=len(errors) == 0, errors=errors)


def validate_all_questions(questions: List[Dict[str, Any]]) -> ValidationResult:
    """
    Validate all questions in the list:
    - Structural and field validation for each question.
    - Exact duplicate detection across all questions in the incoming batch.
    """
    all_errors = []
    seen_normalized: Dict[str, Tuple[int, str]] = {}

    for i, q in enumerate(questions):
        result = validate_question(q, i)
        all_errors.extend(result.errors)

        # Stage 1: Exact duplicate detection within incoming batch
        qtext = q.get('question_text', '')
        norm = normalize_question_text(qtext)
        if norm:
            if norm in seen_normalized:
                prev_idx, prev_text = seen_normalized[norm]
                all_errors.append(
                    f"Question {i}: exact duplicate of question {prev_idx} "
                    f"('{prev_text[:60]}...') within incoming batch"
                )
            else:
                seen_normalized[norm] = (i, qtext)

    return ValidationResult(valid=len(all_errors) == 0, errors=all_errors)


def extract_database_name(db_url: str) -> str:
    """Extract database name from PostgreSQL URL."""
    # postgresql://user:pass@host:port/dbname
    parsed = urllib.parse.urlparse(db_url)
    # path is like '/cortex_quest_test'
    db_name = parsed.path.lstrip('/')
    return db_name


def get_apply_database_url() -> str:
    """
    Get DATABASE_URL for --apply mode.
    Requires explicit environment variable. Does NOT fall back to .env or defaults.
    """
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError(
            "ERROR: --apply requires DATABASE_URL to be set in the process environment.\n"
            "Do not rely on .env file. Export DATABASE_URL explicitly before running."
        )
    return db_url


def validate_target_database(db_url: str, expected_database: str = 'cortex_quest_test') -> None:
    """Validate the URL names the explicitly expected database (test by default)."""
    db_name = extract_database_name(db_url)
    if db_name != expected_database:
        raise RuntimeError(
            f"ERROR: Target database must be '{expected_database}', got '{db_name}'.\n"
            "Refusing to import into any other database."
        )


def print_duplicate_report(report: DuplicateCheckReport, context_label: str) -> None:
    """Format and print duplicate check warnings and review candidates."""
    if report.fuzzy_warnings:
        print(f"\n[WARNING] Suspicious Fuzzy Similarities ({context_label}):")
        for fw in report.fuzzy_warnings:
            print(f"  - [{fw.similarity:.1%}] Q#{fw.incoming_index + 1} [{fw.incoming_module}] vs "
                  f"{fw.matched_source.upper()} Q#{fw.matched_index + 1 if fw.matched_index is not None else '?'} [{fw.matched_module}]")
            print(f"    Incoming: \"{fw.incoming_text}\"")
            print(f"    Matched:  \"{fw.matched_text}\"")
            print(f"    Reason:   {fw.reason}")

    if report.semantic_reviews:
        print(f"\n[REVIEW NEEDED] Potential Semantic Duplicates ({context_label}):")
        for sr in report.semantic_reviews:
            print(f"  - Q#{sr.incoming_index + 1} [{sr.incoming_module}] vs "
                  f"{sr.matched_source.upper()} Q#{sr.matched_index + 1 if sr.matched_index is not None else '?'} [{sr.matched_module}]")
            print(f"    Incoming: \"{sr.incoming_text}\" (Answer: {sr.incoming_answer})")
            print(f"    Matched:  \"{sr.matched_text}\" (Answer: {sr.matched_answer})")
            for feat in sr.shared_features:
                print(f"    Signal:   {feat}")
            print(f"    Action:   {sr.confidence_reason}")


def import_questions(
    json_path: str,
    apply: bool = False,
    confirm_db: bool = False,
    check_db: bool = False,
    target_database: str = 'cortex_quest_test',
    reassign_submodules: bool = False,
) -> int:
    """
    Import questions from JSON file with full duplicate protection.
    
    apply: actually write to the explicitly selected target database.
    confirm_db: explicit user confirmation flag.
    check_db: check duplicates against existing database records even in dry run.
    """
    
    # Load and validate JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            questions_data = json.load(f)
    except Exception as e:
        print(f"ERROR: Failed to load JSON: {e}")
        return 1
    
    if not isinstance(questions_data, list):
        print("ERROR: JSON root must be a list of questions")
        return 1
    
    # Validate all questions structurally and check intra-batch exact duplicates
    validation = validate_all_questions(questions_data)
    if not validation.valid:
        print("ERROR: JSON validation failed:")
        for err in validation.errors:
            print(f"  - {err}")
        return 1
    
    print(f"Loaded {len(questions_data)} questions from {json_path}")
    print("JSON structural & intra-batch duplicate check: PASSED")

    # Run intra-batch fuzzy and semantic detection
    batch_detector = QuestionDuplicateDetector([])
    batch_report = batch_detector.check_incoming(questions_data, source_label="batch")
    print_duplicate_report(batch_report, "Intra-Batch")
    
    # Safety checks for --apply
    if apply:
        try:
            db_url = get_apply_database_url()
            validate_target_database(db_url, target_database)
        except RuntimeError as e:
            print(str(e))
            return 1
        
        if not confirm_db:
            print("ERROR: --apply requires --confirm-db flag to confirm target database")
            return 1
        
        print(f"Target database: {target_database} (URL validated; verifying server target)")
        print("Mode: APPLY (writing to database)")
    else:
        print("Mode: DRY RUN (no database writes)")
    
    if not apply and not check_db:
        print("\nDRY RUN complete. Use --apply --confirm-db with DATABASE_URL env var to actually import.")
        return 0
    
    # Connect to database (for --apply or --check-db)
    try:
        if not apply and check_db:
            db_url = os.environ.get('DATABASE_URL')
            if not db_url:
                print("Notice: DATABASE_URL not set, skipping database duplicate check.")
                return 0
            validate_target_database(db_url, target_database)

        engine = create_engine(db_url, poolclass=None)
        with engine.connect() as connection:
            actual_database = connection.execute(text("SELECT current_database()")).scalar_one()
        if actual_database != target_database:
            engine.dispose()
            raise RuntimeError(
                f"Connected database is '{actual_database}', expected '{target_database}'. Refusing to continue."
            )
        SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
        db = SessionLocal()
        print(f"Connected database verified: {actual_database}")
    except Exception as e:
        if 'engine' in locals():
            engine.dispose()
        print(f"ERROR: Failed to connect to database: {e}")
        return 1
    
    try:
        # Build module, submodule, and difficulty lookups
        modules = {m.slug: m for m in db.query(Module).filter(Module.is_active == 1).all()}
        submodules = {s.slug: s for s in db.query(Submodule).filter(Submodule.is_active == 1).all()}
        difficulties = {d.slug: d for d in db.query(DifficultyLevel).all()}
        
        if not modules:
            print("ERROR: No active modules found in database")
            return 1
        if not difficulties:
            print("ERROR: No difficulty levels found in database")
            return 1
        
        # Validate all referenced modules and difficulties exist
        missing_modules = set()
        missing_difficulties = set()
        missing_submodules = set()
        mismatched_submodules = set()
        for q in questions_data:
            if q['module'] not in modules:
                missing_modules.add(q['module'])
            if q['difficulty'] not in difficulties:
                missing_difficulties.add(q['difficulty'])
            if q.get('submodule'):
                submodule = submodules.get(q['submodule'])
                if not submodule:
                    missing_submodules.add(q['submodule'])
                elif q['module'] in modules and submodule.module_id != modules[q['module']].id:
                    mismatched_submodules.add(f"{q['module']}->{q['submodule']}")
        
        if missing_modules:
            print(f"ERROR: Modules not found in database: {', '.join(sorted(missing_modules))}")
            return 1
        if missing_difficulties:
            print(f"ERROR: Difficulties not found in database: {', '.join(sorted(missing_difficulties))}")
            return 1
        if missing_submodules:
            print(f"ERROR: Submodules not found in database: {', '.join(sorted(missing_submodules))}")
            return 1
        if mismatched_submodules:
            print(f"ERROR: Submodules do not belong to their modules: {', '.join(sorted(mismatched_submodules))}")
            return 1

        # Load all existing database questions for cross-bank duplicate protection
        db_questions_raw = db.query(Question).all()
        existing_db_records = []
        existing_questions_by_key = {}
        for q_rec in db_questions_raw:
            opts = [
                {"text": o.option_text, "is_correct": bool(o.is_correct)}
                for o in q_rec.options
            ]
            mod_slug = next((m.slug for m in modules.values() if m.id == q_rec.module_id), "unknown")
            diff_slug = next((d.slug for d in difficulties.values() if d.id == q_rec.difficulty_id), "unknown")
            existing_questions_by_key[(mod_slug, diff_slug, q_rec.level_number, normalize_question_text(q_rec.question_text))] = q_rec
            existing_db_records.append({
                "id": q_rec.id,
                "module": mod_slug,
                "level_number": q_rec.level_number,
                "question_text": q_rec.question_text,
                "options": opts,
            })

        # Initialize detector with existing database records
        db_detector = QuestionDuplicateDetector(existing_db_records)
        db_report = db_detector.check_incoming(questions_data, source_label="database")
        print_duplicate_report(db_report, "Database Comparison")

        if not apply:
            print(f"\nDatabase cross-check complete against {len(existing_db_records)} existing DB questions.")
            if db_report.has_exact_duplicates:
                print(f"[NOTE] {len(db_report.exact_duplicates)} incoming questions match existing database questions.")
            return 0

        # Apply mode: Insert non-duplicate questions
        imported = 0
        skipped = 0
        hints_added = 0
        submodules_assigned = 0
        
        # Track normalized text of imported questions during this transaction
        committed_normalized = {
            normalize_question_text(r["question_text"]) for r in existing_db_records
        }

        for q in questions_data:
            q_norm = normalize_question_text(q['question_text'])
            
            # Stage 4: Check if question matches any existing DB question or earlier batch insert
            if q_norm in committed_normalized:
                existing = existing_questions_by_key.get((q['module'], q['difficulty'], q['level_number'], q_norm))
                incoming_hint = q.get('hint_text')
                duplicate_updated = False
                if existing and not existing.hint_text and incoming_hint:
                    existing.hint_text = incoming_hint
                    hints_added += 1
                    duplicate_updated = True
                    print(f"  HINT: [{q['module']}] added missing hint for existing question")
                if existing and q.get('submodule'):
                    target_submodule = submodules[q['submodule']]
                    if existing.submodule_id is None:
                        existing.submodule_id = target_submodule.id
                        submodules_assigned += 1
                        duplicate_updated = True
                    elif existing.submodule_id != target_submodule.id:
                        if not reassign_submodules or existing.source != 'seed':
                            raise ValueError(
                                f"Existing duplicate has a conflicting submodule: {q['module']} / {q['submodule']}"
                            )
                        existing.submodule_id = target_submodule.id
                        submodules_assigned += 1
                        duplicate_updated = True
                if not duplicate_updated:
                    print(f"  SKIP: [{q['module']}] {q['question_text'][:60]}... (duplicate detected)")
                skipped += 1
                continue
            
            module = modules[q['module']]
            difficulty = difficulties[q['difficulty']]
            
            # Create question
            question = Question(
                module_id=module.id,
                submodule_id=submodules[q['submodule']].id if q.get('submodule') else None,
                difficulty_id=difficulty.id,
                level_number=q['level_number'],
                question_text=q['question_text'],
                hint_text=q.get('hint_text'),
                explanation=q['explanation'],
                is_active=1,
                source="seed",
            )
            db.add(question)
            db.flush()
            
            # Create options
            for opt_idx, opt in enumerate(q['options']):
                db.add(QuestionOption(
                    question_id=question.id,
                    option_text=opt['text'],
                    is_correct=1 if opt['is_correct'] else 0,
                    display_order=opt_idx,
                ))
            
            committed_normalized.add(q_norm)
            print(f"  IMPORT: [{q['module']}] {q['question_text'][:60]}...")
            imported += 1
        
        if imported > 0 or hints_added > 0 or submodules_assigned > 0:
            db.commit()
            print(f"\nCommitted {imported} questions, added {hints_added} missing hints, and assigned {submodules_assigned} existing questions to submodules.")
        else:
            print("\nNo new questions to import.")
        
        print(f"Summary: {imported} imported, {skipped} skipped (duplicates), {hints_added} hints added, {submodules_assigned} submodules assigned")
        return 0
        
    except Exception as e:
        db.rollback()
        print(f"ERROR: Import failed, rolled back: {e}")
        return 1
    finally:
        db.close()
        engine.dispose()


def main():
    parser = argparse.ArgumentParser(
        description="Import questions from JSON into Cortex Quest database with duplicate protection",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/import_questions.py --dry-run
  DATABASE_URL=postgresql://.../cortex_quest_test python scripts/import_questions.py --apply --confirm-db
"""
    )
    parser.add_argument(
        '--json', '-j',
        default='data/sample_questions.json',
        help='Path to JSON file (default: data/sample_questions.json)'
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Actually write to database (default is dry run). Requires DATABASE_URL and --confirm-db.'
    )
    parser.add_argument(
        '--confirm-db',
        action='store_true',
        help='Confirm target database named by --target-db (required with --apply)'
    )
    parser.add_argument(
        '--target-db', choices=('cortex_quest_test', 'cortex_quest'), default='cortex_quest_test',
        help='Explicit target database; defaults to the isolated test database'
    )
    parser.add_argument(
        '--reassign-submodules', action='store_true',
        help='Allow exact matching seed questions to be moved to their validated submodule from the JSON catalog'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Explicit dry run (default behavior)'
    )
    parser.add_argument(
        '--check-db',
        action='store_true',
        help='In dry-run, check duplicates against database if DATABASE_URL is set'
    )
    
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, args.json)
    
    if not os.path.exists(json_path):
        print(f"ERROR: JSON file not found: {json_path}")
        return 1
    
    apply = args.apply
    if args.dry_run:
        apply = False
    if args.reassign_submodules and not apply:
        parser.error('--reassign-submodules requires --apply')
    
    return import_questions(
        json_path,
        apply=apply,
        confirm_db=args.confirm_db,
        check_db=args.check_db,
        target_database=args.target_db,
        reassign_submodules=args.reassign_submodules,
    )


if __name__ == '__main__':
    sys.exit(main())
