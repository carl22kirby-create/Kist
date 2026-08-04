import { categories } from "../data/seedData.js";
import { buildAssessmentForClient } from "./assessmentEngine.js";

export function calculateOverall(answers) {
  const a = answers.filter((x) => x.score > 0);
  return a.length ? Math.round((a.reduce((s, x) => s + x.score, 0) / (a.length * 5)) * 100) : 0;
}

export function categoryScores(answers) {
  return categories.map((cat) => {
    const items = answers.filter((q) => q.category === cat);
    const scored = items.filter((q) => q.score > 0);
    return {
      category: cat,
      score: scored.length ? Math.round((scored.reduce((s, q) => s + q.score, 0) / (scored.length * 5)) * 100) : 0,
      answered: scored.length,
      total: items.length
    };
  });
}

// Assessment answers are stored per-client on data.assessments[clientId],
// keyed by question id. The actual set of questions a client sees comes
// from the dynamic engine (Universal + whichever Industry/Capability/
// Regulatory modules match their Business Profile), recomputed live each
// time rather than stored as a fixed snapshot. Any question the client has
// already been scored on keeps that answer even if their profile changes
// later; any newly-matching module question simply appears alongside it,
// unanswered, ready to be scored.
export function getClientAssessment(data, clientId) {
  const client = data.clients.find((c) => c.id === clientId);
  const profile = client?.profile || {};
  const current = buildAssessmentForClient(profile);
  const saved = (data.assessments && data.assessments[clientId]) || [];
  const savedById = new Map(saved.map((q) => [q.id, q]));
  return current.map((q) => savedById.get(q.id) || q);
}

// A score of 1-3 requires an Improvement Plan before the item counts as
// complete. A score of 4-5 needs no plan — the assessment is done for that
// item once a justification is given.
export function isImprovementPlanRequired(answer) {
  return answer.score > 0 && answer.score < 4;
}

const REQUIRED_PLAN_FIELDS = [
  "required", "expectedOutcome", "recommendedActions", "businessImpact",
  "owner", "targetDate", "reviewDate", "successMeasure", "consultantRecommendation"
];

export function isImprovementPlanComplete(answer) {
  const plan = answer.improvementPlan || {};
  return REQUIRED_PLAN_FIELDS.every((field) => (plan[field] || "").toString().trim() !== "");
}

// null = not yet assessed (neutral, not a problem). false = scored but
// missing a mandatory field. true = genuinely complete. This is a soft
// gate surfaced in the UI — it doesn't block moving between questions.
export function isItemComplete(answer) {
  if (!answer.score || answer.score === 0) return null;
  if (!answer.justification || !answer.justification.trim()) return false;
  if (!answer.professionalJudgement) return false;
  if (isImprovementPlanRequired(answer)) return isImprovementPlanComplete(answer);
  return true;
}

// Assessment Status — where a BPI sits in the workflow, inferred from what's
// actually been recorded rather than requiring the consultant to manually
// flag each stage. Reports the richest milestone reached; the stages
// aren't strictly sequential in practice (a pure interview item may be
// scored with no observation step at all), so this picks the furthest one
// that genuinely applies rather than insisting on a fixed order.
const STATUS_STAGES = [
  { icon: "✅", label: "Complete", check: (a) => isItemComplete(a) === true },
  { icon: "📋", label: "Improvement Plan Created", check: (a) => isImprovementPlanRequired(a) && isImprovementPlanComplete(a) },
  { icon: "⭐", label: "Scored", check: (a) => a.score > 0 },
  { icon: "💬", label: "Client Discussion Complete", check: (a) => !!(a.notes && a.notes.trim()) },
  { icon: "📄", label: "Evidence Reviewed", check: (a) => !!(a.evidence && a.evidence.trim()) || Object.values(a.evidenceChecklist || {}).some(Boolean) },
  {
    icon: "👀", label: "Observation Complete",
    check: (a) => {
      const n = a.observationNotes || {};
      return !!(n.positives?.trim() || n.concerns?.trim() || n.risks?.trim()) || Object.values(a.observationChecklist || {}).some(Boolean);
    }
  }
];

export function getAssessmentStatus(answer) {
  for (const stage of STATUS_STAGES) {
    if (stage.check(answer)) return { icon: stage.icon, label: stage.label };
  }
  return { icon: "⬜", label: "Not Started" };
}

