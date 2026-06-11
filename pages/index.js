import { useState, useRef, useEffect } from "react";

const AGENTS = [
  { id: "oracle", name: "Oracle", role: "Persoenlicher Assistent", emoji: "🔮", color: "#3B82F6",
    sys: "Du bist ein kluger persoenlicher Assistent. Hilf bei Alltag, Entscheidungen, Planung, Shopping. Direkt und ehrlich. Auf Deutsch." },
  { id: "builder", name: "Builder", role: "Business und Marketing", emoji: "🏗️", color: "#F97316",
    sys: "Du denkst wie Jeff Bezos und Alex Hormozi. Hilf bei Business, Marketing, Kundengewinnung. Zahlen und konkrete Schritte. Auf Deutsch." },
  { id: "innovator", name: "Innovator", role: "Ideen und Innovation", emoji: "⚡", color: "#EF4444",
    sys: "Du denkst wie Elon Musk und Steve Jobs. First Principles. Neue Geschaeftsideen, Nischen, kreative Loesungen. Auf Deutsch." },
  { id: "investor", name: "Investor", role: "Finanzen und Vermoegen", emoji: "💎", color: "#10B981",
    sys: "Du denkst wie Warren Buffett. Finanzplanung, Investieren, Vermoegensgaufbau. Allgemeine Finanzbildung. Auf Deutsch." },
  { id: "market", name: "Markt", role: "Trading und Boerse", emoji: "📊", color: "#34D399",
    sys: "Du bist Marktanalytiker wie Ray Dalio. Erklaere Maerkte, Aktien, Wirtschaftsereignisse. Allgemeine Bildung, keine Beratung. Auf Deutsch." },
  { id: "performer", name: "Performer", role: "Fitness und Mindset", emoji: "🔥", color: "#F43F5E",
    sys: "Du denkst wie David Goggins und Andrew Huberman. Keine Ausreden. Trainingsplaene, Ernaehrung, Energie. Auf Deutsch." },
  { id: "strategie", name: "Strategie", role: "Ziele und Lebensdesign", emoji: "🎯", color: "#8B5CF6",
    sys: "Du denkst wie Naval Ravikant und Marcus Aurelius. Ziele, Gewohnheiten, Produktivitaet, Lebensplanung. Kurz und tief. Auf Deutsch." },
  { id: "techmind", name: "TechMind", role: "KI und Automation", emoji: "🤖", color: "#06B6D4",
    sys: "Du bist KI-Experte. Erklaere KI-Tools, Automationen mit Make.com, n8n, Zapier, WhatsApp Business API. Praxisnah. Auf Deutsch." },
  { id: "advisor", name: "Advisor", role: "Shopping und Kaeufe", emoji: "⭐", color: "#F59E0B",
    sys: "Du bist unparteiischer Kaufberater. Empfehlungen fuer Autos, Elektronik, Geschenke. Pros und Cons. Konkrete Empfehlung. Auf Deutsch." },
];

async function chat(sys, messages) {
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: sys, messages: messages }),
    });
    const d = await r.json();
    if (d.text) return d.text;
    if (d.error) return d.error;
    return "Keine Antwort.";
  } catch (e) {
    return "Verbindungsfehler – bitte nochmal senden.";
  }
}

