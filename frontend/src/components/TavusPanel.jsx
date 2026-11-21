import { useState } from "react";
import { createTavusConversation, endTavusConversation } from "../services/api";

export default function TavusPanel({ task }) {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startConversation() {
    setLoading(true);
    setError("");
    try {
      const created = await createTavusConversation({
        taskId: task.id,
        customGreeting: `Hi! Let's practise the phrase: ${task.prompt}`,
      });
      setConversation(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function endConversation() {
    if (!conversation) return;
    try {
      await endTavusConversation(conversation.conversation_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setConversation(null);
    }
  }

  return (
    <section className="tavus-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Optional live avatar layer</p>
          <h2>Tavus CVI</h2>
        </div>
        {!conversation ? (
          <button onClick={startConversation} disabled={loading}>
            {loading ? "Starting…" : "Start Tavus session"}
          </button>
        ) : (
          <button className="secondary" onClick={endConversation}>End session</button>
        )}
      </div>

      {error && <p className="notice">{error}</p>}

      {conversation && (
        <div className="tavus-frame-wrap">
          <iframe
            title="Tavus conversational avatar"
            src={conversation.conversation_url}
            allow="camera; microphone; autoplay; fullscreen; display-capture"
          />
        </div>
      )}

      {!conversation && (
        <p className="muted">
          The prototype remains usable in mock-avatar mode when Tavus credentials are not configured.
        </p>
      )}
    </section>
  );
}
