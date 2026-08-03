import { questionsSeed, inferEvidenceType } from "../data/seedData.js";
import { moduleLibrary } from "../data/moduleLibrary.js";

// Module questions get sequential ids continuing after the 250 universal
// questions (1-250), so existing per-client persisted answers — which are
// keyed by question id — are never disturbed by adding new modules.
const finalisedModuleQuestions = moduleLibrary.map((item, i) => ({
  id: 251 + i,
  category: item.category,
  question: item.question,
  tags: item.tags,
  type: item.type,
  evidenceType: item.evidenceType || inferEvidenceType(item.question),
  journeyStage: "Internal",
  guidance: item.type === "observation"
    ? "Score this from direct observation during the visit rather than by asking the client. Evidence should always outweigh opinion."
    : "Score based on what is demonstrated, documented or measured — not simply what is claimed.",
  score: 0,
  notes: "",
  evidence: "",
  action: "",
  risk: "Medium",
  priority: "Medium"
}));

// The full library: 250 universal questions (always shown) plus every
// module question that exists, each carrying tags that say which Business
// Profile characteristics make it relevant.
export const fullQuestionLibrary = [...questionsSeed, ...finalisedModuleQuestions];

const defaultProfile = { industry: "Other", capabilities: [], regulations: [] };

// A question with no tags is Layer 1 (Universal) and always included.
// A tagged question is included if the client's profile matches ANY of its
// tags — an industry tag, a selected capability, a selected regulation, or
// the always-on Observation module.
function questionMatchesProfile(question, profile) {
  if (!question.tags || question.tags.length === 0) return true;
  return question.tags.some((tag) => {
    if (tag === "Observation") return true;
    if (tag.startsWith("Industry:")) return tag === `Industry:${profile.industry}`;
    if (tag.startsWith("Capability:")) return profile.capabilities?.includes(tag.replace("Capability:", ""));
    if (tag.startsWith("Regulatory:")) return profile.regulations?.includes(tag.replace("Regulatory:", ""));
    return false;
  });
}

// Builds the actual question set for one client: every Universal question,
// plus every module question whose tags match that client's Business
// Profile. This is recomputed live from the profile each time rather than
// stored as a snapshot, so improving a module's questions later
// automatically benefits every client who matches it.
export function buildAssessmentForClient(profile) {
  const p = { ...defaultProfile, ...profile };
  return fullQuestionLibrary.filter((q) => questionMatchesProfile(q, p));
}

// Which modules are currently active for a profile — used to show the
// consultant what's been included and why, rather than a silent black box.
export function activeModulesForProfile(profile) {
  const p = { ...defaultProfile, ...profile };
  const modules = [];
  if (p.industry && p.industry !== "Other") modules.push({ type: "Industry", name: p.industry });
  for (const cap of p.capabilities || []) modules.push({ type: "Capability", name: cap });
  for (const reg of p.regulations || []) modules.push({ type: "Regulatory", name: reg });
  modules.push({ type: "Always On", name: "Universal Business Assessment" });
  modules.push({ type: "Always On", name: "Consultant Observation" });
  return modules;
}
