import { getTrafficLight } from "../utils/scoring.js";

// A deliberately stripped-down view for blasting through a first pass on
// many BPIs quickly — question and a 1-5 score, nothing else. The full
// detail (observation notes, evidence, consultant assessment, improvement
// plan) still lives in the normal detailed view; this is only ever meant
// to get an initial number down fast, then hand off to that view for the
// items that actually need the deeper work — typically anything that
// scored below 4.
export default function QuickScorePanel({ answers, setAnswers, filterPriorityOnly, priorityIds, onOpenDetail, onExit }) {
  const visible = filterPriorityOnly ? answers.filter((a) => priorityIds.has(a.id)) : answers;
  const scoredCount = visible.filter((a) => a.score > 0).length;

  function setScore(id, score) {
    setAnswers(answers.map((a) => (a.id === id ? { ...a, score } : a)));
  }

  return (
    <div className="quick-score-panel">
      <div className="quick-score-header">
        <div>
          <h2>Quick Score</h2>
          <p className="muted">{scoredCount} of {visible.length} scored. Score only — open a specific item afterwards to add notes, evidence or an improvement plan.</p>
        </div>
        <button className="secondary" onClick={onExit}>Exit Quick Score</button>
      </div>
      <div className="quick-score-list">
        {visible.map((a) => {
          const light = getTrafficLight(a);
          return (
            <div className={a.score > 0 ? "quick-score-row scored" : "quick-score-row"} key={a.id}>
              <button className="quick-score-question" onClick={() => onOpenDetail(a.id)}>
                <span className="quick-score-traffic">{light.icon}</span>
                <span className="quick-score-concept">{a.concept}</span>
                <span className="quick-score-text">{a.question}</span>
              </button>
              <div className="quick-score-buttons">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    className={a.score === score ? "selected" : ""}
                    onClick={() => setScore(a.id, score)}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
