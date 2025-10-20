const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

export async function generateReply(prompt) {
  const res = await fetch(`${BASE}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  // server returns: { message: { role: "assistant", content: "..." } }
  return data?.message?.content ?? "";
}
