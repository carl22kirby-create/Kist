import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";
import { buildEvidenceContext, buildSystemInstruction, buildGuidancePrompt, GUIDANCE_RESPONSE_SCHEMA, buildSuggestionPrompt, SUGGESTION_RESPONSE_SCHEMA } from "../lib/kistBrain.js";
import { askGemini } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireAuth(req, res, supabase))) return;

  // ---- Suggest related answers from notes already written ----
  // Every suggestion is proposed only, never committed — the frontend is
  // responsible for requiring an explicit accept per item.
  if (req.body?.mode === "suggest-related") {
    const { sourceConcept, sourceNotes, sourceEvidence, candidateQuestions } = req.body;
    if (!sourceConcept || !Array.isArray(candidateQuestions)) {
      return res.status(400).json({ error: "sourceConcept and candidateQuestions are required" });
    }
    if (candidateQuestions.length === 0) {
      return res.status(200).json({ suggestions: [] });
    }
    if (!sourceNotes?.trim() && !sourceEvidence?.trim()) {
      return res.status(200).json({ suggestions: [] });
    }

    try {
      const prompt = buildSuggestionPrompt({ sourceConcept, sourceNotes, sourceEvidence, candidateQuestions });
      const result = await askGemini(prompt, "Return the suggestions now, in the exact structure requested.", SUGGESTION_RESPONSE_SCHEMA);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  // ---- Consultant guidance generation, for a specific BPI ----
  // A different mode from the default evidence Q&A below: this generates
  // general assessment methodology for one question, cached forever once
  // generated, rather than an evidence-grounded answer about one client.
  if (req.body?.mode === "guidance") {
    const { questionId, category, concept, question, evidenceType } = req.body;
    if (!questionId || !concept || !question) {
      return res.status(400).json({ error: "questionId, concept and question are required" });
    }

    const { data: cached, error: cacheError } = await supabase.rpc("get_question_guidance", { p_id: questionId });
    if (cacheError) return res.status(500).json({ error: cacheError.message });
    if (cached) return res.status(200).json({ guidance: cached, source: "cached" });

    try {
      const prompt = buildGuidancePrompt({ category, concept, question, evidenceType });
      const generated = await askGemini(prompt, "Generate the guidance now, in the exact structure requested.", GUIDANCE_RESPONSE_SCHEMA);
      const { data: saved, error: saveError } = await supabase.rpc("save_question_guidance", { p_id: questionId, p_guidance: generated });
      if (saveError) return res.status(500).json({ error: saveError.message });
      return res.status(200).json({ guidance: saved, source: "generated" });
    } catch (err) {
      return res.status(502).json({ error: err.message });
    }
  }

  const { question, clientId } = req.body || {};
  if (!question || !question.trim()) return res.status(400).json({ error: "A question is required" });
  if (!clientId) return res.status(400).json({ error: "clientId is required — KIST Brain answers about one client's evidence at a time" });

  const { data: rpcData, error: rpcError } = await supabase.rpc("get_full_data");
  if (rpcError) return res.status(500).json({ error: rpcError.message });

  const context = buildEvidenceContext(rpcData, clientId);
  if (!context) return res.status(404).json({ error: "Client not found" });
  if (context.evidenceItems.length === 0) {
    return res.status(200).json({
      answer: "There's no scored evidence for this client yet, so I have nothing to ground an answer in. Score some BPIs in the Assessment stage first.",
      groundedInEvidence: false,
      citations: [],
      insufficientEvidenceNote: "No scored BPIs exist for this client."
    });
  }

  try {
    const systemInstruction = buildSystemInstruction(context);
    const result = await askGemini(systemInstruction, question);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
