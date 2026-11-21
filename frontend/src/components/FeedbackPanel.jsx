export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  return (
    <section className="feedback-card">
      <p className="eyebrow">Structured backend response</p>
      <h3>{feedback.feedback_level === "positive" ? "Feedback" : "Supportive response"}</h3>
      <p>{feedback.message}</p>
      <dl className="debug-grid">
        <div><dt>Event</dt><dd>{feedback.detected_event ?? "—"}</dd></div>
        <div><dt>Confidence</dt><dd>{feedback.confidence == null ? "—" : feedback.confidence.toFixed(2)}</dd></div>
        <div><dt>Next action</dt><dd>{feedback.next_action}</dd></div>
      </dl>
      <p className="debug-note">Technical fields are shown for research/debugging only and would not be exposed in a child-facing production interface.</p>
    </section>
  );
}
