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

// Consultant Guidance schema and prompt — a deliberately different kind
// of AI use from the evidence-grounded Q&A above. This isn't answering a
// question about a specific client's evidence; it's generating general
// assessment methodology for a specific BPI, in the exact shape the 27
// hand-written Knowledge Base concepts already use (ifClientSays,
// lookFor, warningSigns, typicalEvidence, commonExcuses, bestPractice,
// probingQuestions). Result is cached once per BPI and reused for every
// future client — the guidance for "how a business defines what makes it
// different from competitors" doesn't change from client to client, so
// generating it more than once would be pure waste.
export const GUIDANCE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    ifClientSays: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { says: { type: "STRING" }, meansCheckFor: { type: "STRING" } }, required: ["says", "meansCheckFor"] }
    },
    lookFor: { type: "ARRAY", items: { type: "STRING" } },
    warningSigns: { type: "ARRAY", items: { type: "STRING" } },
    typicalEvidence: { type: "ARRAY", items: { type: "STRING" } },
    commonExcuses: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { excuse: { type: "STRING" }, probe: { type: "STRING" } }, required: ["excuse", "probe"] }
    },
    bestPractice: { type: "STRING" },
    probingQuestions: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: ["ifClientSays", "lookFor", "warningSigns", "typicalEvidence", "commonExcuses", "bestPractice", "probingQuestions"]
};

export function buildGuidancePrompt(item) {
  return `You are writing consultant guidance for a business performance assessment tool called KIST One, used by an experienced business consultant during real client visits.

You are generating guidance for exactly ONE assessment indicator (a "BPI"), described below. This guidance is general methodology — it applies to any business being assessed on this indicator, not a specific client. Do not reference any specific company, industry, or invented example as if it were real.

BPI category: ${item.category}
BPI concept: ${item.concept}
Question asked: ${item.question}
Evidence type: ${item.evidenceType}

Write guidance in the exact structure requested, matching the tone and specificity of an experienced consultant briefing a colleague before a client visit — concrete, skeptical of unverified claims, and focused on what separates a real answer from a plausible-sounding one:

- ifClientSays: 2-3 realistic things a client might say in response to this question, each paired with what a consultant should actually check before accepting it at face value.
- lookFor: 2-4 concrete things to look for as evidence this is genuinely in place, not just claimed.
- warningSigns: 2-3 signs that suggest this area is weaker than the client is presenting it as.
- typicalEvidence: 2-3 examples of what real, checkable evidence for this looks like in practice.
- commonExcuses: 1-2 excuses a client might give for not having this in place, each paired with a follow-up probe.
- bestPractice: one or two sentences describing what strong practice on this specific indicator looks like.
- probingQuestions: 2 specific follow-up questions a consultant could ask to get past a surface-level answer.

Ground every part of this in how an experienced consultant would actually think about this specific indicator — not generic advice that could apply to any question.`;
}

// "Suggest Related Answers" — the consultant has just written notes or
// evidence against one question, and this checks whether that same text
// already, genuinely answers other unanswered questions in the same
// category, so nothing has to be typed twice and nothing gets missed.
// This NEVER writes a score directly. It only ever proposes one, with the
// specific reasoning shown, for the consultant to accept or dismiss —
// the same "extract, then confirm" pattern used everywhere else evidence
// gets turned into a number in this app. A suggestion is only valid if
// the notes clearly and directly speak to that specific question; a
// vague or tangential connection must be left out rather than guessed at.
export const SUGGESTION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    suggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          questionId: { type: "NUMBER" },
          suggestedScore: { type: "NUMBER" },
          justification: { type: "STRING" }
        },
        required: ["questionId", "suggestedScore", "justification"]
      }
    }
  },
  required: ["suggestions"]
};

export function buildSuggestionPrompt({ sourceConcept, sourceNotes, sourceEvidence, candidateQuestions }) {
  return `You are reviewing notes a business consultant just wrote while assessing one specific indicator, checking whether that same text also already answers OTHER, currently unanswered indicators in the same category — so the consultant doesn't have to type the same evidence twice.

NOTES JUST WRITTEN, for the indicator "${sourceConcept}":
Observation notes: ${sourceNotes || "(none written)"}
Evidence reviewed: ${sourceEvidence || "(none written)"}

OTHER UNANSWERED INDICATORS IN THE SAME CATEGORY, each with its id, concept and question:
${JSON.stringify(candidateQuestions, null, 2)}

For each candidate indicator, only include it in your response if the notes above CLEARLY AND DIRECTLY provide genuine evidence for a score on that specific indicator — not just a loose thematic connection. A score of 1 (little to no evidence of good practice) through 5 (best practice, well evidenced) should follow the same standard a consultant would apply directly: evidence must outweigh opinion, and a claim alone without something checkable behind it should score low, not high.

If the notes don't clearly speak to a candidate indicator at all, leave it out of your response entirely — do not force a low-confidence guess just to have something to say about every candidate. It is correct and expected for this to return few or even zero suggestions if the notes are genuinely narrow in scope.

For every suggestion you do include, the justification must quote or closely paraphrase the specific part of the notes it's based on, so the consultant can see exactly why before accepting it.`;
}

// Draft Improvement Plan — takes what's already been recorded for a
// scored BPI (the score, the notes, ideally the client's own words) and
// drafts a starting improvement plan grounded in what was actually said,
// rather than a generic template repeated for every low score regardless
// of context. This pre-fills editable text fields directly rather than
// requiring a separate accept step per field, since every field remains
// fully editable afterward and there's no discrete claim being committed
// the way a BPI score is — the consultant is expected to review and
// refine a draft, the same as they would a colleague's first pass.
export const IMPROVEMENT_PLAN_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    required: { type: "STRING" },
    expectedOutcome: { type: "STRING" },
    recommendedActions: { type: "STRING" },
    businessImpact: { type: "STRING" },
    successMeasure: { type: "STRING" },
    consultantRecommendation: { type: "STRING" },
    suggestedPriority: { type: "STRING" }
  },
  required: ["required", "expectedOutcome", "recommendedActions", "businessImpact", "successMeasure", "consultantRecommendation", "suggestedPriority"]
};

export function buildImprovementPlanPrompt({ concept, question, category, score, notes, evidence }) {
  return `You are drafting a starting improvement plan for a business consultant to review and refine, for one specific indicator scored during a client assessment.

BPI category: ${category}
BPI concept: ${concept}
Question asked: ${question}
Score given: ${score} out of 5
What the client said or what was observed: ${notes || "(no notes recorded)"}
Evidence reviewed: ${evidence || "(none recorded)"}

Ground the plan specifically in what the client actually said above — if they expressed genuine uncertainty (for example, not knowing how to answer, or admitting something isn't in place), the plan should address that specific gap directly, not a generic version of the topic. Do not invent detail about the client's business beyond what's stated above.

Write:
- required: one sentence describing the specific gap that needs closing, based on what was actually said.
- expectedOutcome: what should be true once this is addressed.
- recommendedActions: 1-3 concrete, specific next steps — not generic advice like "improve communication", but actual actions (e.g. "run a short workshop with the leadership team to agree the business's core point of difference, then draft one sentence describing it for use in every piece of customer-facing material").
- businessImpact: one or two sentences on the commercial cost of leaving this unaddressed, grounded in the category and what was said — do not invent a specific number unless one was actually mentioned in the notes.
- successMeasure: one concrete, checkable way to know this has genuinely improved next time it's assessed.
- consultantRecommendation: one or two sentences a consultant would actually say to the client about this, in plain language.
- suggestedPriority: exactly one of "High", "Medium" or "Low", based on the score and how central this indicator is to the category.`;
}
