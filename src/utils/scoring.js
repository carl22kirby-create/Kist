import { categories, freshAssessment } from "../data/seedData.js";

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

// Assessment answers are stored per-client on data.assessments[clientId].
// This is the fix for the bug where progress reset every time you left the
// Assessment / Visit Workflow page: previously each page held its own
// useState(questionsSeed) with nothing written back to shared data.
export function getClientAssessment(data, clientId) {
  return (data.assessments && data.assessments[clientId]) || freshAssessment();
}

export function setClientAssessment(data, setData, clientId, nextAnswers) {
  setData({
    ...data,
    assessments: { ...(data.assessments || {}), [clientId]: nextAnswers }
  });
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
