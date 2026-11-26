import {
  useEffect,
  useRef,
  useState,
} from "react";

import AvatarPanel
  from "../components/AvatarPanel";

import {
  SESSION_STATES,
} from "../constants/states";

import {
  tasks,
} from "../data/tasks";

import {
  analyseSpeech,
} from "../services/api";

import {
  speakWithAvatar,
  startAvatarConversation,
  endAvatarConversation,
} from "../services/tavus";


export default function PracticeSession() {

  const tavusRef =
    useRef(null);


  const [
    sessionState,
    setSessionState,
  ] = useState(
    SESSION_STATES.WELCOME
  );


  const [
    avatarConnected,
    setAvatarConnected,
  ] = useState(false);


  const [
    taskIndex,
    setTaskIndex,
  ] = useState(0);


  const [
    feedback,
    setFeedback,
  ] = useState(null);


  const [
    capturedSpeech,
    setCapturedSpeech,
  ] = useState("");


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    attemptCounts,
    setAttemptCounts,
  ] = useState({});


  const currentTask =
    tasks[taskIndex];


  function speak(text) {
    speakWithAvatar(
      tavusRef.current,
      text
    );
  }


  function getDemoScenario(taskId) {

    const attemptCount =
      attemptCounts[taskId] ?? 0;


    /*
     * Any retry attempt succeeds.
     *
     * This keeps the demo flow
     * deterministic and allows the
     * user to progress.
     */
    if (attemptCount > 0) {
      return "success";
    }


    /*
     * First attempt result for each
     * task.
     */
    const scenarios = {
      phrase_001: "success",
      phrase_002: "repetition",
      phrase_003: "low_confidence",
    };


    return (
      scenarios[taskId] ??
      "success"
    );
  }


  function getDemoScenario(taskId) {

    const attemptCount =
        attemptCounts[taskId] ?? 0;


    if (attemptCount > 0) {
        return "success";
    }


    const scenarios = {
        phrase_001: "success",
        phrase_002: "repetition",
        phrase_003: "low_confidence",
    };


    return (
        scenarios[taskId] ??
        "success"
    );
    }


  async function handleStartPractice() {

    try {

      if (!avatarConnected) {

        await startAvatarConversation(
          tavusRef.current
        );

        setAvatarConnected(true);
      }


      setFeedback(null);

      setSessionState(
        SESSION_STATES.INSTRUCTION
      );


      setTimeout(() => {

        speak(
          `Let's practise this phrase. Listen first: ${currentTask.prompt}`
        );

      }, 500);

    } catch (error) {

      console.error(
        "Could not start Tavus:",
        error
      );


      setFeedback({
        message:
          "The avatar could not be started. Please try again.",
      });


      setSessionState(
        SESSION_STATES.ERROR
      );
    }
  }


  function handleStartRecording() {

    setFeedback(null);

    setCapturedSpeech("");


    setSessionState(
      SESSION_STATES.RECORDING
    );


    speak(
      `Now it's your turn. Say: ${currentTask.prompt}`
    );
  }


  async function handleFinishAttempt() {

    if (
      sessionState !==
      SESSION_STATES.RECORDING
    ) {
      console.warn(
        "Analysis ignored because the application was not recording."
      );

      return;
    }


    if (isSubmitting) {
      return;
    }


    setIsSubmitting(true);


    setSessionState(
      SESSION_STATES.ANALYSING
    );


    speak(
      "Thanks. I'm checking that response now."
    );


    try {

      const scenarioToUse =
        getDemoScenario(
            currentTask.id
        );


        const result =
        await analyseSpeech({

            taskId:
            currentTask.id,

            mockScenario:
            scenarioToUse,
        });


      /*
       * Record that an attempt was
       * completed for this task.
       *
       * This means a retry will use
       * the success scenario when
       * Demo sequence is selected.
       */
      setAttemptCounts(
        (previous) => ({
          ...previous,

          [currentTask.id]:
            (
              previous[
                currentTask.id
              ] ?? 0
            ) + 1,
        })
      );


      setFeedback(result);


      if (
        result.next_action ===
        "retry"
      ) {

        setSessionState(
          SESSION_STATES.RETRY
        );

      } else if (
        result.next_action ===
        "error"
      ) {

        setSessionState(
          SESSION_STATES.ERROR
        );

      } else {

        setSessionState(
          SESSION_STATES.FEEDBACK
        );
      }


      speak(
        result.message
      );

    } catch (error) {

      console.error(
        "Analysis failed:",
        error
      );


      const message =
        "Something went wrong while checking that response. Please try again.";


      setFeedback({
        message,
      });


      setSessionState(
        SESSION_STATES.ERROR
      );


      speak(message);

    } finally {

      setIsSubmitting(false);
    }
  }


  function handleRetry() {

    setFeedback(null);

    setCapturedSpeech("");


    setSessionState(
      SESSION_STATES.INSTRUCTION
    );


    speak(
      `Let's try that phrase again. Listen first: ${currentTask.prompt}`
    );
  }


  function handleNextTask() {

    const nextIndex =
      taskIndex + 1;


    if (
      nextIndex >=
      tasks.length
    ) {

      setSessionState(
        SESSION_STATES.COMPLETE
      );


      speak(
        "Thanks for practising with me today. You've finished all of the sentences."
      );

      return;
    }


    setTaskIndex(
      nextIndex
    );


    setFeedback(null);

    setCapturedSpeech("");


    setSessionState(
      SESSION_STATES.INSTRUCTION
    );


    const nextTask =
      tasks[nextIndex];


    speak(
      `Let's try another one. Listen first: ${nextTask.prompt}`
    );
  }


  async function handleStopSession() {

    setSessionState(
      SESSION_STATES.COMPLETE
    );


    speak(
      "That's okay. Thanks for practising with me today."
    );


    setTimeout(() => {

      endAvatarConversation(
        tavusRef.current
      );

      setAvatarConnected(false);

    }, 2500);
  }


  useEffect(() => {

    const tavusElement =
      tavusRef.current;


    if (!tavusElement) {
      return;
    }


    function handleProtocolMessage(
      event
    ) {

      const detail =
        event.detail;


      if (!detail) {
        return;
      }


      const {
        event_type,
        properties,
      } = detail;


      if (
        event_type !==
        "conversation.utterance"
      ) {
        return;
      }


      if (
        properties?.role !==
        "user"
      ) {
        return;
      }


      if (
        typeof properties?.final ===
        "boolean"
      ) {
        return;
      }


      if (
        sessionState !==
        SESSION_STATES.RECORDING
      ) {

        console.log(
          "Speech ignored outside recording state:",
          properties?.speech
        );

        return;
      }


      if (
        !properties?.speech
      ) {
        return;
      }


      setCapturedSpeech(
        properties.speech
      );


      console.log(
        "Captured exercise speech:",
        properties.speech
      );
    }


    tavusElement.addEventListener(
      "tavus:protocol-message",
      handleProtocolMessage
    );


    return () => {

      tavusElement.removeEventListener(
        "tavus:protocol-message",
        handleProtocolMessage
      );
    };

  }, [sessionState]);


  return (

    <main className="practice-page">


      <header className="page-header">

        <div>

          <p className="eyebrow">
            HONOURS RESEARCH PROTOTYPE
          </p>

          <h1>
            Avatar-Guided Speech Practice
          </h1>

        </div>


        <span className="prototype-badge">
          Non-clinical prototype
        </span>

      </header>


      <section className="practice-layout">


        <AvatarPanel
          ref={tavusRef}

          sessionState={
            sessionState
          }

          avatarConnected={
            avatarConnected
          }
        />


        <section className="practice-card">


          <div className="status-pill">

            Status:{" "}

            {sessionState}

          </div>


          {sessionState ===
            SESSION_STATES.WELCOME && (

            <>

              <h2>
                Welcome
              </h2>


              <p>
                Hi! I'm your practice
                guide. We'll practise a
                few short sentences
                together.
              </p>


              <p>
                You can take your time,
                ask to hear a sentence
                again, or stop whenever
                you want.
              </p>


              <button
                onClick={
                  handleStartPractice
                }
              >
                Start practice
              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.INSTRUCTION && (

            <>

              <h2>
                Let's practise this phrase
              </h2>


              <div className="phrase-card">

                “{currentTask.prompt}”

              </div>


              <p>
                Listen first, then you can
                have a turn.
              </p>


              <button
                onClick={
                  handleStartRecording
                }
              >
                I'm ready
              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.RECORDING && (

            <>

              <h2>
                Now it's your turn
              </h2>


              <p>
                Say:
              </p>


              <div className="phrase-card">

                “{currentTask.prompt}”

              </div>


              <div className="listening-indicator">

                Listening...

              </div>


              {capturedSpeech && (

                <p
                  style={{
                    color: "#65758c",
                    fontSize: "0.9rem",
                  }}
                >

                  Speech detected.

                </p>

              )}


              <button
                className="danger-button"

                onClick={
                  handleFinishAttempt
                }

                disabled={
                  isSubmitting
                }
              >

                {isSubmitting
                  ? "Analysing..."
                  : "Done speaking"}

              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.ANALYSING && (

            <>

              <h2>
                Analysing your response
              </h2>


              <div className="spinner" />


              <p>
                This usually takes a few
                seconds.
              </p>

            </>

          )}


          {sessionState ===
            SESSION_STATES.FEEDBACK && (

            <>

              <h2>
                Practice complete
              </h2>


              <p>
                {feedback?.message}
              </p>


              <button
                onClick={
                  handleNextTask
                }
              >
                Next task
              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.RETRY && (

            <>

              <h2>
                Let's have another go
              </h2>


              <p>
                {feedback?.message}
              </p>


              <button
                onClick={
                  handleRetry
                }
              >
                Try again
              </button>


              <button
                className="secondary-button"

                onClick={
                  handleNextTask
                }
              >
                Next task
              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.ERROR && (

            <>

              <h2>
                Something went wrong
              </h2>


              <p>
                {feedback?.message ??
                  "Please try again."}
              </p>


              <button
                onClick={
                  handleRetry
                }
              >
                Try again
              </button>

            </>

          )}


          {sessionState ===
            SESSION_STATES.COMPLETE && (

            <>

              <h2>
                Finished
              </h2>


              <p>
                Thanks for practising
                with me today.
              </p>

            </>

          )}


          <div className="session-actions">

        {sessionState !==
            SESSION_STATES.COMPLETE && (

            <button
            className="secondary-button"
            onClick={
                handleStopSession
            }
            >
            Stop session
            </button>

        )}

        </div>

        </section>

      </section>


      <footer className="prototype-footer">

        Research prototype only.
        The system does not diagnose
        stuttering or replace a speech
        pathologist.

      </footer>

    </main>
  );
}