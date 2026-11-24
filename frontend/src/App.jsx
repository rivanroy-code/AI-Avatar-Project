import { useRef, useState } from "react";
import AvatarPanel from "./components/AvatarPanel";
import FeedbackPanel from "./components/FeedbackPanel";
import StatusIndicator from "./components/StatusIndicator";
import { SESSION_STATES } from "./constants/states";
import { tasks } from "./data/tasks";
import { analyseSpeech, processDialogueTurn } from "./services/api";

const DEFAULT_SCENARIO = "success";

function App() {
  const avatarRef = useRef(null);
  const [sessionState, setSessionState] = useState(SESSION_STATES.WELCOME);
  const [taskIndex, setTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [mockScenario, setMockScenario] = useState(DEFAULT_SCENARIO);
  const [busy, setBusy] = useState(false);
  const [uiError, setUiError] = useState("");
  const [conversationState, setConversationState] = useState("idle");

  const currentTask = tasks[taskIndex];

  function speak(text) {
    avatarRef.current?.speak(text);
  }

  async function startPractice() {
    setBusy(true);
    setUiError("");
    try {
      await avatarRef.current?.startConversation();
      setFeedback(null);
      setSessionState(SESSION_STATES.INSTRUCTION);
    } catch (error) {
      setUiError(error.message ?? "The avatar session could not start.");
      setSessionState(SESSION_STATES.ERROR);
    } finally {
      setBusy(false);
    }
  }

  function hearTask() {
    speak(`Let's practise this phrase. Listen first: ${currentTask.prompt}`);
  }

  function beginAttempt() {
    setFeedback(null);
    setUiError("");
    setSessionState(SESSION_STATES.RECORDING);
    speak("Now it's your turn. Take your time when you're ready.");
  }

  async function analyseAttempt() {
    setBusy(true);
    setUiError("");
    setSessionState(SESSION_STATES.ANALYSING);

    try {
      const result = await analyseSpeech({
        taskId: currentTask.id,
        mockScenario,
      });
      setFeedback(result);
      speak(result.message);

      if (result.next_action === "next") {
        setSessionState(SESSION_STATES.FEEDBACK);
      } else if (result.next_action === "retry") {
        setSessionState(SESSION_STATES.RETRY);
      } else {
        setSessionState(SESSION_STATES.ERROR);
      }
    } catch (error) {
      const message = error.message ?? "The analysis service could not be reached.";
      setUiError(message);
      setSessionState(SESSION_STATES.ERROR);
      speak("I couldn't process that response right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function nextTask() {
    const nextIndex = (taskIndex + 1) % tasks.length;
    setTaskIndex(nextIndex);
    setFeedback(null);
    setMockScenario(DEFAULT_SCENARIO);
    setSessionState(SESSION_STATES.INSTRUCTION);
  }

  function retryTask() {
    setFeedback(null);
    setUiError("");
    setSessionState(SESSION_STATES.INSTRUCTION);
  }

  async function runDialogueIntent(childIntent) {
    setBusy(true);
    setUiError("");
    try {
      const result = await processDialogueTurn({
        taskId: currentTask.id,
        prompt: currentTask.prompt,
        childIntent,
        mockScenario,
      });

      const text = result.assistant_messages.join(" ");
      speak(text);

      if (result.next_action === "stop") {
        await avatarRef.current?.endConversation();
        setSessionState(SESSION_STATES.WELCOME);
        setFeedback(null);
      } else if (result.next_action === "next") {
        setFeedback({
          ...result,
          message: text,
          next_action: "next",
        });
        setSessionState(SESSION_STATES.FEEDBACK);
      } else if (result.next_action === "error") {
        setUiError(text);
        setSessionState(SESSION_STATES.ERROR);
      } else {
        setSessionState(SESSION_STATES.INSTRUCTION);
      }
    } catch (error) {
      setUiError(error.message ?? "Dialogue request failed.");
      setSessionState(SESSION_STATES.ERROR);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Honours research prototype</p>
          <h1>Avatar-Guided Speech Practice</h1>
        </div>
        <div className="prototype-badge">Non-clinical prototype</div>
      </header>

      <div className="layout">
        <section className="avatar-card" aria-label="Avatar presentation layer">
          <AvatarPanel
            ref={avatarRef}
            currentTask={currentTask}
            onConversationStateChange={setConversationState}
          />
        </section>

        <section className="practice-card">
          <StatusIndicator state={sessionState} />

          {sessionState === SESSION_STATES.WELCOME && (
            <>
              <h2>Welcome</h2>
              <p className="lead">Hi! I'm your practice guide. We'll practise a few short sentences together.</p>
              <p>You can take your time, ask to hear a sentence again, or stop whenever you want.</p>
              <button onClick={startPractice} disabled={busy}>
                {busy ? "Starting avatar…" : "Start practice"}
              </button>
            </>
          )}

          {sessionState === SESSION_STATES.INSTRUCTION && (
            <>
              <p className="eyebrow">Practice sentence {taskIndex + 1} of {tasks.length}</p>
              <h2>Let's practise this phrase</h2>
              <div className="prompt-card">“{currentTask.prompt}”</div>
              <p>Listen first if you'd like, then have a turn when you're ready.</p>
              {conversationState !== "connected" && <p className="muted">Connecting the live avatar…</p>}
              <div className="button-row">
                <button className="secondary" onClick={hearTask} disabled={conversationState !== "connected"}>Hear sentence</button>
                <button onClick={beginAttempt} disabled={conversationState !== "connected"}>I'm ready</button>
              </div>
            </>
          )}

          {sessionState === SESSION_STATES.RECORDING && (
            <>
              <p className="eyebrow">Practice attempt</p>
              <h2>Now it's your turn</h2>
              <div className="prompt-card">“{currentTask.prompt}”</div>
              <div className="listening-indicator"><span /> Listening through the live avatar session</div>
              <p className="muted">For this honours prototype, the downstream analysis result is simulated so the interface can be evaluated independently of the future ML detector.</p>
              <button onClick={analyseAttempt} disabled={busy}>Finish attempt &amp; analyse</button>
            </>
          )}

          {sessionState === SESSION_STATES.ANALYSING && (
            <div className="analysis-state">
              <div className="spinner" aria-hidden="true" />
              <h2>Analysing your response…</h2>
              <p>This prototype is applying the selected deterministic analysis scenario.</p>
            </div>
          )}

          {sessionState === SESSION_STATES.FEEDBACK && (
            <>
              <FeedbackPanel feedback={feedback} />
              <button onClick={nextTask}>Next task</button>
            </>
          )}

          {sessionState === SESSION_STATES.RETRY && (
            <>
              <FeedbackPanel feedback={feedback} />
              <div className="button-row">
                <button className="secondary" onClick={hearTask}>Hear sentence again</button>
                <button onClick={retryTask}>Try again</button>
                <button className="secondary" onClick={nextTask}>Next task</button>
              </div>
            </>
          )}

          {sessionState === SESSION_STATES.ERROR && (
            <div className="error-state">
              <p className="eyebrow">Recovery state</p>
              <h2>Something went wrong</h2>
              <p>{uiError || feedback?.message || "The prototype could not complete that step."}</p>
              <button onClick={retryTask}>Return to task</button>
            </div>
          )}

          <details className="research-controls">
            <summary>Research controls</summary>
            <p className="muted">These controls deliberately force branches so the prototype can be tested without the final ML model or direct end-user testing.</p>
            <label>
              Mock analysis scenario
              <select value={mockScenario} onChange={(event) => setMockScenario(event.target.value)}>
                <option value="success">No significant event</option>
                <option value="repetition">Repetition</option>
                <option value="prolongation">Prolongation</option>
                <option value="long_pause">Long pause</option>
                <option value="low_confidence">Low confidence</option>
                <option value="error">Backend error</option>
              </select>
            </label>
            <div className="intent-grid">
              <button className="secondary" onClick={() => runDialogueIntent("repeat_request")}>Child asks to repeat</button>
              <button className="secondary" onClick={() => runDialogueIntent("dont_know")}>Child says “I don't know”</button>
              <button className="secondary" onClick={() => runDialogueIntent("no_response")}>No response</button>
              <button className="secondary" onClick={() => runDialogueIntent("stop")}>Child wants to stop</button>
            </div>
          </details>

          <p className="disclaimer">
            Research prototype only. The system does not diagnose stuttering or replace a speech pathologist. Dialogue and feedback require expert review before end-user testing.
          </p>
        </section>
      </div>

      <footer className="prototype-footer">
        Avatar: Tavus CVI embed · Analysis: deterministic mock service · Conversation state: {conversationState}
      </footer>
    </div>
  );
}

export default App;
