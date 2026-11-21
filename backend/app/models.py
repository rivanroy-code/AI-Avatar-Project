from typing import Literal, Optional

from pydantic import BaseModel, Field


DetectedEvent = Literal[
    "none",
    "repetition",
    "prolongation",
    "long_pause",
    "unknown",
]


class AnalysisRequest(BaseModel):
    task_id: str = Field(min_length=1)
    input_type: Literal["mock", "audio", "text"]
    mock_scenario: Optional[
        Literal[
            "success",
            "repetition",
            "prolongation",
            "long_pause",
            "low_confidence",
            "error",
        ]
    ] = None


class AnalysisResponse(BaseModel):
    task_id: str
    analysis_status: Literal["success", "error"]
    detected_event: Optional[DetectedEvent] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    feedback_level: Literal["positive", "retry_supportive", "error"]
    message: str
    next_action: Literal["next", "retry", "error"]


class TavusConversationRequest(BaseModel):
    task_id: Optional[str] = None
    custom_greeting: Optional[str] = None


class TavusConversationResponse(BaseModel):
    conversation_id: str
    conversation_url: str
    status: str
