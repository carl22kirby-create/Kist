import { categoryScores, calculateOverall } from "../utils/scoring.js";

export default function AssessmentPanel({ answers, setAnswers, currentQuestion, setCurrentQuestion }) {
  const catScores = categoryScores(answers);
  const q = answers[currentQuestion];

  function update(id, updates) {
    setAnswers(answers.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  return (
    <div className="assessment-embed">
      <div className="assessment-sidebar">
        <h2>{answers.length} Point Assessment</h2>
        <p className="muted assessment-subhead">Assembled for this client's profile — universal questions plus matched industry, capability and regulatory modules.</p>
        <div className="assessment-summary">
          <strong>{calculateOverall(answers)}</strong>
          <span>Overall Score</span>
        </div>
        <div className="category-list">
          {catScores.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setCurrentQuestion(answers.findIndex((q2) => q2.category === cat.category))}
            >
              <span>{cat.category}</span>
              <b>{cat.score}</b>
              <small>{cat.answered}/{cat.total}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="assessment-question">
        <div className="q-tags">
          <span className="gold">{q.category}</span>
          {q.type === "observation" ? (
            <span className="q-badge q-badge-observation">Consultant Observation</span>
          ) : (
            <span className="q-badge q-badge-question">Ask the Client</span>
          )}
          <span className="q-badge q-badge-evidence">Evidence: {q.evidenceType}</span>
          {q.journeyStage && q.journeyStage !== "Internal" && (
            <span className="q-badge q-badge-stage">{q.journeyStage} Stage</span>
          )}
        </div>
        <h2>Question {currentQuestion + 1} of {answers.length}</h2>
        <h3>{q.question}</h3>
        <p className="muted">{q.guidance}</p>
        <div className="score-buttons">
          {[1, 2, 3, 4, 5].map((score) => (
            <button key={score} className={q.score === score ? "selected" : ""} onClick={() => update(q.id, { score })}>
              {score}
            </button>
          ))}
        </div>
        <div className="q-nav">
          <button className="secondary" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(currentQuestion - 1)}>Previous Question</button>
          <button className="secondary" disabled={currentQuestion === answers.length - 1} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next Question</button>
        </div>
        <textarea placeholder={q.type === "observation" ? "What did you observe?" : "Notes"} value={q.notes} onChange={(e) => update(q.id, { notes: e.target.value })} />
        <textarea placeholder="Evidence" value={q.evidence} onChange={(e) => update(q.id, { evidence: e.target.value })} />
        <textarea placeholder="Action" value={q.action} onChange={(e) => update(q.id, { action: e.target.value })} />
      </div>
    </div>
  );
}