// Traffic Light — a pure function of score, for fast visual navigation
// during a live visit.
export function getTrafficLight(answer) {
  if (!answer.score || answer.score === 0) return { icon: "⚫", label: "Not Assessed" };
  if (answer.score >= 4) return { icon: "🟢", label: "Strong" };
  if (answer.score === 3) return { icon: "🟡", label: "Opportunity" };
  if (answer.score === 2) return { icon: "🟠", label: "Weak" };
  return { icon: "🔴", label: "Critical" };
}

// Evidence Strength — a heuristic proxy for how much evidence backs a
// score, based on volume and completeness of what's recorded (checklist
// coverage, and whether evidence/justification fields have real content).
// This measures whether evidence was captured, not whether the evidence
// itself is actually good — that judgement still belongs to the
// consultant. Worth stating plainly rather than implying more than it is.
export function getEvidenceStrength(answer) {
  if (!answer.score || answer.score === 0) return null;
  let points = 0;
  const requiredCount = (answer.evidenceRequired || []).length;
  const checkedCount = Object.values(answer.evidenceChecklist || {}).filter(Boolean).length;
  if (requiredCount > 0) points += Math.min(2, Math.round((checkedCount / requiredCount) * 2));
  else if (answer.evidence?.trim()) points += 1;
  if (answer.evidence && answer.evidence.trim().length > 20) points += 1;
  if (answer.justification && answer.justification.trim().length > 20) points += 1;
  if (answer.consultantAssessment?.overall && answer.consultantAssessment.overall.trim().length > 15) points += 1;
  const stars = Math.max(1, Math.min(5, points || 1));
  const label = stars >= 5 ? "Excellent Evidence" : stars >= 3 ? "Moderate Evidence" : "Limited Evidence";
  return { stars, label };
}

// Cross References — a quiet suggestion, never automatic. Only surfaces
// for a genuinely low score (2 or below), pointing at concepts this one is
// known to relate to, and only for concepts that actually exist in this
// client's assembled assessment (a related concept excluded by a
// dependency, for instance, simply won't appear).
export function getCrossReferenceSuggestions(answer, allAnswers, threshold = 2) {
  if (!answer.score || answer.score > threshold) return [];
  const related = answer.relatedConcepts || [];
  if (related.length === 0) return [];
  return related
    .map((name) => allAnswers.find((a) => a.concept === name))
    .filter(Boolean)
    .map((a) => ({ concept: a.concept, id: a.id, currentlyScored: a.score > 0 }));
}

// Assessment Quality Score — not the Business Performance Score. This
// measures how complete and evidenced the assessment ITSELF is, so a
// consultant knows exactly what's outstanding before issuing a report.
export function computeAssessmentQuality(answers) {
  const total = answers.length;
  const completeItems = answers.filter((a) => isItemComplete(a) === true).length;
  const missingObservations = answers.filter((a) => {
    const n = a.observationNotes || {};
    const hasObservationContent = !!(n.positives?.trim() || n.concerns?.trim() || n.risks?.trim()) || Object.values(a.observationChecklist || {}).some(Boolean);
    return (a.observationPoints || []).length > 0 && !hasObservationContent;
  }).length;
  const missingEvidence = answers.filter((a) => {
    const hasEvidence = !!(a.evidence && a.evidence.trim()) || Object.values(a.evidenceChecklist || {}).some(Boolean);
    return (a.evidenceRequired || []).length > 0 && !hasEvidence;
  }).length;
  const incompletePlans = answers.filter((a) => isImprovementPlanRequired(a) && !isImprovementPlanComplete(a)).length;
  return {
    percentComplete: total ? Math.round((completeItems / total) * 100) : 0,
    totalItems: total, completeItems, missingObservations, missingEvidence, incompletePlans
  };
}

// Business Story Builder — a deliberately simple, deterministic keyword
// matcher, not language understanding. It suggests draft theme tags for a
// note so a report can eventually be built by theme rather than by
// re-reading every note by hand, but it WILL miss nuance and mistag
// figurative language — it's a starting draft for the consultant to
// confirm or correct, never an authoritative tag.
const STORY_THEME_KEYWORDS = {
  Leadership: ["leader", "leadership", "manager", "management", "decision"],
  People: ["staff", "employee", "team", "recruit", "hiring", "hire"],
  Culture: ["culture", "morale", "engagement", "attitude", "atmosphere"],
  Operations: ["process", "operation", "workflow", "procedure", "efficien"],
  Communication: ["communicat", "meeting", "briefing", "inform"],
  "Customer Experience": ["customer", "client", "guest", "complaint"],
  Finance: ["cost", "budget", "cash", "financ", "revenue", "profit", "margin"],
  Risk: ["risk", "compliance", "safety", "hazard", "incident"],
  Technology: ["system", "software", "website", "digital", "data"]
};

