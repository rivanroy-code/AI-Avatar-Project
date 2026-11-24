export function speakWithAvatar(
  tavusElement,
  text
) {
  if (!tavusElement || !text) {
    return;
  }

  try {
    tavusElement.sendMessage({
      event_type: "conversation.echo",

      properties: {
        text,
      },
    });
  } catch (error) {
    console.error(
      "Could not send Tavus speech:",
      error
    );
  }
}


export async function startAvatarConversation(
  tavusElement
) {
  if (!tavusElement) {
    throw new Error(
      "Tavus embed is not available."
    );
  }

  return tavusElement.startConversation();
}


export async function endAvatarConversation(
  tavusElement
) {
  if (!tavusElement) {
    return;
  }

  try {
    await tavusElement.endConversation();
  } catch (error) {
    console.error(
      "Could not end Tavus conversation:",
      error
    );
  }
}