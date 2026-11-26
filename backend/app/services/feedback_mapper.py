from dataclasses import dataclass

from app.services.mock_analysis import MockAnalysisResult


@dataclass(frozen=True)
class Feedback:
    feedback_level: str
    message: str
    next_action: str


def map_feedback(result: MockAnalysisResult) -> Feedback:
    if result.analysis_status == "error":
        return Feedback(
            feedback_level="error",
            message="I couldn't process that response right now. Please try again.",
            next_action="error",
        )

    if result.confidence is None or result.confidence < 0.60:
        return Feedback(
            feedback_level="retry_supportive",
            message="I couldn't analyse that response confidently. Let's try once more.",
            next_action="retry",
        )

    if result.detected_event == "none":
        return Feedback(
            feedback_level="positive",
            message="Thanks for practising that phrase. Let's move to the next one.",
            next_action="next",
        )

    if result.detected_event in {"repetition", "prolongation"}:
        return Feedback(
            feedback_level="retry_supportive",
            message="Thanks for giving that a go. Let's try the phrase once more when you're ready.",
            next_action="retry",
        )

    if result.detected_event == "long_pause":
        return Feedback(
            feedback_level="retry_supportive",
            message="Good effort. Take your time, and try again when you're ready.",
            next_action="retry",
        )

    return Feedback(
        feedback_level="retry_supportive",
        message="Thanks for trying that. Let's have another go when you're ready.",
        next_action="retry",
    )
