from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def turn(intent: str, scenario: str | None = None):
    payload = {
        "task_id": "phrase_001",
        "prompt": "The cat is sleeping.",
        "child_intent": intent,
    }
    if scenario is not None:
        payload["mock_scenario"] = scenario
    return client.post("/api/session/turn", json=payload)


def test_repeat_request_repeats_prompt():
    response = turn("repeat_request")
    assert response.status_code == 200
    data = response.json()
    assert data["next_action"] == "repeat"
    assert "The cat is sleeping" in " ".join(data["assistant_messages"])


def test_no_response_does_not_blame_child():
    response = turn("no_response")
    assert response.status_code == 200
    data = response.json()
    assert data["next_action"] == "wait"
    assert "no rush" in " ".join(data["assistant_messages"]).lower()


def test_stop_ends_session_supportively():
    response = turn("stop")
    assert response.status_code == 200
    data = response.json()
    assert data["next_action"] == "stop"


def test_answered_branch_uses_analysis_adapter():
    response = turn("answered", "repetition")
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_status"] == "success"
    assert data["detected_event"] == "repetition"
    assert data["next_action"] == "retry"
