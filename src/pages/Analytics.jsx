import PageHeader from "../components/PageHeader.jsx";
import BusinessDNA from "../components/BusinessDNA.jsx";
import { categories } from "../data/seedData.js";
import { categoryScores } from "../utils/scoring.js";

const fallbackScores = [82, 76, 61, 74, 67, 70, 58, 63, 42, 79, 69];

export default function Analytics({ data }) {
  const assessedClientIds = Object.keys(data.assessments || {}).filter((id) => (data.assessments[id] || []).some((q) => q.score > 0));

  const scores = categories.map((cat, i) => {
    if (!assessedClientIds.length) return fallbackScores[i];
    const perClient = assessedClientIds.map((id) => {
      const cs = categoryScores(data.assessments[id]);
      return cs.find((c) => c.category === cat)?.score || 0;
    });
    return Math.round(perClient.reduce((s, v) => s + v, 0) / perClient.length);
  });

  return (
    <section>
      <PageHeader title="Analytics" subtitle={assessedClientIds.length ? "Benchmarking and Business DNA, live from recorded assessments." : "Benchmarking and Business DNA retained (demo data — run an assessment to see live scores)."} />
      <div className="grid">
        <div className="card"><h2>KIST Business DNA</h2><BusinessDNA scores={scores} /></div>
        <div className="card">
          <h2>Category Scores</h2>
          {categories.map((c, i) => (
            <div className="bar-row" key={c}>
              <span>{c}</span>
              <div><em style={{ width: `${scores[i]}%` }} /></div>
              <b>{scores[i]}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
