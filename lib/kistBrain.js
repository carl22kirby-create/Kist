import { getClientAssessment, reviewHypothesis, categoryScores, getClientScoreSummary } from "../src/utils/scoring.js";

// This is the retrieval half of "retrieval-augmented generation" — it
// decides what evidence Gemini is even allowed to see. Deliberately
// simple: every scored BPI for this client, with everything a consultant
// actually recorded against it. No embeddings, no semantic search — at the
// scale of one client's assessment (bounded by how many BPIs actually got
// scored, not the full 265), sending everything scored is more reliable
// than trying to guess relevance and risking leaving out the one thing
// that mattered. If the Knowledge Base grows to thousands of concepts
// across many clients, this would need real retrieval — it doesn't yet.
export function buildEvidenceContext(data, clientId) {
  const client = data.clients.find((c) => c.id === clientId);
  if (!client) return null;

  const answers = getClientAssessment(data, clientId);
  const scored = answers.filter((a) => a.score > 0);
  const catScores = categoryScores(answers);
  // Uses the exact same function every other screen in the app calls for
  // a client's score — never a separate calculation. Also means the model
  // gets the same Bronze/Silver/Gold/Platinum tier language a consultant
  // would actually use, not just a bare number with no context.
  const { overall, tier, hasAssessment } = getClientScoreSummary(data, clientId);
  const hypothesis = client.profile?.hypothesis;
  const hypothesisReview = reviewHypothesis(answers, hypothesis);

  const evidenceItems = scored.map((a) => ({
    concept: a.concept,
    category: a.category,
    score: a.score,
    maturity: a.scoringBands?.find((b) => b.score === a.score)?.maturity,
    notes: a.notes || null,
    evidence: a.evidence || null,
    justification: a.justification || null,
    professionalJudgement: a.professionalJudgement || null,
    commercialImpact: a.commercialImpact?.narrative || null,
    escalationFlags: a.escalationFlags?.length ? a.escalationFlags : null
  }));

  return {
    client: { name: client.name, industry: client.industry, objectives: client.profile?.objectives || [] },
    overallScore: hasAssessment ? overall : null,
    scoreTier: hasAssessment ? `${tier.tier} (${tier.label})` : null,
    categoryScores: catScores.filter((c) => c.answered > 0),
    hypothesis: hypothesis?.statement || null,
    hypothesisStatus: hypothesisReview?.status || null,
    evidenceItems
  };
}

// The grounding instruction. This is the entire point of "KIST Brain" over
// just calling a general model directly — it's told, explicitly and
// repeatedly, that it may only use what's in the evidence block, and must
// say so plainly when the evidence doesn't cover the question, rather than
// filling the gap with generic business advice that isn't actually about
// this client.
export function buildSystemInstruction(context) {
  return `You are KIST Brain, the evidence assistant for KIST One, a business consultancy platform.

You are answering questions about a SPECIFIC client, using ONLY the evidence provided below. This evidence comes from a real consultancy assessment — real scores, real notes, real evidence a consultant recorded.

STRICT RULES:
1. Only state something as fact if it is directly supported by an item in the evidence below. Never use general business knowledge, assumptions, or anything not present in this evidence to answer the question.
2. Every claim in your answer must be traceable to a specific concept in the evidence. List every concept you drew on in the citations array, with the score and the exact relevant text you're drawing from (quote the actual notes, evidence or justification field — do not paraphrase into a fabricated quote).
3. If the evidence provided does not contain enough to properly answer the question, set groundedInEvidence to false and explain what's missing in insufficientEvidenceNote. Do not guess or fill the gap with generic advice.
4. Never invent a number, statistic, or specific figure that isn't present in the evidence. If asked for a cost saving or business impact number, only give one if the estimationGuidance or commercial impact text in the evidence actually contains it — otherwise explain that this would need to be sized by the consultant using the evidence available.
5. Keep the answer concise and direct. A consultant is often reading this on a phone, sometimes standing in front of a client — lead with the actual answer in the first sentence, then support it. Do not pad with generic preamble or restate the question back.

EVIDENCE FOR THIS CLIENT:
${JSON.stringify(context, null, 2)}`;
}
