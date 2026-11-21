const STATUS = {
  welcome: "Ready",
  instruction: "Task ready",
  recording: "Listening / simulated input",
  analysing: "Analysing",
  feedback: "Feedback ready",
  retry: "Retry recommended",
  error: "Recovery required",
};

export default function StatusIndicator({ state }) {
  return <div className={`status status-${state}`}>Status: {STATUS[state]}</div>;
}