export default function Home() {
  const [agent, setAgent] = useState(AGENTS[0]);
  const [convos, setConvos] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const endRef = useRef(null);
  const taRef = useRef(null);

  const msgs = convos[agent.id] || [];

  useEffect(function() {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs, loading]);

  async function send(text) {
    const q = text ? text.trim() : input.trim();
    if (!q || loading) return;
    const userMsg = { role: "user", content: q };
    const newMsgs = msgs.concat([userMsg]);
    setConvos(function(p) { return Object.assign({}, p, { [agent.id]: newMsgs }); });
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setLoading(true);
    const reply = await chat(agent.sys, newMsgs);
    setConvos(function(p) {
      return Object.assign({}, p, { [agent.id]: newMsgs.concat([{ role: "assistant", content: reply }]) });
    });
    setLoading(false);
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const sidebarW = sidebar ? "220px" : "56px";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#06070A", color: "#F5F7FC", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>
      <style>{[
        "* { box-sizing: border-box; }",
        "::-webkit-scrollbar { width: 3px; }",
        "::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }",
        "@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }",
        "@keyframes dot { 0%,80%,100% { transform: scale(0.5); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }",
        ".msg { animation: fadeUp 0.2s ease; }",
      ].join(" ")}</style>

      <div style={{ width: sidebarW, minWidth: sidebarW, background: "rgba(18,20,28,0.9)", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", transition: "width 0.2s ease, min-width 0.2s ease", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "14px 11px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{ width: "34px", height: "34px", minWidth: "34px", background: "linear-gradient(135deg, #7C3AED, #3B82F6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🧠</div>
          {sidebar && <div><div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>SECOND BRAIN</div><div style={{ fontSize: "9px", color: "rgba(245,247,252,0.28)", marginTop: "1px" }}>{AGENTS.length} AGENTEN</div></div>}
        </div>

        <div style={{ flex: 1, padding: "6px 5px", overflowY: "auto" }}>
          {AGENTS.map(function(ag) {
            const active = agent.id === ag.id;
            const n = (convos[ag.id] || []).filter(function(m) { return m.role === "user"; }).length;
            return (
              <button key={ag.id} onClick={function() { setAgent(ag); }} style={{ width: "100%", padding: sidebar ? "7px 8px" : "7px 0", marginBottom: "1px", background: active ? ag.color + "22" : "transparent", border: "1px solid " + (active ? ag.color + "40" : "transparent"), borderRadius: "9px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", justifyContent: sidebar ? "flex-start" : "center", textAlign: "left" }}>
                <div style={{ width: "28px", height: "28px", minWidth: "28px", borderRadius: "8px", background: active ? ag.color + "30" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>{ag.emoji}</div>
                {sidebar && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 500, color: active ? ag.color : "rgba(245,247,252,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ag.name}</div>
                    <div style={{ fontSize: "9px", color: "rgba(245,247,252,0.28)" }}>{ag.role}</div>
                  </div>
                )}
                {sidebar && n > 0 && <div style={{ padding: "1px 5px", background: ag.color + "20", color: ag.color, borderRadius: "8px", fontSize: "8.5px", fontWeight: 700 }}>{n}</div>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "5px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={function() { setSidebar(function(s) { return !s; }); }} style={{ width: "100%", padding: "6px", background: "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: sidebar ? "flex-start" : "center", gap: "6px", color: "rgba(245,247,252,0.28)", fontSize: "10px" }}>
            <span>{sidebar ? "◀" : "▶"}</span>
            {sidebar && "Einklappen"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,20,28,0.9)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: agent.color + "20", border: "1.5px solid " + agent.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{agent.emoji}</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{agent.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: loading ? "#FB923C" : "#34D399" }}></div>
                <span style={{ fontSize: "9px", color: "rgba(245,247,252,0.28)" }}>{agent.role}</span>
              </div>
            </div>
          </div>
          <button onClick={function() { setConvos(function(p) { return Object.assign({}, p, { [agent.id]: [] }); }); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "7px", padding: "5px 11px", cursor: "pointer", fontSize: "10.5px", color: "rgba(245,247,252,0.28)" }}>Leeren</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {msgs.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "14px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "17px", background: agent.color + "18", border: "1.5px solid " + agent.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "27px" }}>{agent.emoji}</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "17px", fontWeight: 700, marginBottom: "5px" }}>{agent.name}</div>
                <div style={{ fontSize: "13px", color: "rgba(245,247,252,0.5)" }}>{agent.role}</div>
              </div>
            </div>
          ) : (
            msgs.map(function(msg, i) {
              return (
                <div key={i} className="msg" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "6px" }}>
                  {msg.role === "assistant" && <div style={{ width: "24px", height: "24px", minWidth: "24px", borderRadius: "7px", background: agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0 }}>{agent.emoji}</div>}
                  <div style={{ maxWidth: "76%", padding: "10px 13px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? agent.color : "rgba(255,255,255,0.07)", border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</div>
                </div>
              );
            })
          )}
          {loading && (
            <div className="msg" style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ width: "24px", height: "24px", minWidth: "24px", borderRadius: "7px", background: agent.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{agent.emoji}</div>
              <div style={{ padding: "11px 14px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "13px 13px 13px 4px", display: "flex", gap: "4px" }}>
                {[0, 1, 2].map(function(i) { return <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: agent.color, animation: "dot 1.2s ease " + (i * 0.17) + "s infinite" }}></div>; })}
              </div>
            </div>
          )}
          <div ref={endRef}></div>
        </div>

        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,20,28,0.9)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "7px", alignItems: "flex-end", background: "rgba(255,255,255,0.05)", border: "1.5px solid " + (input ? agent.color : "rgba(255,255,255,0.08)"), borderRadius: "13px", padding: "7px 7px 7px 13px" }}>
            <textarea ref={taRef} value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={onKey} placeholder={"Nachricht an " + agent.name + "..."} rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F5F7FC", fontSize: "14px", lineHeight: 1.5, resize: "none", maxHeight: "100px", padding: "2px 0" }} onInput={function(e) { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}></textarea>
            <button onClick={function() { send(); }} disabled={!input.trim() || loading} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", background: (input.trim() && !loading) ? agent.color : "rgba(255,255,255,0.08)", cursor: (input.trim() && !loading) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", color: "#fff", flexShrink: 0 }}>↑</button>
          </div>
          <div style={{ fontSize: "9px", color: "rgba(245,247,252,0.2)", marginTop: "5px", textAlign: "center" }}>Enter senden</div>
        </div>
      </div>
    </div>
  );
}
