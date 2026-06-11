export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }

  const { messages, system } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Ungültige Anfrage" });
  }

  const GEMINI_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({
      error:
        "Gemini API Key fehlt in Vercel. Lege GEMINI_API_KEY, GOOGLE_API_KEY oder GEMINI_KEY als Environment Variable an.",
    });
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = configuredModel.startsWith("models/")
    ? configuredModel.replace("models/", "")
    : configuredModel;

  try {
    const contents = messages
      .filter((m) => m?.content && String(m.content).trim())
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content) }],
      }));

    if (contents.length === 0) {
      return res.status(400).json({ error: "Keine Nachricht" });
    }

    const requestBody = {
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
    };

    if (system && String(system).trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: String(system) }],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_KEY,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let geminiMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        geminiMessage = errorJson?.error?.message || errorText;
      } catch (_) {}

      return res.status(response.status || 500).json({
        error: `Gemini API Fehler: ${geminiMessage || response.statusText}`,
        status: response.status,
        model,
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!text) {
      const reason =
        data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;

      return res.status(500).json({
        error: reason
          ? `Keine Antwort von Gemini. Grund: ${reason}`
          : "Keine Antwort von Gemini.",
        model,
      });
    }

    return res.json({ text });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Server Fehler",
      model,
    });
  }
}