export function suggestStoryTags(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return Object.entries(STORY_THEME_KEYWORDS)
    .filter(([, words]) => words.some((w) => lower.includes(w)))
    .map(([tag]) => tag);
}

// Timeline — updates lastEditedAt (and startedAt, the first time) on every
// change, but only appends a history entry for a handful of genuinely
// significant events. Logging on every keystroke would make the history
// meaningless within minutes; logging only real milestones keeps it a
// readable record of how the item actually progressed.
export function touchTimeline(answer, event = null) {
  const now = new Date().toISOString();
  const timeline = answer.timeline || { startedAt: null, lastEditedAt: null, completedAt: null, reviewedBy: "", history: [] };
  const next = { ...timeline, lastEditedAt: now };
  if (!next.startedAt) next.startedAt = now;
  if (event) next.history = [...(next.history || []), { date: now, event }];
  return next;
}

export function assessmentCompletionSummary(answers) {
  const scored = answers.filter((a) => a.score > 0);
  const incompleteItems = scored.filter((a) => isItemComplete(a) === false);
  return { totalScored: scored.length, incompleteCount: incompleteItems.length, incompleteItems };
}

// Escalations — findings flagged serious enough to need senior attention
// immediately, independent of score. Surfaced on the Dashboard and in the
// client report so they're never buried among 265 ordinary findings.
export function getEscalations(answers) {
  return answers
    .filter((a) => (a.escalationFlags || []).length > 0)
    .map((a) => ({ id: a.id, concept: a.concept, category: a.category, flags: a.escalationFlags, score: a.score, notes: a.notes }));
}

// Objective Priority — how many of the client's stated Business Objectives
// a given BPI actually influences. This changes prioritisation and report
// framing only; it never changes which BPIs are included in the
// assessment (tags and dependencies still decide that entirely). A BPI
// with zero overlap is still assessed, just not what leads the story.
export function getObjectivePriority(item, selectedObjectives) {
  if (!selectedObjectives || selectedObjectives.length === 0) return 0;
  return (item.relevantObjectives || []).filter((o) => selectedObjectives.includes(o)).length;
}

export function sortByObjectivePriority(answers, selectedObjectives) {
  return [...answers].sort((a, b) => getObjectivePriority(b, selectedObjectives) - getObjectivePriority(a, selectedObjectives));
}

// The BPIs that most directly support what the client actually said they
// want, restricted to ones that have actually been scored — this is what
// leads the report, per the outcome-led philosophy: the score is evidence
// supporting the story, not the story itself.
export function getObjectiveFindings(answers, selectedObjectives, limit = 8) {
  if (!selectedObjectives || selectedObjectives.length === 0) return [];
  return answers
    .filter((a) => a.score > 0 && getObjectivePriority(a, selectedObjectives) > 0)
    .sort((a, b) => getObjectivePriority(b, selectedObjectives) - getObjectivePriority(a, selectedObjectives) || a.score - b.score)
    .slice(0, limit);
}

// Consultancy Hypothesis — the working theory of what's actually limiting
// the client's stated objectives, formed before evidence gathering begins
// and tested against it, rather than treating every BPI as equally likely
// to matter. A hypothesis names which concepts it's about; scoring those
// low CONFIRMS the theory (that area really is the limiting factor),
// scoring them well DISPROVES it (that area turns out to be fine, so
// whatever's actually limiting the client sits elsewhere).
export function reviewHypothesis(answers, hypothesis) {
  if (!hypothesis?.targetConcepts?.length) return null;
  const relevant = hypothesis.targetConcepts
    .map((name) => answers.find((a) => a.concept === name))
    .filter(Boolean);
  const scored = relevant.filter((a) => a.score > 0);
  if (scored.length === 0) {
    return { status: "Not Yet Tested", relevant, scored, averageScore: null };
  }
  const averageScore = Math.round((scored.reduce((s, a) => s + a.score, 0) / scored.length) * 10) / 10;
  // Classified by how many target concepts actually scored low versus well,
  // not a blended average — a 5 and a 2 averaging to 3.5 is genuinely
  // "partially supported" (one confirmed, one disproven), not "not
  // supported", which an average alone would have wrongly suggested.
  const lowCount = scored.filter((a) => a.score <= 2).length;
  const highCount = scored.filter((a) => a.score >= 4).length;
  let status;
  if (lowCount === scored.length) status = "Supported";
  else if (highCount === scored.length) status = "Not Supported";
  else status = "Partially Supported";
  return { status, relevant, scored, averageScore };
}

