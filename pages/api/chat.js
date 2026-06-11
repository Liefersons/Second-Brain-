export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Ungültige Anfrage" });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({ error: "GEMINI_KEY fehlt in Vercel." });
  }

  try {
    const contents = messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    if (contents.length === 0) {
      return res.status(400).json({ error: "Keine Nachricht" });
    }

    const requestBody = {
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
    };

    if (system && system.trim()) {
      requestBody.systemInstruction = { parts: [{ text: system }] };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Gemini API Fehler." });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "Keine Antwort von Gemini." });
    }

    return res.json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server Fehler" });
  }
}
