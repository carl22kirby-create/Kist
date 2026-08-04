import BusinessDNA from "../components/BusinessDNA.jsx";
import {
  getClientAssessment, categoryScores, calculateOverall, getScoreTier,
  topCategories, bottomCategories, notableAnswers, getEscalations, getObjectiveFindings, reviewHypothesis
} from "../utils/scoring.js";

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function ClientReport({ data, selectedClient, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const answers = getClientAssessment(data, client.id);
  const hasAssessment = answers.some((q) => q.score > 0);
  const catScores = categoryScores(answers);
  const overall = hasAssessment ? calculateOverall(answers) : client.score;
  const scoreTier = getScoreTier(overall);
  const strengths = topCategories(catScores, 3);
  const improvements = bottomCategories(catScores, 3);
  const findings = notableAnswers(answers, { maxScore: 3, limit: 8 });
  const escalations = getEscalations(answers);
  const reportPhotos = (client.evidenceFiles || []).filter((f) => f.includeInReport && f.mimeType.startsWith("image/"));
  const selectedObjectives = client.profile?.objectives || [];
  const threeProblems = client.profile?.threeProblems || "";
  const objectiveFindings = getObjectiveFindings(answers, selectedObjectives, 10);
  const hypothesis = client.profile?.hypothesis;
  const hypothesisReview = reviewHypothesis(answers, hypothesis);

  const clientActions = data.actions.filter((a) => a.clientId === client.id);
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const sortedActions = [...clientActions].sort(
    (a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  );
  const buckets = [
    { label: "Next 30 Days", items: sortedActions.filter((_, i) => i % 3 === 0) },
    { label: "31 to 60 Days", items: sortedActions.filter((_, i) => i % 3 === 1) },
    { label: "61 to 90 Days", items: sortedActions.filter((_, i) => i % 3 === 2) }
  ];

  const latestVisit = [...data.schedule].filter((s) => s.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const consultant = latestVisit?.consultant || "KIST One Consultant";

  return (
    <div className="report-shell">
      <div className="report-toolbar no-print">
        <button className="secondary" onClick={() => setPage("client")}>Back to Client</button>
        <button className="primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="report-page">
        <header className="report-header">
          <div className="report-brand">
            <div className="report-bars"><span /><span /><span /></div>
            <div>
              <strong>KIST ONE</strong>
              <span>Business Consultancy</span>
            </div>
          </div>
          <div className="report-date">{today()}</div>
        </header>

        <section className="report-cover">
          <span className="report-label">Business Performance Report</span>
          <h1>{client.name}</h1>
          <p className="report-meta">{client.industry} &middot; {client.address || "Address not set"}</p>
          <p className="report-meta">Prepared by {consultant}</p>
        </section>

        {escalations.length > 0 && (
          <section className="report-section report-escalations report-avoid-break">
            <h2>Escalations Requiring Immediate Attention</h2>
            <table className="report-table">
              <thead><tr><th>Indicator</th><th>Flag</th><th>Notes</th></tr></thead>
              <tbody>
                {escalations.map((e) => (
                  <tr key={e.id}>
                    <td>{e.concept}</td>
                    <td className="report-escalation-flags">{e.flags.join(", ")}</td>
                    <td>{e.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {selectedObjectives.length > 0 && (
          <section className="report-section report-roadmap-section report-avoid-break">
            <h2>What {client.name} Is Trying to Achieve</h2>
            {threeProblems && <p className="report-three-problems">"{threeProblems}"</p>}
            <div className="report-objective-chips">{selectedObjectives.map((o) => <span key={o} className="report-objective-chip">{o}</span>)}</div>
            {objectiveFindings.length > 0 ? (
              <div className="report-objective-findings">
                {objectiveFindings.map((f) => (
                  <div className="report-objective-finding" key={f.id}>
                    <div className="report-objective-finding-head">
                      <strong>{f.concept}</strong>
                      <span className="report-table-score">{f.score}/5</span>
                    </div>
                    {f.commercialImpact && <p className="report-objective-finding-impact">{f.commercialImpact.narrative}</p>}
                    {f.improvementBands?.find((b) => b.score === f.score)?.recommendation && (
                      <p className="report-objective-finding-opportunity">
                        <strong>Opportunity:</strong> {f.improvementBands.find((b) => b.score === f.score).recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="report-muted">These objectives haven't yet been connected to a scored finding — complete more of the assessment to build this section out.</p>
            )}
          </section>
        )}

        {hypothesis?.statement && (
          <section className="report-section report-hypothesis-section report-avoid-break">
            <h2>Consultancy Hypothesis</h2>
            <p className="report-three-problems">"{hypothesis.statement}"</p>
            {hypothesisReview && hypothesisReview.status !== "Not Yet Tested" ? (
              <>
                <span className={`report-hypothesis-status report-hypothesis-status-${hypothesisReview.status.replace(/\s+/g, "-").toLowerCase()}`}>
                  {hypothesisReview.status}
                </span>
                <p className="report-hypothesis-narrative">
                  {hypothesisReview.status === "Supported" && `The evidence gathered confirms this theory — the indicators this hypothesis was tested against scored an average of ${hypothesisReview.averageScore} out of 5, showing this is a genuine and significant limiting factor.`}
                  {hypothesisReview.status === "Not Supported" && `The evidence gathered does not support this theory — the indicators this hypothesis was tested against scored an average of ${hypothesisReview.averageScore} out of 5, well evidenced. Whatever is actually limiting performance sits elsewhere, and the findings below should be read with that in mind.`}
                  {hypothesisReview.status === "Partially Supported" && `The evidence is mixed. Some of the indicators this hypothesis was tested against confirm the theory, others don't — the detail below distinguishes which is which, rather than treating this as a single yes or no answer.`}
                </p>
                <table className="report-table">
                  <thead><tr><th>Indicator</th><th>Score</th></tr></thead>
                  <tbody>
                    {hypothesisReview.relevant.map((r) => (
                      <tr key={r.id}><td>{r.concept}</td><td className="report-table-score">{r.score > 0 ? `${r.score}/5` : "Not yet scored"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="report-muted">This hypothesis has not yet been tested against scored evidence.</p>
            )}
          </section>
        )}

        <section className="report-section report-summary">
          <h2>Executive Summary</h2>
          {selectedObjectives.length > 0 && (
            <p className="report-score-context">The score below is supporting evidence for the findings above, not the headline of this report.</p>
          )}
          <div className="report-summary-grid">
            <div className="report-score-block">
              <span className="report-score">{overall}</span>
              <span className="report-score-label">Overall Score / 100</span>
              <span className={`report-band report-band-${scoreTier.tier.toLowerCase()}`}>{scoreTier.tier} — {scoreTier.label}</span>
            </div>
            <p className="report-summary-text">
              {hasAssessment ? (
                <>
                  {client.name} scores <strong>{overall} out of 100</strong> against KIST's 11-category
                  business performance framework, based on a {answers.filter((a) => a.score > 0).length}-question
                  assessment. The strongest area identified is <strong>{strengths[0]?.category || "not yet determined"}</strong>,
                  while <strong>{improvements[0]?.category || "no area"}</strong> represents the most significant
                  opportunity for improvement.
                </>
              ) : (
                <>No full assessment has been recorded for {client.name} yet. This report reflects the client's
                  current recorded score of <strong>{client.score}</strong> and existing action items only.</>
              )}
            </p>
          </div>
        </section>

        {hasAssessment && (
          <section className="report-section report-dna">
            <h2>KIST Business DNA</h2>
            <div className="report-dna-layout">
              <BusinessDNA scores={catScores.map((c) => c.score)} theme="light" />
              <table className="report-table">
                <thead><tr><th>Category</th><th>Score</th><th>Answered</th></tr></thead>
                <tbody>
                  {catScores.map((c) => (
                    <tr key={c.category}>
                      <td>{c.category}</td>
                      <td className="report-table-score">{c.answered > 0 ? c.score : "—"}</td>
                      <td>{c.answered}/{c.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {hasAssessment && (
          <section className="report-section">
            <h2>Strengths and Opportunities</h2>
            <div className="report-two-col">
              <div>
                <h3>Strongest Areas</h3>
                <ul className="report-list">
                  {strengths.map((c) => <li key={c.category}><strong>{c.category}</strong> — {c.score}/100</li>)}
                </ul>
              </div>
              <div>
                <h3>Priority Improvement Areas</h3>
                <ul className="report-list">
                  {improvements.map((c) => <li key={c.category}><strong>{c.category}</strong> — {c.score}/100</li>)}
                </ul>
              </div>
            </div>
          </section>
        )}

        {findings.length > 0 && (
          <section className="report-section">
            <h2>Key Findings</h2>
            <table className="report-table report-findings">
              <thead><tr><th>Category</th><th>Finding</th><th>Evidence</th><th>Score</th></tr></thead>
              <tbody>
                {findings.map((q) => (
                  <tr key={q.id}>
                    <td>{q.category}</td>
                    <td>
                      <div className="report-finding-question">{q.question}</div>
                      {q.notes && <div className="report-finding-note">{q.notes}</div>}
                      {q.action && <div className="report-finding-action">Recommended action: {q.action}</div>}
                    </td>
                    <td>{q.evidenceType || "Explained"}</td>
                    <td className="report-table-score">{q.score}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="report-section report-avoid-break">
          <h2>Priority Actions</h2>
          {clientActions.length ? (
            <table className="report-table">
              <thead><tr><th>Action</th><th>Owner</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead>
              <tbody>
                {sortedActions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.owner}</td>
                    <td>{a.priority}</td>
                    <td>{a.status}</td>
                    <td>{a.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="report-muted">No actions have been logged for this client yet.</p>
          )}
        </section>

        {clientActions.length > 0 && (
          <section className="report-section report-avoid-break">
            <h2>90 Day Roadmap</h2>
            <div className="report-roadmap">
              {buckets.map((bucket) => (
                <div className="report-roadmap-col" key={bucket.label}>
                  <h3>{bucket.label}</h3>
                  {bucket.items.length ? (
                    <ul className="report-list">
                      {bucket.items.map((a) => <li key={a.id}>{a.title}</li>)}
                    </ul>
                  ) : (
                    <p className="report-muted-small">No actions allocated.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {reportPhotos.length > 0 && (
          <section className="report-section report-evidence-section report-avoid-break">
            <h2>Site Evidence</h2>
            <div className="report-photo-grid">
              {reportPhotos.map((photo) => (
                <div className="report-photo-card" key={photo.id}>
                  <img src={photo.url} alt={photo.caption || photo.fileName} />
                  {photo.caption && <p>{photo.caption}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="report-footer">
          <p>Prepared by {consultant} on behalf of KIST One. This report is confidential and intended solely for {client.name}.</p>
        </footer>
      </div>
    </div>
  );
}
