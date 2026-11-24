export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  return (
    <section className="feedback-card">
      <p className="eyebrow">
        {feedback.feedback_level === "positive" ? "Practice complete" : "Supportive feedback"}
      </p>
      <h3>{feedback.feedback_level === "positive" ? "Thanks for practising" : "Let's try that again"}</h3>
      <p className="feedback-message">{feedback.message}</p>

      <details className="research-details">
        <summary>Research/debug response</summary>
        <dl className="debug-grid">
          <div><dt>Event</dt><dd>{feedback.detected_event ?? "—"}</dd></div>
          <div><dt>Confidence</dt><dd>{feedback.confidence == null ? "—" : feedback.confidence.toFixed(2)}</dd></div>
          <div><dt>Next action</dt><dd>{feedback.next_action}</dd></div>
        </dl>
        <p className="debug-note">These technical fields are shown for prototype evaluation only and are not intended for an end-user interface.</p>
      </details>
    </section>
  );
}
