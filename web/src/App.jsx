import { useState } from "react";
import { generateReply } from "./api";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]); // {role, content}[]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const q = prompt.trim();
    if (!q) return;
    setError(null);
    setLoading(true);
    setHistory((h) => [...h, { role: "user", content: q }]);
    setPrompt("");
    try {
      const reply = await generateReply(q);
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 16,
        fontFamily: "system-ui, Arial",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 16 }}>AI Prompt </h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />
        <button
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: 6 }}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#b00020", marginBottom: 8 }}>Error: {error}</div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {history.map((m, i) => (
          <div
            key={i}
            style={{ textAlign: m.role === "user" ? "right" : "left" }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #eee",
                background: m.role === "user" ? "#f5f5f5" : "#fff",
              }}
            >
              <strong>{m.role === "user" ? "You" : "AI"}: </strong>
              <span>{m.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
