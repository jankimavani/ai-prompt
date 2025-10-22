import { useEffect, useRef, useState } from "react";
import { generateReply } from "./api";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([]); // { role: "user"|"assistant", content: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // auto-scroll to the latest message
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    const q = prompt.trim();
    if (!q || loading) return;

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
    <div className="site">
      {/* Header */}
      <header className="siteHeader">
        <div className="brand">AI Prompt</div>
      </header>

      {/* Main content */}
      <main className="siteMain">
        {history.length === 0 ? (
          // Hero state (centered prompt on a clean page)
          <section className="hero">
            <h1 className="heroTitle">Ask anything</h1>
            <p className="heroSubtitle">
              Type a prompt and hit Send to get an instant AI reply.
            </p>

            <form
              onSubmit={onSubmit}
              className="heroForm"
              aria-label="prompt form"
            >
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Summarize the benefits of TypeScript in 3 bullet points"
                className="heroInput"
                aria-label="Prompt"
              />
              <button
                className={`heroBtn ${loading ? "is-loading" : ""}`}
                disabled={loading || !prompt.trim()}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Sending…</span>
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </form>

            {error && <div className="error">{error}</div>}
          </section>
        ) : (
          // Chat state (history + bottom input)
          <>
            <section className="chat" ref={listRef} aria-live="polite">
              {history.map((m, i) => (
                <div
                  key={i}
                  className={`bubble ${
                    m.role === "user" ? "bubbleUser" : "bubbleAI"
                  }`}
                >
                  <span className="bubbleRole">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                  <div className="bubbleText">{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="bubble bubbleAI skeleton">
                  <div className="skeletonLine" />
                  <div className="skeletonLine short" />
                </div>
              )}
            </section>

            <form onSubmit={onSubmit} className="dock" aria-label="prompt form">
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your next prompt…"
                className="dockInput"
                aria-label="Prompt"
              />
              <button
                className={`dockBtn ${loading ? "is-loading" : ""}`}
                disabled={loading || !prompt.trim()}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Sending…</span>
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </form>

            {error && <div className="error floatingError">{error}</div>}
          </>
        )}
      </main>

      {/* Footer (optional) */}
      <footer className="siteFooter">
        <span>© {new Date().getFullYear()} AI Prompt</span>
      </footer>
    </div>
  );
}
