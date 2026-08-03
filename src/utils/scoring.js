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
