from fastapi import APIRouter, HTTPException, status

from app.models import AnalysisRequest, AnalysisResponse
from app.services.feedback_mapper import map_feedback
from app.services.mock_analysis import analyse_mock

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyse", response_model=AnalysisResponse)
def analyse(request: AnalysisRequest) -> AnalysisResponse:
    # The current honours prototype deliberately uses deterministic mock analysis.
    # Audio/text adapters can later produce the same AnalysisResponse contract.
    if request.input_type != "mock":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=(
                "Audio/text analysis is not implemented in this prototype yet. "
                "Use input_type='mock' to exercise the integration contract."
            ),
        )

    result = analyse_mock(request.mock_scenario)
    feedback = map_feedback(result)

    return AnalysisResponse(
        task_id=request.task_id,
        analysis_status=result.analysis_status,  # type: ignore[arg-type]
        detected_event=result.detected_event,
        confidence=result.confidence,
        feedback_level=feedback.feedback_level,  # type: ignore[arg-type]
        message=feedback.message,
        next_action=feedback.next_action,  # type: ignore[arg-type]
    )
