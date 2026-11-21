const TEXT = {
  welcome: "Hi! I'm here to guide a short speech practice activity.",
  instruction: "Let's practise the phrase shown on screen.",
  recording: "I'm listening.",
  analysing: "I'm checking the response.",
};

export default function AvatarPanel({ sessionState, feedback }) {
  const message = feedback?.message ?? TEXT[sessionState] ?? "Ready when you are.";

  return (
    <aside className="avatar-card" aria-label="Avatar presentation area">
      <div className="avatar-placeholder" aria-hidden="true">
        <div className="avatar-face">AI</div>
        <span>Tavus avatar viewport</span>
      </div>
      <div className="speech-bubble">{message}</div>
    </aside>
  );
}
