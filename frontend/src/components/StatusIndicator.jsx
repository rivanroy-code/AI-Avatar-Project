const STATUS = {
  welcome: "Ready",
  instruction: "Task ready",
  recording: "Listening",
  analysing: "Analysing",
  feedback: "Feedback ready",
  retry: "Try again",
  error: "Recovery required",
};

export default function StatusIndicator({ state }) {
  return <div className={`status status-${state}`}>Status: {STATUS[state]}</div>;
}
