from app.dialogue_models import DialogueTurnRequest, DialogueTurnResponse
from app.services.feedback_mapper import map_feedback
from app.services.mock_analysis import analyse_mock


def handle_dialogue_turn(request: DialogueTurnRequest) -> DialogueTurnResponse:
    """Deterministic dialogue controller for the prototype exercise flow.

    This layer models interaction intent separately from speech-event analysis.
    The wording is deliberately supportive and non-diagnostic and should be
    reviewed by speech-pathology collaborators before any child-facing study.
    """
    if request.child_intent == "stop":
        return DialogueTurnResponse(
            task_id=request.task_id,
            child_intent=request.child_intent,
            assistant_messages=[
                "That's okay. We can stop here.",
                "Thanks for practising with me today.",
            ],
            next_action="stop",
        )

    if request.child_intent == "repeat_request":
        return DialogueTurnResponse(
            task_id=request.task_id,
            child_intent=request.child_intent,
            assistant_messages=[
                f"Of course. Listen again: {request.prompt}",
                "Take your time. You can have another turn when you're ready.",
            ],
            next_action="repeat",
        )

    if request.child_intent == "dont_know":
        return DialogueTurnResponse(
            task_id=request.task_id,
            child_intent=request.child_intent,
            assistant_messages=[
                "That's okay. We can hear the sentence again first.",
                f"Listen: {request.prompt}",
                "You can decide whether you'd like to try it now.",
            ],
            next_action="repeat",
        )

    if request.child_intent == "no_response":
        return DialogueTurnResponse(
            task_id=request.task_id,
            child_intent=request.child_intent,
            assistant_messages=[
                "Take your time. There's no rush.",
                "Would you like to hear the sentence again?",
            ],
            next_action="wait",
        )

    # A spoken answer is the only branch that invokes the analysis adapter.
    result = analyse_mock(request.mock_scenario)
    feedback = map_feedback(result)
    return DialogueTurnResponse(
        task_id=request.task_id,
        child_intent=request.child_intent,
        assistant_messages=[feedback.message],
        next_action=feedback.next_action,
        analysis_status=result.analysis_status,
        detected_event=result.detected_event,
        confidence=result.confidence,
        feedback_level=feedback.feedback_level,
    )
