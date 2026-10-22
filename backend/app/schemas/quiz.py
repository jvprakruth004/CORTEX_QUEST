"""Quiz Pydantic schemas for Cortex Quest"""
from typing import List, Optional, Literal
from datetime import datetime, date
from pydantic import BaseModel, Field


class QuestionOptionResponse(BaseModel):
    """Question option for quiz delivery (no correct answer exposed)"""
    id: int
    text: str
    display_order: int

    class Config:
        from_attributes = True


class QuestionDeliveryResponse(BaseModel):
    """Question for quiz delivery (no correct answer or explanation)"""
    id: int
    question_text: str
    options: List[QuestionOptionResponse]

    class Config:
        from_attributes = True


class PracticeQuizResponse(BaseModel):
    """Response for practice quiz questions"""
    module: str
    difficulty: str
    level: int
    submodule: Optional[str] = None
    questions: List[QuestionDeliveryResponse]
    total: int
    session_id: Optional[str] = None


class LifelineRequest(BaseModel):
    session_id: str = Field(..., min_length=36, max_length=36)
    question_id: int = Field(..., ge=1)


class PracticeAnswerRequest(BaseModel):
    session_id: str = Field(..., min_length=36, max_length=36)
    question_id: int = Field(..., ge=1)
    selected_option_id: int = Field(..., ge=1)
    time_seconds: int = Field(..., ge=0, le=3600)


class PracticeAnswerResponse(BaseModel):
    question_id: int
    correct: bool
    selected_option_id: int
    correct_option_id: int
    correct_option_text: str
    explanation: str


class LifelineResponse(BaseModel):
    available: bool
    hint: Optional[str] = None
    removed_option_ids: List[int] = Field(default_factory=list)
    coins: int
    diamonds: int
    inventory_hint: int = 0
    inventory_5050: int = 0


# Quiz Submission Schemas
class QuizAnswerRequest(BaseModel):
    """Single answer in a quiz submission"""
    question_id: int = Field(..., description="Question ID")
    selected_option_id: int = Field(..., description="Selected option ID")
    time_seconds: int = Field(..., ge=0, le=3600, description="Time taken in seconds (0-3600)")


class QuizSubmitRequest(BaseModel):
    """Quiz submission request"""
    session_type: Literal["practice", "mock"] = Field(default="practice", description="Quiz session type")
    module: Optional[str] = Field(None, description="Module slug (required for practice)")
    difficulty: Optional[str] = Field(None, description="Difficulty slug (required for practice)")
    level: Optional[int] = Field(None, ge=1, le=50, description="Level number (required for practice)")
    submodule: Optional[str] = Field(None, description="Submodule slug (optional for practice)")
    session_id: Optional[str] = Field(None, min_length=36, max_length=36, description="Practice session returned by question delivery")
    answers: List[QuizAnswerRequest] = Field(..., min_length=1, max_length=50, description="Answers to questions")


class QuestionResultResponse(BaseModel):
    """Result for a single question after submission"""
    question_id: int
    correct: bool
    selected_option_id: int
    correct_option_id: int
    explanation: str


class QuizSubmitResponse(BaseModel):
    """Quiz submission response with scoring"""
    session_type: str
    module: Optional[str] = None
    difficulty: Optional[str] = None
    level: Optional[int] = None
    submodule: Optional[str] = None
    results: List[QuestionResultResponse]
    summary: dict
    rewards: dict


# Quiz History Schemas
class AttemptQuestionDetail(BaseModel):
    """Question detail in an attempt"""
    question_id: int
    question_text: str
    explanation: str
    selected_option_id: int
    selected_option_text: str
    correct_option_id: int
    correct_option_text: str
    is_correct: bool
    time_seconds: int

    class Config:
        from_attributes = True


class AttemptSummaryResponse(BaseModel):
    """Summary of a quiz attempt"""
    id: int
    session_type: str
    module: Optional[str] = None
    difficulty: Optional[str] = None
    submodule: Optional[str] = None
    level: Optional[int] = None
    total_questions: int
    correct_answers: int
    accuracy_percent: int
    total_time_seconds: int
    xp_earned: int
    coins_earned: int
    multiplier: float
    completed_at: datetime

    class Config:
        from_attributes = True


class AttemptDetailResponse(AttemptSummaryResponse):
    """Full attempt detail with questions"""
    questions: List[AttemptQuestionDetail]

    class Config:
        from_attributes = True


class AttemptListResponse(BaseModel):
    """Paginated list of attempts"""
    attempts: List[AttemptSummaryResponse]
    total: int
    page: int
    size: int


class AttemptSummaryStats(BaseModel):
    """Aggregate statistics for a user"""
    total_attempts: int
    total_questions: int
    total_correct: int
    avg_accuracy_percent: float
    total_time_seconds: int
    total_xp_earned: int
    total_coins_earned: int
    by_module: List[dict]
    by_difficulty: List[dict]
    by_session_type: List[dict]


# Player Progress Schemas
class LevelProgressResponse(BaseModel):
    """Progress for a single level"""
    module: str
    difficulty: str
    level: int
    submodule: Optional[str] = None
    stars_earned: int
    best_accuracy: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModuleProgressResponse(BaseModel):
    """Progress grouped by module"""
    module_slug: str
    module_name: str
    levels: List[LevelProgressResponse]


class PlayerProgressResponse(BaseModel):
    """Complete player progress response"""
    profile: dict
    modules: List[ModuleProgressResponse]


# V2 Progress Schemas (submodule-aware)
class V2LevelProgressResponse(BaseModel):
    """Progress for a single level in V2 (includes submodule identity)"""
    module: str
    module_name: str
    submodule: Optional[str] = None
    submodule_name: Optional[str] = None
    difficulty: str
    level: int
    completed: bool
    stars_earned: int
    best_accuracy: int
    completed_at: Optional[datetime] = None
    attempts_count: int = 0
    total_xp_earned: int = 0

    class Config:
        from_attributes = True


class V2SubmoduleProgressResponse(BaseModel):
    """Progress grouped by submodule within a module/difficulty"""
    submodule: Optional[str] = None
    submodule_name: Optional[str] = None
    levels: List[V2LevelProgressResponse]


class V2DifficultyProgressResponse(BaseModel):
    """Progress grouped by difficulty within a module"""
    difficulty: str
    submodules: List[V2SubmoduleProgressResponse]


class V2ModuleProgressResponse(BaseModel):
    """Progress grouped by module in V2"""
    module_slug: str
    module_name: str
    difficulties: List[V2DifficultyProgressResponse]


class V2PlayerProgressResponse(BaseModel):
    """Complete player progress response V2"""
    profile: dict
    modules: List[V2ModuleProgressResponse]