// Same as getEscalations but across every client, for the Dashboard —
// consultants need to see anything flagged serious regardless of which
// client's assessment it's sitting in.
export function getAllEscalations(data) {
  const results = [];
  for (const client of data.clients || []) {
    const answers = getClientAssessment(data, client.id);
    for (const escalation of getEscalations(answers)) {
      results.push({ ...escalation, clientId: client.id, clientName: client.name });
    }
  }
  return results;
}

// Every completed Improvement Plan automatically becomes a live Action —
// entered once, on the assessment item itself, rather than duplicated by
// hand into the Actions list. Re-saving is idempotent: this client's
// assessment-sourced actions are recomputed fresh from current plans each
// time, while manually created actions and every other client's actions
// are left untouched.
function syncActionsFromImprovementPlans(data, clientId, nextAnswers, clientName) {
  const prefix = `kb-action-${clientId}-`;
  const otherActions = (data.actions || []).filter((a) => !a.id.startsWith(prefix));
  const generatedActions = nextAnswers
    .filter((a) => isImprovementPlanRequired(a) && isImprovementPlanComplete(a))
    .map((a) => ({
      id: `${prefix}${a.id}`,
      clientId,
      client: clientName,
      title: a.improvementPlan.recommendedActions,
      owner: a.improvementPlan.owner,
      priority: a.improvementPlan.priority,
      status: a.improvementPlan.progressStatus || "Not Started",
      due: a.improvementPlan.targetDate,
      concept: a.concept,
      source: "assessment"
    }));
  return [...otherActions, ...generatedActions];
}

export function setClientAssessment(data, setData, clientId, nextAnswers) {
  const client = data.clients.find((c) => c.id === clientId);
  const nextActions = syncActionsFromImprovementPlans(data, clientId, nextAnswers, client?.name || "");
  setData({
    ...data,
    assessments: { ...(data.assessments || {}), [clientId]: nextAnswers },
    actions: nextActions
  });
}

// Assessment Rounds: a lightweight history mechanism. Saving a round
// snapshots the client's current answers as-is; it doesn't reset or clear
// anything, so the consultant keeps working from where they are while the
// snapshot becomes a fixed reference point for comparison during a future
// reassessment. This is deliberately simpler than a full review workflow —
// see the README for what a fuller Stage 9 implementation would add.
export function saveAssessmentRound(data, setData, clientId, label = "") {
  const currentAnswers = (data.assessments && data.assessments[clientId]) || [];
  const rounds = data.assessmentRounds || {};
  const clientRounds = rounds[clientId] || [];
  const newRound = { date: new Date().toISOString().slice(0, 10), label, snapshot: currentAnswers };
  setData({
    ...data,
    assessmentRounds: { ...rounds, [clientId]: [...clientRounds, newRound] }
  });
}

export function getLatestRound(data, clientId) {
  const clientRounds = (data.assessmentRounds && data.assessmentRounds[clientId]) || [];
  return clientRounds.length ? clientRounds[clientRounds.length - 1] : null;
}

export function getPreviousRoundAnswer(data, clientId, questionId) {
  const round = getLatestRound(data, clientId);
  if (!round) return null;
  return round.snapshot.find((q) => q.id === questionId) || null;
}

// Highest-scoring categories that have actually been assessed (answered > 0),
// for the report's "strengths" section. Categories with no answers yet are
// excluded rather than shown as a false "0" weakness.
export function topCategories(catScores, n = 3) {
  return catScores.filter((c) => c.answered > 0).sort((a, b) => b.score - a.score).slice(0, n);
}

export function bottomCategories(catScores, n = 3) {
  return catScores.filter((c) => c.answered > 0).sort((a, b) => a.score - b.score).slice(0, n);
}

// Pulls out the specific questions where the consultant actually wrote
// something (notes, evidence, or a follow-up action) rather than just a
// bare score, ordered so the lowest-scoring, most consequential entries
// surface first. This is what makes a report specific to a real assessment
// rather than generic boilerplate text.
export function notableAnswers(answers, { maxScore = 3, limit = 8 } = {}) {
  return answers
    .filter((q) => q.score > 0 && q.score <= maxScore && (q.notes?.trim() || q.evidence?.trim() || q.action?.trim()))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}
