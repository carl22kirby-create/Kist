import PageHeader from "../components/PageHeader.jsx";
import BusinessDNA from "../components/BusinessDNA.jsx";
import { categories } from "../data/seedData.js";
import { categoryScores } from "../utils/scoring.js";

export default function Analytics({ data }) {
  const assessedClientIds = Object.keys(data.assessments || {}).filter((id) => (data.assessments[id] || []).some((q) => q.score > 0));

  // Averages only ever include clients who have actually answered that
  // specific category — a client who hasn't touched a category yet
  // reports a score of 0 from categoryScores(), but that 0 means "not
  // assessed", not "scored zero". Including it would silently drag the
  // whole cross-client average down, the same category of mistake fixed
  // in the single-client scoring calculation back in v6.3.0, just
  // recurring here across clients instead of across categories.
  const scores = categories.map((cat) => {
    const realValues = assessedClientIds
      .map((id) => categoryScores(data.assessments[id]).find((c) => c.category === cat))
      .filter((c) => c && c.answered > 0)
      .map((c) => c.score);
    if (realValues.length === 0) return null;
    return Math.round(realValues.reduce((s, v) => s + v, 0) / realValues.length);
  });
  const hasAnyRealData = scores.some((s) => s !== null);

  return (
    <section>
      <PageHeader title="Analytics" subtitle={hasAnyRealData ? "Cross-client benchmarking and Business DNA, live from recorded assessments." : "No client has any scored assessment yet — this page will show real cross-client data once at least one exists."} />
      {hasAnyRealData ? (
        <div className="grid">
          <div className="card"><h2>KIST Business DNA</h2><BusinessDNA scores={scores.map((s) => s ?? 0)} /></div>
          <div className="card">
            <h2>Category Scores</h2>
            <p className="muted-small">Averaged only across clients who have actually been assessed on each category — a category no one's touched yet is left out of that category's average, not counted as zero.</p>
            {categories.map((c, i) => (
              <div className="bar-row" key={c}>
                <span>{c}</span>
                <div><em style={{ width: `${scores[i] ?? 0}%` }} /></div>
                <b>{scores[i] ?? "—"}</b>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="muted">Score at least one BPI for any client in the Assessment stage, and this page will show genuine cross-client Business DNA and category benchmarking — computed from real recorded data, never placeholder numbers.</p>
        </div>
      )}
    </section>
  );
}
