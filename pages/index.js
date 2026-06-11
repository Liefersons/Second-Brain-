import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey, ich bin Oracle. Was soll ich für dich tun?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const nextMessages = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          system:
            "Du bist Oracle, ein persönlicher Assistent. Antworte hilfreich, direkt und auf Deutsch.",
        }),
      });

      const data = await res.json();

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.text || data.error || "Keine Antwort erhalten.",
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Fehler: " + error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06070A",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "18px",
          borderBottom: "1px solid #222",
          fontSize: "22px",
          fontWeight: "700",
        }}
      >
        🔮 Oracle
        <div style={{ fontSize: "14px", color: "#888", fontWeight: "400" }}>
          Persönlicher Assistent
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: "18px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#2F80ED" : "#1C1C1F",
              padding: "12px 14px",
              borderRadius: "16px",
              maxWidth: "80%",
              whiteSpace: "pre-wrap",
              lineHeight: "1.4",
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#1C1C1F",
              padding: "12px 14px",
              borderRadius: "16px",
              color: "#aaa",
            }}
          >
            Oracle denkt...
          </div>
        )}
      </main>

      <footer
        style={{
          padding: "12px",
          borderTop: "1px solid #222",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Nachricht an Oracle..."
          style={{
            flex: 1,
            background: "#111",
            border: "1px solid #333",
            color: "white",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "16px",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#2F80ED",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "0 16px",
            fontSize: "18px",
            fontWeight: "700",
          }}
        >
          ↑
        </button>
      </footer>
    </div>
  );
}
