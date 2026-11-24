import TavusAvatar from "./components/Avatar/TavusAvatar";

function App() {
  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Speech Practice Prototype</h1>

      <p>
        Research prototype — not a clinical diagnostic or treatment tool.
      </p>

      <TavusAvatar />
    </main>
  );
}

export default App;