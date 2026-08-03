import { questionsSeed, inferEvidenceType } from "../data/seedData.js";
import { conceptLibrary, dependencyQuestions } from "../data/moduleLibrary.js";

// Concept library items get sequential ids continuing after the 250
// universal questions (1-250), so existing per-client persisted answers —
// keyed by question id — are never disturbed by adding, removing or
// re-tagging concepts. Universal questions are themselves tagged
// ["Universal"] so every item in the system is genuinely findable by tag,
// with no untagged special case.
const finalisedConceptItems = conceptLibrary.map((c, i) => ({
  id: 251 + i,
  concept: c.concept,
  category: c.category,
  question: c.question,
  tags: c.tags,
  type: c.type,
  evidenceType: inferEvidenceType(c.question),
  evidenceRequired: c.evidenceRequired,
  observationPoints: c.observationPoints,
  scoringGuidance: c.scoringGuidance,
  recommendations: c.recommendations,
  journeyStage: "Internal",
  guidance: c.type === "observation"
    ? "Score this from direct observation during the visit rather than by asking the client. Evidence should always outweigh opinion."
    : c.scoringGuidance,
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
  tags: ["Universal"],
  evidenceRequired: [q.evidenceType],
  observationPoints: q.type === "observation" ? ["Direct observation during the visit"] : [],
  scoringGuidance: q.guidance,
  recommendations: "Where scored below 4, agree a named owner and a specific next step with a review date, rather than a general intention to improve."
}));

// The full library: 250 universal questions (tagged Universal, always
// shown) plus every concept in the Business Knowledge Engine, each carrying
// tags that say which Business Profile characteristics make it relevant.
export const fullQuestionLibrary = [...universalItems, ...finalisedConceptItems];

const defaultProfile = { industry: "Other", capabilities: [], regulations: [], dependencies: {} };

// A client's active tag set is simply everything true about their business:
// their industry, every capability they have, every regulation that applies
// — one flat set, no distinction in how matching works between the three.
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
// it also carries another tag that's still true for this business. This is
// what lets the assessment genuinely shrink as more is learned, rather than
// only ever growing from manual tag selection.
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
// a snapshot, so improving the concept library later automatically benefits
// every client who matches it.
export function buildAssessmentForClient(profile) {
  const active = activeTagSet(profile);
  const excluded = excludedTagSet(profile);
  return fullQuestionLibrary.filter((q) => questionMatchesProfile(q, active, excluded));
}

// What's currently active for a profile, and why — surfaced in the UI so
// this never feels like a silent black box to the consultant using it.
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
// plain-language reason — this is what makes "the assessment gets smaller
// as KIST learns more about the business" visible rather than mysterious.
export function activeExclusionsForProfile(profile) {
  const p = { ...defaultProfile, ...profile };
  return dependencyQuestions
    .filter((dep) => p.dependencies?.[dep.field] === false)
    .map((dep) => ({ tag: dep.excludeTagsWhenFalse.join(", "), reason: dep.label }));
}
