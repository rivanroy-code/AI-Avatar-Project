const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.detail ?? `Request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export function analyseSpeech({ taskId, mockScenario }) {
  return requestJson("/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: taskId,
      input_type: "mock",
      mock_scenario: mockScenario,
    }),
  });
}

export function createTavusConversation({ taskId, customGreeting }) {
  return requestJson("/api/tavus/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: taskId,
      custom_greeting: customGreeting,
    }),
  });
}

export function endTavusConversation(conversationId) {
  return requestJson(`/api/tavus/conversations/${conversationId}/end`, {
    method: "POST",
  });
}

export function processDialogueTurn({ taskId, prompt, childIntent, mockScenario }) {
  return requestJson("/api/session/turn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: taskId,
      prompt,
      child_intent: childIntent,
      mock_scenario: mockScenario,
    }),
  });
}
