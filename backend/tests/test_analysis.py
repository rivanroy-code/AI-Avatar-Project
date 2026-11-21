from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_success_goes_to_next() -> None:
    response = client.post(
        "/api/analyse",
        json={
            "task_id": "phrase_001",
            "input_type": "mock",
            "mock_scenario": "success",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["detected_event"] == "none"
    assert body["next_action"] == "next"
    assert body["feedback_level"] == "positive"


def test_repetition_is_supportive_retry() -> None:
    response = client.post(
        "/api/analyse",
        json={
            "task_id": "phrase_001",
            "input_type": "mock",
            "mock_scenario": "repetition",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["detected_event"] == "repetition"
    assert body["next_action"] == "retry"
    assert "try" in body["message"].lower()


def test_low_confidence_is_explicitly_system_uncertainty() -> None:
    response = client.post(
        "/api/analyse",
        json={
            "task_id": "phrase_001",
            "input_type": "mock",
            "mock_scenario": "low_confidence",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["confidence"] < 0.60
    assert body["next_action"] == "retry"
    assert "confidently" in body["message"].lower()


def test_analysis_error_enters_error_state() -> None:
    response = client.post(
        "/api/analyse",
        json={
            "task_id": "phrase_001",
            "input_type": "mock",
            "mock_scenario": "error",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["analysis_status"] == "error"
    assert body["next_action"] == "error"


def test_audio_is_deliberately_not_implemented_yet() -> None:
    response = client.post(
        "/api/analyse",
        json={"task_id": "phrase_001", "input_type": "audio"},
    )
    assert response.status_code == 501
