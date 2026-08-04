import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";
import { buildEvidenceContext, buildSystemInstruction } from "../lib/kistBrain.js";
import { askGemini } from "../lib/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireAuth(req, res, supabase))) return;

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
