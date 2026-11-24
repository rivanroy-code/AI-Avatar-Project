import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "@tavus/embed";
import { TavusIntegration } from "@tavus/embed";

const deploymentId = import.meta.env.VITE_TAVUS_DEPLOYMENT_ID;

const AvatarPanel = forwardRef(function AvatarPanel(
  { currentTask, onConversationStateChange },
  ref,
) {
  const integrationRef = useRef(null);
  const [embedReady, setEmbedReady] = useState(false);
  const [conversationState, setConversationState] = useState("idle");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (!deploymentId) return undefined;

    const integration = new TavusIntegration("tavus-embed");
    integrationRef.current = integration;

    const onReady = () => setEmbedReady(true);
    const onStateChange = (event) => {
      const state = event.detail.state;
      setConversationState(state);
      onConversationStateChange?.(state);
    };
    const onError = (event) => {
      setAvatarError(event.detail?.message ?? "The avatar session could not start.");
    };

    integration.on("tavus:ready", onReady);
    integration.on("tavus:state-change", onStateChange);
    integration.on("tavus:error", onError);

    return () => {
      integration.off("tavus:ready", onReady);
      integration.off("tavus:state-change", onStateChange);
      integration.off("tavus:error", onError);
    };
  }, [onConversationStateChange]);

  useImperativeHandle(ref, () => ({
    async startConversation() {
      if (!integrationRef.current) {
        throw new Error("Tavus is not ready yet.");
      }
      setAvatarError("");
      return integrationRef.current.startConversation();
    },

    async endConversation() {
      return integrationRef.current?.endConversation();
    },

    speak(text) {
      if (!text || !integrationRef.current || conversationState !== "connected") return;
      integrationRef.current.sendMessage({
        event_type: "conversation.echo",
        properties: { text },
      });
    },
  }), [conversationState]);

  if (!deploymentId) {
    return (
      <div className="avatar-config-missing">
        <strong>Tavus deployment not configured.</strong>
        <span>Copy frontend/.env.example to frontend/.env and add your deployment ID.</span>
      </div>
    );
  }

  const context = currentTask
    ? `This is a university research prototype for guided speech practice. The current phrase is: "${currentTask.prompt}". The web application controls tasks, analysis, retries and feedback. Be calm, concise, supportive and non-diagnostic. Do not claim to be a clinician or invent analysis results.`
    : "This is a university research prototype for guided speech practice. Be calm, concise, supportive and non-diagnostic. The web application controls analysis and feedback.";

  return (
    <div className="avatar-embed-shell">
      <tavus-embed
        deployment-id={deploymentId}
        custom-greeting="Hi! I'm here to guide a short speech practice activity. You can take your time."
        conversational-context={context}
      />
      <div className="avatar-meta">
        <span className={`connection-dot ${conversationState === "connected" ? "connected" : ""}`} />
        {conversationState === "connected"
          ? "Avatar connected"
          : embedReady
            ? "Avatar ready"
            : "Loading avatar"}
      </div>
      {avatarError && <p className="notice">{avatarError}</p>}
    </div>
  );
});

export default AvatarPanel;
