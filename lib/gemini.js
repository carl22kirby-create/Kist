// Gemini API client — a thin wrapper around the documented generateContent
// REST endpoint. This has NOT been tested against a live Gemini API key:
// this sandbox has no network access to Google's API and no key was ever
// provided. The request/response shape below matches Gemini's documented
// API as of this codebase's knowledge, but model names and API details do
// shift over time — if this breaks, checking https://ai.google.dev/gemini-api/docs
// against what's here is the first thing to try, not assuming the logic
// itself is wrong.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Forces Gemini to return JSON matching this exact shape, rather than
// hoping it follows a citation format described in prose — Gemini's
// controlled generation (responseSchema) is what makes the citations
// structurally reliable rather than best-effort text parsing.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    groundedInEvidence: { type: "boolean" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          concept: { type: "string" },
          score: { type: "number" },
          evidenceQuoted: { type: "string" }
        },
        required: ["concept", "evidenceQuoted"]
      }
    },
    insufficientEvidenceNote: { type: "string" }
  },
  required: ["answer", "groundedInEvidence", "citations"]
};

export async function askGemini(systemInstruction, userQuestion) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: userQuestion }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2
    }
  };

  // A hung request with no timeout would otherwise run until Vercel's own
  // function execution limit kills it, surfacing a generic, unhelpful
  // platform error rather than a clear one. A single retry on a 5xx
  // (Gemini's own transient failure, not a real problem with the request)
  // matters in practice for a consultant on a patchy mobile connection in
  // the field — a 4xx never gets retried, since that indicates something
  // genuinely wrong with the request itself, not a blip worth retrying.
  async function attempt() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  }

  let res;
  try {
    res = await attempt();
    if (!res.ok && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 800));
      res = await attempt();
    }
  } catch (err) {
    if (err.name === "AbortError") throw new Error("KIST Brain took too long to respond (over 20 seconds) — try again, or ask a more specific question.");
    throw err;
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Gemini API request failed (${res.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Gemini returned no usable content — the response shape may not match what this code expects.");
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("Gemini's response could not be parsed as the expected JSON shape.");
  }
}
