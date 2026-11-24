import "@tavus/embed";

const DEPLOYMENT_ID =
  "aaa677c4-88a7-425b-97b6-a97c3f9a211a";

export default function AvatarPanel({
  sessionState,
  feedback,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "460px",
      }}
    >
      <tavus-embed
        deployment-id={DEPLOYMENT_ID}
        custom-greeting="Hi! Are you ready to practise some sentences with me?"
        conversational-context="This is a university research prototype for guided speech practice. Be calm, supportive and concise. Do not diagnose stuttering, do not provide clinical advice, and do not claim to be a speech pathologist."
      />
    </div>
  );
}