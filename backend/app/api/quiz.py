"""Quiz API router for Cortex Quest"""
from typing import List, Optional
import random
import uuid
from datetime import datetime, timezone, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.models.content import Module, DifficultyLevel, Question, QuestionOption, Submodule
from app.models.quiz_history import QuizAttempt, QuizAttemptQuestion
from app.models.player_progress import PlayerLevelProgress
from app.models.account import PlayerProfile
from app.models.practice_session import PracticeQuizSession, PracticeLifelineUse
from app.api.auth import _get_current_account
from app.schemas.quiz import (
    PracticeQuizResponse,
    QuestionDeliveryResponse,
    QuestionOptionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuestionResultResponse,
    LifelineRequest,
    LifelineResponse,
    PracticeAnswerRequest,
    PracticeAnswerResponse,
    AttemptListResponse,
    AttemptSummaryResponse,
    AttemptDetailResponse,
    AttemptQuestionDetail,
    AttemptSummaryStats,
    LevelProgressResponse,
    ModuleProgressResponse,
    PlayerProgressResponse,
    V2LevelProgressResponse,
    V2SubmoduleProgressResponse,
    V2DifficultyProgressResponse,
    V2ModuleProgressResponse,
    V2PlayerProgressResponse,
)

router = APIRouter(prefix="/quiz", tags=["quiz"])


