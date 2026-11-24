import "@tavus/embed";

export default function TavusAvatar() {
  const deploymentId = "aaa677c4-88a7-425b-97b6-a97c3f9a211a";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        aspectRatio: "16 / 9",
      }}
    >
      <tavus-embed
        deployment-id={deploymentId}
        custom-greeting="Hi! Are you ready to practise some sentences with me?"
      />
    </div>
  );
}