from typing import Literal, Optional

from pydantic import BaseModel, Field


ChildIntent = Literal[
    "answered",
    "repeat_request",
    "dont_know",
    "no_response",
    "stop",
]


class DialogueTurnRequest(BaseModel):
    task_id: str
    prompt: str = Field(min_length=1, max_length=240)
    child_intent: ChildIntent
    mock_scenario: Optional[str] = None


class DialogueTurnResponse(BaseModel):
    task_id: str
    child_intent: ChildIntent
    assistant_messages: list[str]
    next_action: Literal["next", "retry", "wait", "repeat", "stop", "error"]
    analysis_status: Optional[Literal["success", "error"]] = None
    detected_event: Optional[str] = None
    confidence: Optional[float] = None
    feedback_level: Optional[str] = None
