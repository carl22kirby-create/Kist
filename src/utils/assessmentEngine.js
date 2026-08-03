import { questionsSeed, inferEvidenceType } from "../data/seedData.js";
import { knowledgeBase, dependencyQuestions } from "../data/knowledgeBase.js";

// Universal questions weren't authored with the same per-concept scoring
// and improvement detail as the Knowledge Base concepts — this generic
// template is applied to all of them so every item in the system has the
// same shape, clearly labelled as generic rather than pretending to be
// concept-specific content that doesn't exist yet.
const GENERIC_MATURITY = ["Foundation", "Foundation", "Intermediate", "Advanced", "Best Practice", "Industry Leading"];
const GENERIC_SCORING_DESCRIPTIONS = [
  "No evidence this is happening at all.",
  "Happens occasionally or informally, with no consistency.",
  "Exists but is inconsistent or undocumented.",
  "Consistent and evidenced in most cases.",
  "Consistent, evidenced and actively reviewed.",
  "Consistent, evidenced and actively improved as standard practice."
];
const GENERIC_IMPROVEMENT_RECOMMENDATIONS = [
  "Establish a basic, repeatable approach before anything else.",
  "Make the current informal approach consistent and repeatable.",
  "Introduce documentation or evidence so this can be reviewed reliably.",
  "Introduce a regular review of what's already being evidenced.",
  "Use what's already being reviewed to drive a specific improvement.",
  "Maintain current practice and share it as a reference point elsewhere in the business."
];
function genericScoring() {
  return GENERIC_SCORING_DESCRIPTIONS.map((description, score) => ({ score, maturity: GENERIC_MATURITY[score], description }));
}
function genericImprovement() {
  return GENERIC_IMPROVEMENT_RECOMMENDATIONS.map((recommendation, score) => ({ score, recommendation }));
}

// Knowledge Base concepts get sequential ids continuing after the 250
// universal questions (1-250), so existing per-client persisted answers —
// keyed by question id — are never disturbed by editing or extending the
// Knowledge Base. Universal questions are tagged ["Universal"] so every
// item in the system is genuinely findable by tag, with no untagged
// special case.
const finalisedKnowledgeItems = knowledgeBase.map((entry, i) => ({
  id: 251 + i,
  concept: entry.concept.name,
  conceptPurpose: entry.concept.purpose,
  category: entry.concept.category,
  tags: entry.concept.tags,
  type: entry.concept.type,
  question: entry.method.question,
  evidenceType: inferEvidenceType(entry.method.question),
  evidenceRequired: entry.method.evidenceRequired,
  observationPoints: entry.method.observationPoints,
  metrics: entry.method.metrics,
  frequency: entry.method.frequency,
  scoringBands: entry.scoring,
  improvementBands: entry.improvement,
  journeyStage: "Internal",
  guidance: entry.concept.type === "observation"
    ? "Score this from direct observation during the visit rather than by asking the client. Evidence should always outweigh opinion."
    : "Score using the maturity bands for this concept — evidence should always outweigh opinion.",
  score: 0,
  notes: "",
  evidence: "",
  action: "",
  risk: "Medium",
  priority: "Medium"
}));

const universalItems = questionsSeed.map((q) => ({
  ...q,
  concept: q.concept || q.question.split(",")[0].replace(/^(Explain|Describe|What|How|Walk me through)\s*/i, "").slice(0, 60),
  conceptPurpose: null,
  tags: ["Universal"],
  evidenceRequired: [q.evidenceType],
  observationPoints: q.type === "observation" ? ["Direct observation during the visit"] : [],
  metrics: [],
  frequency: null,
  scoringBands: genericScoring(),
  improvementBands: genericImprovement()
}));

// The full library: 250 universal questions (tagged Universal, always
// shown) plus every concept in the Knowledge Base, each carrying tags that
// say which Business Profile characteristics make it relevant.
export const fullQuestionLibrary = [...universalItems, ...finalisedKnowledgeItems];

const defaultProfile = { industry: "Other", capabilities: [], regulations: [], dependencies: {} };

// A client's active tag set is simply everything true about their business.
function activeTagSet(profile) {
  const p = { ...defaultProfile, ...profile };
  const tags = new Set(["Universal", "Observation"]);
  if (p.industry && p.industry !== "Other") tags.add(p.industry);
  for (const cap of p.capabilities || []) tags.add(cap);
  for (const reg of p.regulations || []) tags.add(reg);
  return tags;
}

// Dependencies are a hard veto: once a characteristic is known to be false,
// every item carrying the corresponding tag is removed completely, even if
// it also carries another tag that's still true for this business.
function excludedTagSet(profile) {
  const p = { ...defaultProfile, ...profile };
  const excluded = new Set();
  for (const dep of dependencyQuestions) {
    if (p.dependencies?.[dep.field] === false) {
      for (const tag of dep.excludeTagsWhenFalse) excluded.add(tag);
    }
  }
  return excluded;
}

function questionMatchesProfile(question, active, excluded) {
  if (question.tags?.some((t) => excluded.has(t))) return false;
  if (!question.tags || question.tags.length === 0) return true;
  return question.tags.some((t) => active.has(t));
}

// Builds the actual question set for one client: every tag their Business
// Profile makes active, minus anything hard-excluded by a dependency
// answer. Recomputed live from the profile each time rather than stored as
// a snapshot, so improving the Knowledge Base later automatically benefits
// every client who matches it.
export function buildAssessmentForClient(profile) {
  const active = activeTagSet(profile);
  const excluded = excludedTagSet(profile);
  return fullQuestionLibrary.filter((q) => questionMatchesProfile(q, active, excluded));
}

// What's currently active for a profile, and why.
export function activeModulesForProfile(profile) {
  const p = { ...defaultProfile, ...profile };
  const excluded = excludedTagSet(profile);
  const modules = [];
  if (p.industry && p.industry !== "Other") modules.push({ type: "Industry", name: p.industry, excluded: excluded.has(p.industry) });
  for (const cap of p.capabilities || []) modules.push({ type: "Capability", name: cap, excluded: excluded.has(cap) });
  for (const reg of p.regulations || []) modules.push({ type: "Regulatory", name: reg, excluded: excluded.has(reg) });
  modules.push({ type: "Always On", name: "Universal Business Assessment", excluded: false });
  modules.push({ type: "Always On", name: "Consultant Observation", excluded: false });
  return modules;
}

// Which dependency exclusions are currently active for a profile, with a
// plain-language reason.
export function activeExclusionsForProfile(profile) {
  const p = { ...defaultProfile, ...profile };
  return dependencyQuestions
    .filter((dep) => p.dependencies?.[dep.field] === false)
    .map((dep) => ({ tag: dep.excludeTagsWhenFalse.join(", "), reason: dep.label }));
}