def award_profile_rewards(profile: PlayerProfile, xp_earned: int, coins_earned: int) -> int:
    """Apply persistent profile rewards and the existing one-diamond-per-level rule."""
    old_level = profile.xp // 200
    profile.xp += xp_earned
    profile.coins += coins_earned
    diamonds_earned = max(0, profile.xp // 200 - old_level)
    profile.diamonds += diamonds_earned
    return diamonds_earned


@router.get("/practice", response_model=PracticeQuizResponse)
async def get_practice_questions(
    module: str = Query(..., description="Module slug (e.g., apt, di, lr, gk, prog, cs, eng, med)"),
    difficulty: str = Query(..., description="Difficulty slug: easy, medium, or hard"),
    level: int = Query(..., ge=1, le=50, description="Level number (1-50)"),
    count: int = Query(5, ge=1, le=20, description="Number of questions to return (1-20)"),
    submodule: Optional[str] = Query(None, description="Submodule slug (optional)"),
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get practice questions for a specific module, difficulty, and level.
    Optionally filter by submodule.
    
    Returns randomized questions without correct answers or explanations.
    """
    # Validate module exists and is active
    module_obj = db.query(Module).filter(
        Module.slug == module,
        Module.is_active == 1
    ).first()
    
    if not module_obj:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate difficulty exists
    difficulty_obj = db.query(DifficultyLevel).filter(
        DifficultyLevel.slug == difficulty
    ).first()
    
    if not difficulty_obj:
        raise HTTPException(status_code=422, detail="Invalid difficulty")
    
    # Validate submodule if provided
    submodule_obj = None
    if submodule:
        submodule_obj = db.query(Submodule).filter(
            Submodule.slug == submodule,
            Submodule.is_active == 1
        ).first()
        
        if not submodule_obj:
            raise HTTPException(status_code=404, detail="Submodule not found")
        
        # Validate submodule belongs to the specified module
        if submodule_obj.module_id != module_obj.id:
            raise HTTPException(status_code=422, detail="Submodule does not belong to the specified module")
    
    # Level is validated by Query(ge=1, le=50)
    
    # Build query filters
    query_filters = [
        Question.module_id == module_obj.id,
        Question.difficulty_id == difficulty_obj.id,
        Question.level_number == level,
        Question.is_active == 1
    ]
    
    # A selected submodule is an exact filter. Without one, this is
    # module-level practice and may use questions from that module's
    # submodules (the a2 module-level entry point does not select one).
    if submodule_obj:
        query_filters.append(Question.submodule_id == submodule_obj.id)
    
    # Fetch active questions matching criteria
    questions = (
        db.query(Question)
        .filter(*query_filters)
        .order_by(func.random())
        .limit(count)
        .all()
    )
    
    # Build response with options (without is_correct or explanation)
    question_responses = []
    for q in questions:
        options = [
            QuestionOptionResponse(
                id=opt.id,
                text=opt.option_text,
                display_order=opt.display_order
            )
            for opt in q.options
        ]
        
        question_responses.append(
            QuestionDeliveryResponse(
                id=q.id,
                question_text=q.question_text,
                options=options
            )
        )
    
    session_id = None
    if question_responses:
        session_id = str(uuid.uuid4())
        db.add(PracticeQuizSession(
            id=session_id,
            account_id=account.id,
            module_id=module_obj.id,
            difficulty_id=difficulty_obj.id,
            submodule_id=submodule_obj.id if submodule_obj else None,
            level_number=level,
            question_ids=[question.id for question in questions],
        ))
        db.commit()

    return PracticeQuizResponse(
        module=module,
        difficulty=difficulty,
        level=level,
        submodule=submodule,
        questions=question_responses,
        total=len(question_responses),
        session_id=session_id,
    )


def _get_active_practice_session(session_id: str, question_id: int, account, db: Session):
    session = db.query(PracticeQuizSession).filter(
        PracticeQuizSession.id == session_id,
        PracticeQuizSession.account_id == account.id,
    ).with_for_update().first()
    if not session:
        raise HTTPException(status_code=404, detail="Practice session not found")
    if session.completed_at is not None:
        raise HTTPException(status_code=409, detail="Practice session is already submitted")
    if session.created_at and session.created_at < datetime.now(timezone.utc) - timedelta(hours=2):
        raise HTTPException(status_code=410, detail="Practice session expired; load a new quiz")
    if question_id not in (session.question_ids or []):
        raise HTTPException(status_code=422, detail="Question is not part of this practice session")
    question = db.query(Question).filter(Question.id == question_id, Question.is_active == 1).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return session, question


@router.post("/answer", response_model=PracticeAnswerResponse)
async def answer_practice_question(
    request: PracticeAnswerRequest,
    db: Session = Depends(get_db),
    account=Depends(_get_current_account),
):
    """Evaluate and lock one answer in an active practice session."""
    session, question = _get_active_practice_session(
        request.session_id, request.question_id, account, db
    )
    if (
        question.module_id != session.module_id
        or question.difficulty_id != session.difficulty_id
        or question.level_number != session.level_number
        or (session.submodule_id is not None and question.submodule_id != session.submodule_id)
    ):
        raise HTTPException(status_code=422, detail="Question does not match the practice session")

    selected_option = next(
        (option for option in question.options if option.id == request.selected_option_id),
        None,
    )
    if not selected_option:
        raise HTTPException(status_code=422, detail="Selected option does not belong to this question")
    correct_option = next((option for option in question.options if option.is_correct == 1), None)
    if not correct_option:
        raise HTTPException(status_code=500, detail=f"Question {question.id} has no correct option configured")

    stored_answers = (session.result_payload or {}).get("answers", {})
    existing = stored_answers.get(str(question.id))
    if existing:
        if existing["selected_option_id"] != selected_option.id:
            raise HTTPException(status_code=409, detail="This question has already been answered")
        return PracticeAnswerResponse.model_validate(existing["feedback"])

    feedback = PracticeAnswerResponse(
        question_id=question.id,
        correct=selected_option.id == correct_option.id,
        selected_option_id=selected_option.id,
        correct_option_id=correct_option.id,
        correct_option_text=correct_option.option_text,
        explanation=question.explanation or "",
    )
    stored_answers[str(question.id)] = {
        "selected_option_id": selected_option.id,
        "time_seconds": request.time_seconds,
        "feedback": feedback.model_dump(mode="json"),
    }
    session.result_payload = {"answers": stored_answers}
    db.commit()
    return feedback


@router.post("/lifeline/5050", response_model=LifelineResponse)
async def use_fifty_fifty(
    request: LifelineRequest,
    db: Session = Depends(get_db),
    account=Depends(_get_current_account),
):
    session, question = _get_active_practice_session(request.session_id, request.question_id, account, db)
    previous = db.query(PracticeLifelineUse).filter_by(
        session_id=session.id, question_id=question.id, lifeline_type="5050"
    ).first()
    if previous:
        raise HTTPException(status_code=409, detail="50/50 was already used for this question")
    incorrect = [option.id for option in question.options if option.is_correct != 1]
    if len(incorrect) < 2:
        raise HTTPException(status_code=422, detail="This question does not have enough incorrect options")
    profile = db.query(PlayerProfile).filter(PlayerProfile.account_id == account.id).with_for_update().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    if profile.fifty_fifty_inventory < 1:
        raise HTTPException(status_code=422, detail="No 50/50 inventory available")
    removed = random.SystemRandom().sample(incorrect, 2)
    profile.fifty_fifty_inventory -= 1
    db.add(PracticeLifelineUse(session_id=session.id, question_id=question.id, lifeline_type="5050"))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="50/50 could not be applied; retry once")
    return LifelineResponse(
        available=True,
        removed_option_ids=removed,
        coins=profile.coins,
        diamonds=profile.diamonds,
        inventory_hint=profile.hint_inventory,
        inventory_5050=profile.fifty_fifty_inventory,
    )


@router.post("/lifeline/hint", response_model=LifelineResponse)
async def use_hint(
    request: LifelineRequest,
    db: Session = Depends(get_db),
    account=Depends(_get_current_account),
):
    session, question = _get_active_practice_session(request.session_id, request.question_id, account, db)
    hint_text = question.hint_text.strip() if question.hint_text else ""
    correct_option = next((option for option in question.options if option.is_correct == 1), None)
    normalized_hint = " ".join(hint_text.casefold().split())
    normalized_answer = " ".join(correct_option.option_text.casefold().split()) if correct_option else ""
    if not hint_text or not correct_option or (len(normalized_answer) >= 2 and normalized_answer in normalized_hint):
        profile = db.query(PlayerProfile).filter(PlayerProfile.account_id == account.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Player profile not found")
        return LifelineResponse(
            available=False,
            coins=profile.coins,
            diamonds=profile.diamonds,
            inventory_hint=profile.hint_inventory,
            inventory_5050=profile.fifty_fifty_inventory,
        )
    previous = db.query(PracticeLifelineUse).filter_by(
        session_id=session.id, question_id=question.id, lifeline_type="hint"
    ).first()
    if previous:
        raise HTTPException(status_code=409, detail="Hint was already used for this question")
    profile = db.query(PlayerProfile).filter(PlayerProfile.account_id == account.id).with_for_update().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    if profile.hint_inventory < 1:
        raise HTTPException(status_code=422, detail="No Hint inventory available")
    profile.hint_inventory -= 1
    db.add(PracticeLifelineUse(session_id=session.id, question_id=question.id, lifeline_type="hint"))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Hint could not be applied; retry once")
    return LifelineResponse(
        available=True,
        hint=hint_text,
        coins=profile.coins,
        diamonds=profile.diamonds,
        inventory_hint=profile.hint_inventory,
        inventory_5050=profile.fifty_fifty_inventory,
    )


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    request: QuizSubmitRequest,
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Submit quiz answers for server-side scoring.
    
    Validates all answers, calculates correctness, and returns results with rewards.
    Never trusts client-supplied correctness or scores.
    Persists attempt history in the same transaction.
    """
    practice_session = None
    if request.session_id:
        if request.session_type != "practice":
            raise HTTPException(status_code=422, detail="Practice session IDs can only be used for practice submissions")
        practice_session = db.query(PracticeQuizSession).filter(
            PracticeQuizSession.id == request.session_id,
            PracticeQuizSession.account_id == account.id,
        ).with_for_update().first()
        if not practice_session:
            raise HTTPException(status_code=404, detail="Practice session not found")
        if practice_session.completed_at is not None:
            if practice_session.result_payload and "summary" in practice_session.result_payload:
                return QuizSubmitResponse.model_validate(practice_session.result_payload)
            raise HTTPException(status_code=409, detail="Practice session has already been submitted")
        created_at = practice_session.created_at
        if created_at and created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if created_at and created_at < datetime.now(timezone.utc) - timedelta(hours=2):
            raise HTTPException(status_code=410, detail="Practice session expired; load a new quiz")

    # For practice sessions, require module, difficulty, level
    if request.session_type == "practice":
        if not request.module or not request.difficulty or not request.level:
            raise HTTPException(
                status_code=422,
                detail="module, difficulty, and level are required for practice sessions"
            )
    
    # Validate module if provided
    module_obj = None
    if request.module:
        module_obj = db.query(Module).filter(
            Module.slug == request.module,
            Module.is_active == 1
        ).first()
        if not module_obj:
            raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate difficulty if provided
    difficulty_obj = None
    if request.difficulty:
        difficulty_obj = db.query(DifficultyLevel).filter(
            DifficultyLevel.slug == request.difficulty
        ).first()
        if not difficulty_obj:
            raise HTTPException(status_code=422, detail="Invalid difficulty")
    
    # Validate level if provided
    if request.level is not None and (request.level < 1 or request.level > 50):
        raise HTTPException(status_code=422, detail="Level must be between 1 and 50")
    
    # Validate submodule if provided
    submodule_obj = None
    if request.submodule:
        submodule_obj = db.query(Submodule).filter(
            Submodule.slug == request.submodule,
            Submodule.is_active == 1
        ).first()
        
        if not submodule_obj:
            raise HTTPException(status_code=404, detail="Submodule not found")
        
        # Validate submodule belongs to the specified module (for practice sessions)
        if request.session_type == "practice" and module_obj:
            if submodule_obj.module_id != module_obj.id:
                raise HTTPException(status_code=422, detail="Submodule does not belong to the specified module")
    
    # Validate answers
    if not request.answers:
        raise HTTPException(status_code=422, detail="At least one answer is required")
    
    # Check for duplicate question IDs
    question_ids = [a.question_id for a in request.answers]
    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(status_code=422, detail="Duplicate question IDs in submission")
    
    # Fetch all questions in a single query
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    
    if len(questions) != len(question_ids):
        found_ids = {q.id for q in questions}
        missing_ids = set(question_ids) - found_ids
        raise HTTPException(status_code=404, detail=f"Questions not found: {sorted(missing_ids)}")
    
    # For practice sessions, validate questions match module/difficulty/level
    if request.session_type == "practice":
        for q in questions:
            if module_obj and q.module_id != module_obj.id:
                raise HTTPException(status_code=422, detail=f"Question {q.id} does not belong to module {request.module}")
            if difficulty_obj and q.difficulty_id != difficulty_obj.id:
                raise HTTPException(status_code=422, detail=f"Question {q.id} does not match difficulty {request.difficulty}")
            if request.level is not None and q.level_number != request.level:
                raise HTTPException(status_code=422, detail=f"Question {q.id} is not level {request.level}")
            if submodule_obj and q.submodule_id != submodule_obj.id:
                raise HTTPException(status_code=422, detail=f"Question {q.id} does not belong to submodule {request.submodule}")
            if q.is_active != 1:
                raise HTTPException(status_code=422, detail=f"Question {q.id} is not active")

    if practice_session:
        submitted_ids = set(question_ids)
        if submitted_ids != set(practice_session.question_ids or []):
            raise HTTPException(status_code=422, detail="Submission must include exactly the questions delivered for this session")
        if (practice_session.module_id != (module_obj.id if module_obj else None)
                or practice_session.difficulty_id != (difficulty_obj.id if difficulty_obj else None)
                or practice_session.submodule_id != (submodule_obj.id if submodule_obj else None)
                or practice_session.level_number != request.level):
            raise HTTPException(status_code=422, detail="Submission does not match the delivered practice session")
        recorded_answers = (practice_session.result_payload or {}).get("answers", {})
        for answer in request.answers:
            recorded = recorded_answers.get(str(answer.question_id))
            if recorded and recorded["selected_option_id"] != answer.selected_option_id:
                raise HTTPException(
                    status_code=409,
                    detail=f"Question {answer.question_id} was submitted with a different answer",
                )
    
    # Build option lookup for validation
    all_option_ids = [a.selected_option_id for a in request.answers]
    options = db.query(QuestionOption).filter(
        QuestionOption.id.in_(all_option_ids)
    ).all()
    
    option_map = {opt.id: opt for opt in options}
    
    # Process each answer
    results = []
    correct_count = 0
    total_time = 0
    
    for answer in request.answers:
        question = next(q for q in questions if q.id == answer.question_id)
        selected_option = option_map.get(answer.selected_option_id)
        
        # Validate selected option exists and belongs to this question
        if not selected_option:
            raise HTTPException(status_code=422, detail=f"Option {answer.selected_option_id} not found")
        if selected_option.question_id != question.id:
            raise HTTPException(status_code=422, detail=f"Option {answer.selected_option_id} does not belong to question {question.id}")
        
        # Find correct option
        correct_option = next((opt for opt in question.options if opt.is_correct == 1), None)
        if not correct_option:
            raise HTTPException(status_code=500, detail=f"Question {question.id} has no correct option configured")
        
        is_correct = (answer.selected_option_id == correct_option.id)
        if is_correct:
            correct_count += 1
        
        total_time += answer.time_seconds
        
        results.append(QuestionResultResponse(
            question_id=question.id,
            correct=is_correct,
            selected_option_id=answer.selected_option_id,
            correct_option_id=correct_option.id,
            explanation=question.explanation or ""
        ))
    
    total_questions = len(request.answers)
    incorrect_count = total_questions - correct_count
    accuracy_percent = round((correct_count / total_questions) * 100) if total_questions > 0 else 0

    # Calculate stars from accuracy (practice only)
    def calculate_stars(accuracy: int) -> int:
        if accuracy >= 100:
            return 3
        elif accuracy >= 85:
            return 2
        elif accuracy >= 70:
            return 1
        return 0

    # Calculate base rewards (per question)
    rewards = calculate_rewards(
        correct_count=correct_count,
        total_questions=total_questions,
        difficulty_obj=difficulty_obj,
        session_type=request.session_type,
    )

    # Track actual stars awarded (for response)
    actual_stars_earned = 0
    actual_diamonds_earned = 0

    # Persist attempt history and progress in same transaction
    completed_at = datetime.now(timezone.utc)
    started_at = completed_at - timedelta(seconds=total_time)
    completed_date = completed_at.date()  # UTC date for streak

    attempt = QuizAttempt(
        account_id=account.id,
        session_type=request.session_type,
        module_id=module_obj.id if module_obj else None,
        difficulty_id=difficulty_obj.id if difficulty_obj else None,
        submodule_id=submodule_obj.id if submodule_obj else None,
        level_number=request.level,
        total_questions=total_questions,
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        accuracy_percent=accuracy_percent,
        total_time_seconds=total_time,
        xp_earned=rewards["xp_earned"],  # Will be updated below for practice
        coins_earned=rewards["coins_earned"],  # Will be updated below for practice
        multiplier=rewards["multiplier"],
        completed_at=completed_at,
        started_at=started_at,
    )
    db.add(attempt)
    db.flush()

    for answer, result in zip(request.answers, results):
        question = next(q for q in questions if q.id == answer.question_id)
        correct_opt = next(opt for opt in question.options if opt.is_correct == 1)
        selected_opt = next(opt for opt in question.options if opt.id == answer.selected_option_id)

        db.add(QuizAttemptQuestion(
            attempt_id=attempt.id,
            question_id=question.id,
            question_text_snapshot=question.question_text,
            explanation_snapshot=question.explanation,
            selected_option_id=answer.selected_option_id,
            selected_option_text_snapshot=selected_opt.option_text,
            correct_option_id=correct_opt.id,
            correct_option_text_snapshot=correct_opt.option_text,
            is_correct=1 if result.correct else 0,
            time_seconds=answer.time_seconds,
        ))

    # Progress tracking for practice sessions
    if request.session_type == "practice" and module_obj and difficulty_obj and request.level is not None:
        stars = calculate_stars(accuracy_percent)

        if stars > 0:
            # Lock the player profile row for this account to prevent concurrent reward duplication
            profile = db.query(PlayerProfile).filter(
                PlayerProfile.account_id == account.id
            ).with_for_update().first()

            if not profile:
                # Create profile if missing (should not happen for authenticated users)
                profile = PlayerProfile(
                    account_id=account.id,
                    player_id=f"CQ{account.id:08d}",
                    display_name="Player",
                    avatar="🦊",
                    xp=0, coins=0, diamonds=0, stars=0, streak=0
                )
                db.add(profile)
                db.flush()

            # Determine submodule_id for progress tracking
            # Legacy (no submodule) uses submodule_id=0 (sentinel)
            progress_submodule_id = submodule_obj.id if submodule_obj else 0

            # Check existing level progress (with row lock) - include submodule_id
            progress = db.query(PlayerLevelProgress).filter(
                PlayerLevelProgress.account_id == account.id,
                PlayerLevelProgress.module_id == module_obj.id,
                PlayerLevelProgress.difficulty_id == difficulty_obj.id,
                PlayerLevelProgress.submodule_id == progress_submodule_id,
                PlayerLevelProgress.level_number == request.level
            ).with_for_update().first()

            if not progress:
                # First completion - award rewards
                progress = PlayerLevelProgress(
                    account_id=account.id,
                    module_id=module_obj.id,
                    difficulty_id=difficulty_obj.id,
                    submodule_id=progress_submodule_id,
                    level_number=request.level,
                    completed_at=completed_at,
                    best_accuracy=accuracy_percent,
                    stars_earned=stars,
                )
                db.add(progress)
                db.flush()

                # Update attempt with actual awarded rewards
                attempt.xp_earned = rewards["xp_earned"]
                attempt.coins_earned = rewards["coins_earned"]
                actual_stars_earned = stars

                # Update profile
                actual_diamonds_earned = award_profile_rewards(
                    profile, rewards["xp_earned"], rewards["coins_earned"]
                )
                profile.stars += stars
            else:
                # Replay - no XP/coins, only update best_accuracy and stars if improved
                attempt.xp_earned = 0
                attempt.coins_earned = 0

                stars_improvement = max(0, stars - progress.stars_earned)
                if stars_improvement > 0:
                    progress.stars_earned = stars
                    profile.stars += stars_improvement
                    actual_stars_earned = stars_improvement
                else:
                    actual_stars_earned = 0

                if accuracy_percent > progress.best_accuracy:
                    progress.best_accuracy = accuracy_percent

            # Update streak using UTC date
            if profile.last_activity_date is None:
                profile.streak = 1
            elif profile.last_activity_date == completed_date:
                pass  # Same day, no streak change
            elif profile.last_activity_date == completed_date - timedelta(days=1):
                profile.streak += 1
            else:
                profile.streak = 1  # Streak broken

            profile.last_activity_date = completed_date

        else:
            # Below 70% - no level completion, no rewards
            attempt.xp_earned = 0
            attempt.coins_earned = 0
            actual_stars_earned = 0

    # For mock tests: use base rewards but don't create level progress or update stars
    if request.session_type == "mock":
        attempt.xp_earned = rewards["xp_earned"]
        attempt.coins_earned = rewards["coins_earned"]
        actual_stars_earned = 0
        # Update profile with XP/coins but not stars
        profile = db.query(PlayerProfile).filter(
            PlayerProfile.account_id == account.id
        ).with_for_update().first()
        if profile:
            actual_diamonds_earned = award_profile_rewards(
                profile, rewards["xp_earned"], rewards["coins_earned"]
            )
            # Update streak for mock tests too
            if profile.last_activity_date is None:
                profile.streak = 1
            elif profile.last_activity_date == completed_date:
                pass  # Same day, no streak change
            elif profile.last_activity_date == completed_date - timedelta(days=1):
                profile.streak += 1
            else:
                profile.streak = 1  # Streak broken
            profile.last_activity_date = completed_date

    response = QuizSubmitResponse(
        session_type=request.session_type,
        module=request.module,
        difficulty=request.difficulty,
        level=request.level,
        submodule=request.submodule,
        results=results,
        summary={
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "incorrect_answers": incorrect_count,
            "accuracy_percent": accuracy_percent,
            "total_time_seconds": total_time,
        },
        rewards={
            "xp_earned": attempt.xp_earned,
            "coins_earned": attempt.coins_earned,
            "stars_earned": actual_stars_earned if request.session_type == "practice" and module_obj and difficulty_obj and request.level is not None else 0,
            "diamonds_earned": actual_diamonds_earned,
            "multiplier": rewards["multiplier"],
        },
    )
    if practice_session:
        practice_session.completed_at = completed_at
        practice_session.result_payload = response.model_dump(mode="json")
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save attempt and progress")

    return response


def calculate_rewards(
    correct_count: int,
    total_questions: int,
    difficulty_obj: Optional[DifficultyLevel],
    session_type: str,
) -> dict:
    """
    Calculate rewards based on correct answers and difficulty.
    
    Practice mode:
    - Base XP per correct: 20 * (difficulty_multiplier / 100)
    - Base coins per correct: 5 * (difficulty_multiplier / 100)
    - No stars for individual levels (awarded on level completion)
    
    Mock mode (future):
    - Different calculation, returns separate logic
    """
    if difficulty_obj:
        multiplier = difficulty_obj.xp_multiplier / 100.0
    else:
        multiplier = 1.0
    
    base_xp_per_correct = 20
    base_coins_per_correct = 5
    
    xp_earned = int(correct_count * base_xp_per_correct * multiplier)
    coins_earned = int(correct_count * base_coins_per_correct * multiplier)
    stars_earned = 0  # Stars awarded on level completion, not per question
    
    return {
        "xp_earned": xp_earned,
        "coins_earned": coins_earned,
        "stars_earned": stars_earned,
        "multiplier": multiplier,
    }


@router.get("/attempts", response_model=AttemptListResponse)
async def list_attempts(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size (max 100)"),
    module: Optional[str] = Query(None, description="Filter by module slug"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty slug"),
    submodule: Optional[str] = Query(None, description="Filter by submodule slug"),
    session_type: Optional[str] = Query(None, description="Filter by session type (practice/mock)"),
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get authenticated user's quiz attempt history.
    
    Newest attempts first. Supports filtering by module, difficulty, submodule, and session type.
    """
    query = db.query(QuizAttempt).filter(QuizAttempt.account_id == account.id)
    
    if module:
        module_obj = db.query(Module).filter(Module.slug == module).first()
        if module_obj:
            query = query.filter(QuizAttempt.module_id == module_obj.id)
    
    if difficulty:
        difficulty_obj = db.query(DifficultyLevel).filter(DifficultyLevel.slug == difficulty).first()
        if difficulty_obj:
            query = query.filter(QuizAttempt.difficulty_id == difficulty_obj.id)
    
    if submodule:
        submodule_obj = db.query(Submodule).filter(Submodule.slug == submodule).first()
        if not submodule_obj:
            raise HTTPException(status_code=404, detail="Submodule not found")
        # If module is also specified, validate submodule belongs to it
        if module and module_obj:
            if submodule_obj.module_id != module_obj.id:
                raise HTTPException(status_code=422, detail="Submodule does not belong to the specified module")
        query = query.filter(QuizAttempt.submodule_id == submodule_obj.id)
    
    if session_type:
        if session_type not in ("practice", "mock"):
            raise HTTPException(status_code=422, detail="Invalid session_type")
        query = query.filter(QuizAttempt.session_type == session_type)
    
    total = query.count()
    
    attempts = (
        query.order_by(desc(QuizAttempt.completed_at))
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    
    attempt_responses = []
    for a in attempts:
        module_slug = a.module.slug if a.module else None
        difficulty_slug = a.difficulty.slug if a.difficulty else None
        submodule_slug = a.submodule.slug if a.submodule else None
        attempt_responses.append(AttemptSummaryResponse(
            id=a.id,
            session_type=a.session_type,
            module=module_slug,
            difficulty=difficulty_slug,
            submodule=submodule_slug,
            level=a.level_number,
            total_questions=a.total_questions,
            correct_answers=a.correct_answers,
            accuracy_percent=a.accuracy_percent,
            total_time_seconds=a.total_time_seconds,
            xp_earned=a.xp_earned,
            coins_earned=a.coins_earned,
            multiplier=float(a.multiplier),
            completed_at=a.completed_at,
        ))
    
    return AttemptListResponse(
        attempts=attempt_responses,
        total=total,
        page=page,
        size=size,
    )


@router.get("/attempts/summary", response_model=AttemptSummaryStats)
async def get_attempts_summary(
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get aggregate statistics for the authenticated user's quiz attempts.
    """
    attempts = db.query(QuizAttempt).filter(QuizAttempt.account_id == account.id).all()
    
    if not attempts:
        return AttemptSummaryStats(
            total_attempts=0,
            total_questions=0,
            total_correct=0,
            avg_accuracy_percent=0.0,
            total_time_seconds=0,
            total_xp_earned=0,
            total_coins_earned=0,
            by_module=[],
            by_difficulty=[],
            by_session_type=[],
        )
    
    total_attempts = len(attempts)
    total_questions = sum(a.total_questions for a in attempts)
    total_correct = sum(a.correct_answers for a in attempts)
    total_time = sum(a.total_time_seconds for a in attempts)
    total_xp = sum(a.xp_earned for a in attempts)
    total_coins = sum(a.coins_earned for a in attempts)
    avg_accuracy = round(sum(a.accuracy_percent for a in attempts) / total_attempts, 2)
    
    # By module
    by_module = {}
    for a in attempts:
        if a.module:
            key = a.module.slug
            if key not in by_module:
                by_module[key] = {"module": a.module.slug, "attempts": 0, "questions": 0, "correct": 0, "xp": 0}
            by_module[key]["attempts"] += 1
            by_module[key]["questions"] += a.total_questions
            by_module[key]["correct"] += a.correct_answers
            by_module[key]["xp"] += a.xp_earned
    
    # By difficulty
    by_difficulty = {}
    for a in attempts:
        if a.difficulty:
            key = a.difficulty.slug
            if key not in by_difficulty:
                by_difficulty[key] = {"difficulty": a.difficulty.slug, "attempts": 0, "questions": 0, "correct": 0, "xp": 0}
            by_difficulty[key]["attempts"] += 1
            by_difficulty[key]["questions"] += a.total_questions
            by_difficulty[key]["correct"] += a.correct_answers
            by_difficulty[key]["xp"] += a.xp_earned
    
    # By session type
    by_session_type = {}
    for a in attempts:
        key = a.session_type
        if key not in by_session_type:
            by_session_type[key] = {"session_type": key, "attempts": 0, "questions": 0, "correct": 0, "xp": 0}
        by_session_type[key]["attempts"] += 1
        by_session_type[key]["questions"] += a.total_questions
        by_session_type[key]["correct"] += a.correct_answers
        by_session_type[key]["xp"] += a.xp_earned
    
    return AttemptSummaryStats(
        total_attempts=total_attempts,
        total_questions=total_questions,
        total_correct=total_correct,
        avg_accuracy_percent=avg_accuracy,
        total_time_seconds=total_time,
        total_xp_earned=total_xp,
        total_coins_earned=total_coins,
        by_module=list(by_module.values()),
        by_difficulty=list(by_difficulty.values()),
        by_session_type=list(by_session_type.values()),
    )


@router.get("/attempts/{attempt_id}", response_model=AttemptDetailResponse)
async def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get detailed quiz attempt with question snapshots.
    
    Returns 404 if attempt doesn't exist or belongs to another account.
    """
    attempt = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.id == attempt_id, QuizAttempt.account_id == account.id)
        .first()
    )
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    module_slug = attempt.module.slug if attempt.module else None
    difficulty_slug = attempt.difficulty.slug if attempt.difficulty else None
    submodule_slug = attempt.submodule.slug if attempt.submodule else None
    
    question_details = []
    for q in attempt.questions:
        question_details.append(AttemptQuestionDetail(
            question_id=q.question_id,
            question_text=q.question_text_snapshot,
            explanation=q.explanation_snapshot or "",
            selected_option_id=q.selected_option_id,
            selected_option_text=q.selected_option_text_snapshot,
            correct_option_id=q.correct_option_id,
            correct_option_text=q.correct_option_text_snapshot,
            is_correct=bool(q.is_correct),
            time_seconds=q.time_seconds,
        ))
    
    return AttemptDetailResponse(
        id=attempt.id,
        session_type=attempt.session_type,
        module=module_slug,
        difficulty=difficulty_slug,
        submodule=submodule_slug,
        level=attempt.level_number,
        total_questions=attempt.total_questions,
        correct_answers=attempt.correct_answers,
        accuracy_percent=attempt.accuracy_percent,
        total_time_seconds=attempt.total_time_seconds,
        xp_earned=attempt.xp_earned,
        coins_earned=attempt.coins_earned,
        multiplier=float(attempt.multiplier),
        completed_at=attempt.completed_at,
        questions=question_details,
    )


@router.get("/progress", response_model=PlayerProgressResponse)
async def get_player_progress(
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get complete player progress across all modules and difficulties.
    
    Returns level completion status with stars, best accuracy, and completion timestamps.
    Includes submodule identity for submodule-specific progress.
    """
    # Get player profile
    profile = db.query(PlayerProfile).filter(
        PlayerProfile.account_id == account.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Get all modules
    modules = db.query(Module).filter(Module.is_active == 1).order_by(Module.display_order).all()
    
    # Get all progress records for this account
    progress_records = db.query(PlayerLevelProgress).filter(
        PlayerLevelProgress.account_id == account.id
    ).all()
    
    # Build lookup map: (module_id, difficulty_id, submodule_id, level_number) -> progress
    # Legacy progress uses submodule_id=0 (dummy sentinel)
    progress_map = {}
    for p in progress_records:
        key = (p.module_id, p.difficulty_id, p.submodule_id, p.level_number)
        progress_map[key] = p
    
    # Pre-load submodule slugs for submodule_id -> slug mapping
    submodule_ids = {p.submodule_id for p in progress_records if p.submodule_id != 0}
    submodule_slug_map = {}
    if submodule_ids:
        submodules = db.query(Submodule).filter(Submodule.id.in_(submodule_ids)).all()
        submodule_slug_map = {s.id: s.slug for s in submodules}
    
    # Build module progress response
    module_progress = []
    for module in modules:
        # Get all difficulty levels
        difficulties = db.query(DifficultyLevel).order_by(DifficultyLevel.display_order).all()
        
        module_levels = []
        for diff in difficulties:
            # Get progress for each level 1-50
            for level_num in range(1, 51):
                # First check for submodule-specific progress
                submodule_progress_map = {}
                has_submodule_progress = False
                
                # Collect all submodule-specific progress for this module/difficulty/level
                for p in progress_records:
                    if (p.module_id == module.id and 
                        p.difficulty_id == diff.id and 
                        p.level_number == level_num and 
                        p.submodule_id != 0):
                        key = (p.module_id, p.difficulty_id, p.submodule_id, p.level_number)
                        submodule_progress_map[key] = p
                        has_submodule_progress = True
                
                # Also check for legacy progress (submodule_id=0)
                legacy_key = (module.id, diff.id, 0, level_num)
                legacy_progress = progress_map.get(legacy_key)
                
                if has_submodule_progress:
                    # Return progress for each submodule independently
                    for key, progress in submodule_progress_map.items():
                        submodule_id = key[2]
                        submodule_slug = submodule_slug_map.get(submodule_id)
                        level_resp = LevelProgressResponse(
                            module=module.slug,
                            difficulty=diff.slug,
                            level=level_num,
                            submodule=submodule_slug,
                            stars_earned=progress.stars_earned,
                            best_accuracy=progress.best_accuracy,
                            completed_at=progress.completed_at,
                        )
                        module_levels.append(level_resp)
                    
                    # If legacy also exists for this level, include it separately
                    if legacy_progress:
                        level_resp = LevelProgressResponse(
                            module=module.slug,
                            difficulty=diff.slug,
                            level=level_num,
                            submodule=None,  # Legacy has no submodule
                            stars_earned=legacy_progress.stars_earned,
                            best_accuracy=legacy_progress.best_accuracy,
                            completed_at=legacy_progress.completed_at,
                        )
                        module_levels.append(level_resp)
                else:
                    # Only legacy progress (or no progress)
                    if legacy_progress:
                        level_resp = LevelProgressResponse(
                            module=module.slug,
                            difficulty=diff.slug,
                            level=level_num,
                            submodule=None,
                            stars_earned=legacy_progress.stars_earned,
                            best_accuracy=legacy_progress.best_accuracy,
                            completed_at=legacy_progress.completed_at,
                        )
                    else:
                        # Level never completed
                        level_resp = LevelProgressResponse(
                            module=module.slug,
                            difficulty=diff.slug,
                            level=level_num,
                            submodule=None,
                            stars_earned=0,
                            best_accuracy=0,
                            completed_at=None,
                        )
                    module_levels.append(level_resp)
        
        module_progress.append(ModuleProgressResponse(
            module_slug=module.slug,
            module_name=module.name,
            levels=module_levels,
        ))
    
    # Build profile dict
    profile_dict = {
        "player_id": profile.player_id,
        "display_name": profile.display_name,
        "avatar": profile.avatar,
        "xp": profile.xp,
        "coins": profile.coins,
        "diamonds": profile.diamonds,
        "stars": profile.stars,
        "streak": profile.streak,
        "last_activity_date": profile.last_activity_date,
    }
    
    return PlayerProgressResponse(
        profile=profile_dict,
        modules=module_progress,
    )


@router.get("/progress/v2", response_model=V2PlayerProgressResponse)
async def get_player_progress_v2(
    db: Session = Depends(get_db),
    account = Depends(_get_current_account),
):
    """
    Get complete player progress across all modules, submodules, difficulties, and levels (V2).
    
    Returns nested structure: Module -> Difficulty -> Submodule -> Level
    Each level includes completion status, stars, best accuracy, attempts count, and XP earned.
    Legacy progress (submodule_id=0) appears with submodule=None.
    """
    # Get player profile
    profile = db.query(PlayerProfile).filter(
        PlayerProfile.account_id == account.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Get all modules
    modules = db.query(Module).filter(Module.is_active == 1).order_by(Module.display_order).all()
    
    # Get all progress records for this account
    progress_records = db.query(PlayerLevelProgress).filter(
        PlayerLevelProgress.account_id == account.id
    ).all()
    
    # Get all attempts for this account to compute attempts_count and xp per level
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.account_id == account.id,
        QuizAttempt.session_type == "practice",
    ).all()
    
    # Build lookup maps
    # progress_map: (module_id, difficulty_id, submodule_id, level_number) -> progress
    progress_map = {}
    for p in progress_records:
        key = (p.module_id, p.difficulty_id, p.submodule_id, p.level_number)
        progress_map[key] = p
    
    # attempts_map: (module_id, difficulty_id, submodule_id, level_number) -> (count, total_xp)
    attempts_map = {}
    for a in attempts:
        if a.module_id and a.difficulty_id and a.level_number:
            key = (a.module_id, a.difficulty_id, a.submodule_id or 0, a.level_number)
            if key not in attempts_map:
                attempts_map[key] = {"count": 0, "xp": 0}
            attempts_map[key]["count"] += 1
            attempts_map[key]["xp"] += a.xp_earned or 0
    
    # Pre-load ALL submodules for each module (not just those with progress)
    # This ensures all submodules appear in the response even with empty progress
    # Exclude the dummy submodule (id=0, slug="no-submodule") from real submodules
    all_submodules = db.query(Submodule).filter(
        Submodule.is_active == 1,
        Submodule.id != 0  # Exclude dummy legacy sentinel
    ).all()
    submodules_by_module = {}
    for s in all_submodules:
        if s.module_id not in submodules_by_module:
            submodules_by_module[s.module_id] = []
        submodules_by_module[s.module_id].append(s)
    
    # Pre-load submodule info for submodule_id -> (slug, name)
    # Legacy (0) maps to (None, None)
    submodule_info_map = {0: (None, None)}
    for s in all_submodules:
        submodule_info_map[s.id] = (s.slug, s.name)
    
    # Build V2 module progress response
    v2_module_progress = []
    
    for module in modules:
        difficulties = db.query(DifficultyLevel).order_by(DifficultyLevel.display_order).all()
        v2_difficulties = []
        
        # Get all submodules for this module (including legacy)
        module_submodules = submodules_by_module.get(module.id, [])
        
        for diff in difficulties:
            v2_submodules = []
            
            # Always include legacy (submodule_id=0) first
            legacy_slug, legacy_name = submodule_info_map.get(0, (None, None))
            v2_levels = []
            for level_num in range(1, 51):
                key = (module.id, diff.id, 0, level_num)
                progress = progress_map.get(key)
                attempt_info = attempts_map.get(key, {"count": 0, "xp": 0})
                
                if progress:
                    v2_levels.append(V2LevelProgressResponse(
                        module=module.slug,
                        module_name=module.name,
                        submodule=legacy_slug,
                        submodule_name=legacy_name,
                        difficulty=diff.slug,
                        level=level_num,
                        completed=True,
                        stars_earned=progress.stars_earned,
                        best_accuracy=progress.best_accuracy,
                        completed_at=progress.completed_at,
                        attempts_count=attempt_info["count"],
                        total_xp_earned=attempt_info["xp"],
                    ))
                else:
                    v2_levels.append(V2LevelProgressResponse(
                        module=module.slug,
                        module_name=module.name,
                        submodule=legacy_slug,
                        submodule_name=legacy_name,
                        difficulty=diff.slug,
                        level=level_num,
                        completed=False,
                        stars_earned=0,
                        best_accuracy=0,
                        completed_at=None,
                        attempts_count=attempt_info["count"],
                        total_xp_earned=attempt_info["xp"],
                    ))
            
            v2_submodules.append(V2SubmoduleProgressResponse(
                submodule=legacy_slug,
                submodule_name=legacy_name,
                levels=v2_levels,
            ))
            
            # Include all real submodules for this module
            for submodule in sorted(module_submodules, key=lambda s: s.display_order):
                submodule_slug, submodule_name = submodule_info_map.get(submodule.id, (submodule.slug, submodule.name))
                
                v2_levels = []
                for level_num in range(1, 51):
                    key = (module.id, diff.id, submodule.id, level_num)
                    progress = progress_map.get(key)
                    attempt_info = attempts_map.get(key, {"count": 0, "xp": 0})
                    
                    if progress:
                        v2_levels.append(V2LevelProgressResponse(
                            module=module.slug,
                            module_name=module.name,
                            submodule=submodule_slug,
                            submodule_name=submodule_name,
                            difficulty=diff.slug,
                            level=level_num,
                            completed=True,
                            stars_earned=progress.stars_earned,
                            best_accuracy=progress.best_accuracy,
                            completed_at=progress.completed_at,
                            attempts_count=attempt_info["count"],
                            total_xp_earned=attempt_info["xp"],
                        ))
                    else:
                        v2_levels.append(V2LevelProgressResponse(
                            module=module.slug,
                            module_name=module.name,
                            submodule=submodule_slug,
                            submodule_name=submodule_name,
                            difficulty=diff.slug,
                            level=level_num,
                            completed=False,
                            stars_earned=0,
                            best_accuracy=0,
                            completed_at=None,
                            attempts_count=attempt_info["count"],
                            total_xp_earned=attempt_info["xp"],
                        ))
                
                v2_submodules.append(V2SubmoduleProgressResponse(
                    submodule=submodule_slug,
                    submodule_name=submodule_name,
                    levels=v2_levels,
                ))
            
            v2_difficulties.append(V2DifficultyProgressResponse(
                difficulty=diff.slug,
                submodules=v2_submodules,
            ))
        
        v2_module_progress.append(V2ModuleProgressResponse(
            module_slug=module.slug,
            module_name=module.name,
            difficulties=v2_difficulties,
        ))
    
    # Build profile dict (same as V1)
    profile_dict = {
        "player_id": profile.player_id,
        "display_name": profile.display_name,
        "avatar": profile.avatar,
        "xp": profile.xp,
        "coins": profile.coins,
        "diamonds": profile.diamonds,
        "stars": profile.stars,
        "streak": profile.streak,
        "last_activity_date": profile.last_activity_date,
    }
    
    return V2PlayerProgressResponse(
        profile=profile_dict,
        modules=v2_module_progress,
    )
