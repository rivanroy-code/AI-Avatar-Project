import { useMemo, useState } from "react";
import AvatarPanel from "./components/AvatarPanel";
import FeedbackPanel from "./components/FeedbackPanel";
import StatusIndicator from "./components/StatusIndicator";
import TavusPanel from "./components/TavusPanel";
import { SESSION_STATES } from "./constants/states";
import { tasks } from "./data/tasks";
import { processDialogueTurn } from "./services/api";

const SCENARIOS = [
  ["success", "No significant event"],
  ["repetition", "Repetition"],
  ["prolongation", "Prolongation"],
  ["long_pause", "Long pause"],
  ["low_confidence", "Low confidence"],
  ["error", "Backend error"],
];

const CHILD_INTENTS = [
  ["answered", "Child repeats the sentence"],
  ["repeat_request", "Child asks to hear it again"],
  ["dont_know", "Child says ‘I don't know’"],
  ["no_response", "No response"],
  ["stop", "Child wants to stop"],
];

export default function App() {
  const [state, setState] = useState(SESSION_STATES.WELCOME);
  const [taskIndex, setTaskIndex] = useState(0);
  const [scenario, setScenario] = useState("success");
  const [childIntent, setChildIntent] = useState("answered");
  const [feedback, setFeedback] = useState(null);
  const [assistantMessages, setAssistantMessages] = useState([]);
  const task = useMemo(() => tasks[taskIndex], [taskIndex]);

  function start() {
    setFeedback(null);
    setAssistantMessages([
      "Hi! Are you ready to practise some sentences with me?",
      "I'll say a sentence, and then you can have a turn. You can take your time.",
    ]);
    setState(SESSION_STATES.INSTRUCTION);
  }

  function beginInput() {
    setFeedback(null);
    setAssistantMessages([
      `Listen first: ${task.prompt}`,
      `Now it's your turn. Can you say: ${task.prompt}`,
    ]);
    setState(SESSION_STATES.RECORDING);
  }

  async function submitTurn() {
    setState(SESSION_STATES.ANALYSING);
    try {
      const result = await processDialogueTurn({
        taskId: task.id,
        prompt: task.prompt,
        childIntent,
        mockScenario: childIntent === "answered" ? scenario : null,
      });

      setAssistantMessages(result.assistant_messages ?? []);
      setFeedback({
        feedback_level: result.feedback_level,
        message: (result.assistant_messages ?? []).join(" "),
        confidence: result.confidence,
        detected_event: result.detected_event,
      });

      if (result.next_action === "next") setState(SESSION_STATES.FEEDBACK);
      else if (["retry", "repeat", "wait"].includes(result.next_action)) setState(SESSION_STATES.RETRY);
      else if (result.next_action === "stop") setState(SESSION_STATES.FEEDBACK);
      else setState(SESSION_STATES.ERROR);
    } catch (err) {
      setFeedback({ feedback_level: "error", message: err.message, next_action: "error" });
      setAssistantMessages([err.message]);
      setState(SESSION_STATES.ERROR);
    }
  }

  function retry() {
    setFeedback(null);
    setState(SESSION_STATES.INSTRUCTION);
  }

  function nextTask() {
    setFeedback(null);
    setAssistantMessages([]);
    setTaskIndex((index) => (index + 1) % tasks.length);
    setState(SESSION_STATES.INSTRUCTION);
  }

  const childStopped = childIntent === "stop" && state === SESSION_STATES.FEEDBACK;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Honours research prototype</p>
          <h1>Avatar-Guided Speech Practice</h1>
        </div>
        <span className="prototype-badge">Non-clinical prototype</span>
      </header>

      <main className="layout">
        <AvatarPanel sessionState={state} feedback={feedback} />

        <section className="practice-card">
          <StatusIndicator state={state} />

          {state === SESSION_STATES.WELCOME ? (
            <>
              <h2>Welcome</h2>
              <p>
                This research prototype demonstrates avatar-guided practice, a deterministic dialogue flow,
                mock analysis, supportive feedback, retry handling, and a replaceable Tavus avatar layer.
              </p>
              <button onClick={start}>Start practice</button>
            </>
          ) : (
            <>
              <p className="eyebrow">Current task</p>
              <h2 className="prompt">“{task.prompt}”</h2>

              {assistantMessages.length > 0 && (
                <div className="assistant-script">
                  {assistantMessages.map((message, index) => (
                    <p key={`${index}-${message}`}>{message}</p>
                  ))}
                </div>
              )}

              {state === SESSION_STATES.INSTRUCTION && (
                <button onClick={beginInput}>Present sentence</button>
              )}

              {state === SESSION_STATES.RECORDING && (
                <div className="recording-box">
                  <strong>Simulated child response</strong>
                  <p>
                    The prototype separates conversational intent from the mock speech-analysis result so every
                    branch can be tested independently of the unfinished ML model.
                  </p>

                  <label>
                    Child response
                    <select value={childIntent} onChange={(event) => setChildIntent(event.target.value)}>
                      {CHILD_INTENTS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>

                  {childIntent === "answered" && (
                    <label>
                      Mock speech-analysis outcome
                      <select value={scenario} onChange={(event) => setScenario(event.target.value)}>
                        {SCENARIOS.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <button onClick={submitTurn}>Submit simulated response</button>
                </div>
              )}

              {state === SESSION_STATES.ANALYSING && <div className="loading">Processing dialogue and structured input…</div>}

              {[SESSION_STATES.FEEDBACK, SESSION_STATES.RETRY, SESSION_STATES.ERROR].includes(state) && (
                <FeedbackPanel feedback={feedback} />
              )}

              {state === SESSION_STATES.FEEDBACK && !childStopped && <button onClick={nextTask}>Next sentence</button>}
              {childStopped && <button onClick={() => setState(SESSION_STATES.WELCOME)}>Finish session</button>}
              {[SESSION_STATES.RETRY, SESSION_STATES.ERROR].includes(state) && <button onClick={retry}>Return to sentence</button>}
            </>
          )}

          <p className="disclaimer">
            Research prototype only. Dialogue wording requires speech-pathology review before child-facing use.
            The system does not diagnose stuttering or replace a speech pathologist.
          </p>
        </section>
      </main>

      <TavusPanel task={task} />
    </div>
  );
}
