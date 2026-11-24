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
}
