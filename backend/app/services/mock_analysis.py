from dataclasses import dataclass

from app.models import DetectedEvent


@dataclass(frozen=True)
class MockAnalysisResult:
    analysis_status: str
    detected_event: DetectedEvent | None
    confidence: float | None


MOCK_RESULTS: dict[str, MockAnalysisResult] = {
    "success": MockAnalysisResult("success", "none", 0.94),
    "repetition": MockAnalysisResult("success", "repetition", 0.82),
    "prolongation": MockAnalysisResult("success", "prolongation", 0.78),
    "long_pause": MockAnalysisResult("success", "long_pause", 0.79),
    "low_confidence": MockAnalysisResult("success", "unknown", 0.42),
    "error": MockAnalysisResult("error", None, None),
}


def analyse_mock(scenario: str | None) -> MockAnalysisResult:
    """Return deterministic analysis data so every UI branch is repeatable."""
    return MOCK_RESULTS.get(scenario or "success", MOCK_RESULTS["success"])
