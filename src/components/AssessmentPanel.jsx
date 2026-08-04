import { useState } from "react";
import { escalationFlagOptions } from "../data/knowledgeBase.js";
import {
  categoryScores, calculateOverall, isItemComplete, isImprovementPlanRequired, isImprovementPlanComplete,
  saveAssessmentRound, getPreviousRoundAnswer, getLatestRound, getAssessmentStatus, getTrafficLight,
  getEvidenceStrength, getCrossReferenceSuggestions, computeAssessmentQuality, suggestStoryTags, touchTimeline,
  getObjectivePriority, sortByObjectivePriority, reviewHypothesis
} from "../utils/scoring.js";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const PROGRESS_OPTIONS = ["Not Started", "In Progress", "Complete"];
const JUDGEMENT_OPTIONS = ["Better than expected", "About as expected", "Worse than expected"];

export default function AssessmentPanel({ data, setData, clientId, answers, setAnswers, currentQuestion, setCurrentQuestion }) {
  const [roundLabel, setRoundLabel] = useState("");
  const [showRoundBox, setShowRoundBox] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const client = data.clients.find((c) => c.id === clientId);
  const selectedObjectives = client?.profile?.objectives || [];
  const catScores = categoryScores(answers);
  const q = answers[currentQuestion];
  const objectivePriority = getObjectivePriority(q, selectedObjectives);
  const priorityUnscored = selectedObjectives.length > 0
    ? sortByObjectivePriority(answers, selectedObjectives).filter((a) => getObjectivePriority(a, selectedObjectives) > 0 && a.score === 0).slice(0, 6)
    : [];
  const hypothesis = client?.profile?.hypothesis;
  const hypothesisReview = reviewHypothesis(answers, hypothesis);
  const quality = computeAssessmentQuality(answers);
  const latestRound = getLatestRound(data, clientId);
  const previousAnswer = getPreviousRoundAnswer(data, clientId, q.id);
  const completeState = isItemComplete(q);
  const status = getAssessmentStatus(q);
  const trafficLight = getTrafficLight(q);
  const evidenceStrength = getEvidenceStrength(q);
  const crossRefs = getCrossReferenceSuggestions(q, answers);
  const suggestedTags = suggestStoryTags(q.notes).filter((t) => !(q.storyTags || []).includes(t));

  function update(id, updates) {
    setAnswers(answers.map((item) => {
      if (item.id !== id) return item;
      const merged = { ...item, ...updates };
      let event = null;
      if (updates.score !== undefined && updates.score !== item.score) event = `Scored ${updates.score}/5`;
      else if (isImprovementPlanRequired(merged) && !isImprovementPlanComplete(item) && isImprovementPlanComplete(merged)) event = "Improvement plan completed";
      else if (isItemComplete(item) !== true && isItemComplete(merged) === true) event = "Marked complete";
      let timeline = touchTimeline(merged, event);
      if (isItemComplete(merged) === true && !timeline.completedAt) timeline = { ...timeline, completedAt: new Date().toISOString() };
      return { ...merged, timeline };
    }));
  }
  function updateNested(id, key, field, value) {
    const item = answers.find((a) => a.id === id);
    update(id, { [key]: { ...item[key], [field]: value } });
  }
  function toggleChecklist(id, key, itemLabel) {
    const item = answers.find((a) => a.id === id);
    const current = item[key] || {};
    update(id, { [key]: { ...current, [itemLabel]: !current[itemLabel] } });
  }
  function toggleEscalation(id, flag) {
    const item = answers.find((a) => a.id === id);
    const current = item.escalationFlags || [];
    update(id, { escalationFlags: current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag] });
  }
  function addStoryTag(tag) {
    update(q.id, { storyTags: [...(q.storyTags || []), tag] });
  }
  function removeStoryTag(tag) {
    update(q.id, { storyTags: (q.storyTags || []).filter((t) => t !== tag) });
  }
  function jumpToConcept(conceptName) {
    const idx = answers.findIndex((a) => a.concept === conceptName);
    if (idx >= 0) setCurrentQuestion(idx);
  }
  function handleSaveRound() {
    saveAssessmentRound(data, setData, clientId, roundLabel);
    setRoundLabel("");
    setShowRoundBox(false);
  }

  return (
    <div className="assessment-embed">
      <div className="assessment-sidebar">
        <h2>{answers.length} Business Performance Indicators</h2>
        <p className="muted assessment-subhead">Assembled for this client's profile — universal indicators plus matched Knowledge Base concepts.</p>
        {hypothesis?.statement && (
          <div className="hypothesis-banner">
            <b>Testing Hypothesis</b>
            <p>"{hypothesis.statement}"</p>
            {hypothesisReview && (
              <span className={`hypothesis-status hypothesis-status-${hypothesisReview.status.replace(/\s+/g, "-").toLowerCase()}`}>{hypothesisReview.status}</span>
            )}
          </div>
        )}
        <div className="assessment-summary">
          <strong>{calculateOverall(answers)}</strong>
          <span>Business Performance Score</span>
        </div>
        <div className="quality-score-box">
          <div className="quality-score-head"><b>{quality.percentComplete}%</b><span>Assessment Quality</span></div>
          <ul>
            <li>{quality.completeItems} of {quality.totalItems} BPIs complete</li>
            {quality.missingObservations > 0 && <li>{quality.missingObservations} observations missing</li>}
            {quality.missingEvidence > 0 && <li>{quality.missingEvidence} evidence items outstanding</li>}
            {quality.incompletePlans > 0 && <li>{quality.incompletePlans} improvement plans incomplete</li>}
          </ul>
        </div>
        {priorityUnscored.length > 0 && (
          <div className="priority-objectives-box">
            <b>Priority for Client's Objectives</b>
            <p className="muted-small">Not yet scored, most relevant to what this client said they want.</p>
            {priorityUnscored.map((a) => (
              <button key={a.id} className="priority-jump-row" onClick={() => setCurrentQuestion(answers.findIndex((x) => x.id === a.id))}>
                {a.concept}
              </button>
            ))}
          </div>
        )}
        {latestRound && <p className="round-reference">Last round saved: {latestRound.date}{latestRound.label ? ` — ${latestRound.label}` : ""}</p>}
        <button className="secondary round-save-button" onClick={() => setShowRoundBox(!showRoundBox)}>Save Assessment Round</button>
        {showRoundBox && (
          <div className="round-box">
            <input placeholder="Round label, e.g. Initial visit" value={roundLabel} onChange={(e) => setRoundLabel(e.target.value)} />
            <button className="primary" onClick={handleSaveRound}>Confirm Save</button>
          </div>
        )}
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
          <span className="q-badge q-badge-status">{status.icon} {status.label}</span>
          <span className="q-badge q-badge-traffic">{trafficLight.icon} {trafficLight.label}</span>
          {objectivePriority > 0 && <span className="q-badge q-badge-objective">Priority for Client's Objectives</span>}
          {hypothesis?.targetConcepts?.includes(q.concept) && <span className="q-badge q-badge-hypothesis">Testing Hypothesis</span>}
        </div>
        <h2>BPI {currentQuestion + 1} of {answers.length}</h2>
        {q.concept && <p className="q-concept">{q.concept}</p>}
        {q.conceptPurpose && <p className="q-purpose">{q.conceptPurpose}</p>}
        {q.commercialImpact && (
          <div className="commercial-impact-box">
            <b>Why This Matters Commercially</b>
            <p>{q.commercialImpact.narrative}</p>
            <div className="impact-category-row">{q.commercialImpact.categories.map((c) => <span key={c} className="impact-category-chip">{c}</span>)}</div>
          </div>
        )}

        {previousAnswer && (
          <div className="previous-round-box">
            <b>Previous Round ({latestRound.date})</b>
            <p>Score: <strong>{previousAnswer.score || "Not scored"}</strong>{previousAnswer.justification ? ` — ${previousAnswer.justification}` : ""}</p>
            {previousAnswer.improvementPlan?.recommendedActions && <p className="muted-small">Previous plan: {previousAnswer.improvementPlan.recommendedActions}</p>}
          </div>
        )}

        <h3>{q.question}</h3>
        {(q.supportingQuestions?.length > 0 || q.followUpQuestions?.length > 0) && (
          <div className="discussion-questions">
            {q.supportingQuestions?.length > 0 && (
              <div><b>Supporting Questions</b><ul>{q.supportingQuestions.map((sq, i) => <li key={i}>{sq}</li>)}</ul></div>
            )}
            {q.followUpQuestions?.length > 0 && (
              <div><b>Follow Up Questions</b><ul>{q.followUpQuestions.map((fq, i) => <li key={i}>{fq}</li>)}</ul></div>
            )}
          </div>
        )}
        <p className="muted">{q.guidance}</p>

        {(q.evidenceRequired?.length > 0 || q.observationPoints?.length > 0) && (
          <div className="q-checklist-box">
            {q.evidenceRequired?.length > 0 && (
              <div>
                <b>Evidence to Request</b>
                {q.evidenceRequired.map((ev) => (
                  <label className="checklist-item" key={ev}>
                    <input type="checkbox" checked={!!q.evidenceChecklist?.[ev]} onChange={() => toggleChecklist(q.id, "evidenceChecklist", ev)} />
                    {ev}
                  </label>
                ))}
              </div>
            )}
            {q.observationPoints?.length > 0 && (
              <div>
                <b>Preparation &amp; Observation Checklist</b>
                {q.observationPoints.map((op) => (
                  <label className="checklist-item" key={op}>
                    <input type="checkbox" checked={!!q.observationChecklist?.[op]} onChange={() => toggleChecklist(q.id, "observationChecklist", op)} />
                    {op}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="guidance-toggle" onClick={() => setShowGuidance(!showGuidance)}>
          {showGuidance ? "Hide" : "Show"} Consultant Guidance {q.guidanceContent ? "" : "(not yet written for this item)"}
        </button>
        {showGuidance && q.guidanceContent && (
          <div className="guidance-box">
            {q.guidanceContent.ifClientSays?.length > 0 && (
              <div className="guidance-section">
                <b>If the Client Says...</b>
                {q.guidanceContent.ifClientSays.map((item, i) => (
                  <div className="guidance-pair" key={i}><span className="guidance-quote">"{item.says}"</span><span className="guidance-response">→ {item.meansCheckFor}</span></div>
                ))}
              </div>
            )}
            {q.guidanceContent.lookFor?.length > 0 && (
              <div className="guidance-section"><b>Look For</b><ul>{q.guidanceContent.lookFor.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
            {q.guidanceContent.warningSigns?.length > 0 && (
              <div className="guidance-section"><b>Warning Signs</b><ul>{q.guidanceContent.warningSigns.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
            {q.guidanceContent.typicalEvidence?.length > 0 && (
              <div className="guidance-section"><b>Typical Evidence</b><ul>{q.guidanceContent.typicalEvidence.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
            {q.guidanceContent.commonExcuses?.length > 0 && (
              <div className="guidance-section">
                <b>Common Excuses</b>
                {q.guidanceContent.commonExcuses.map((item, i) => (
                  <div className="guidance-pair" key={i}><span className="guidance-quote">"{item.excuse}"</span><span className="guidance-response">→ {item.probe}</span></div>
                ))}
              </div>
            )}
            {q.guidanceContent.bestPractice && (
              <div className="guidance-section"><b>Industry Best Practice</b><p>{q.guidanceContent.bestPractice}</p></div>
            )}
            {q.guidanceContent.probingQuestions?.length > 0 && (
              <div className="guidance-section"><b>Questions to Probe Deeper</b><ul>{q.guidanceContent.probingQuestions.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            )}
          </div>
        )}

        <h4 className="section-heading">Observation Notes</h4>
        <textarea placeholder="Positive observations" value={q.observationNotes?.positives || ""} onChange={(e) => updateNested(q.id, "observationNotes", "positives", e.target.value)} />
        <textarea placeholder="Areas of concern" value={q.observationNotes?.concerns || ""} onChange={(e) => updateNested(q.id, "observationNotes", "concerns", e.target.value)} />
        <textarea placeholder="Risks identified" value={q.observationNotes?.risks || ""} onChange={(e) => updateNested(q.id, "observationNotes", "risks", e.target.value)} />

        <h4 className="section-heading">Discussion and Evidence</h4>
        <textarea placeholder={q.type === "observation" ? "What did you observe?" : "Discussion notes"} value={q.notes} onChange={(e) => update(q.id, { notes: e.target.value })} />
        {(suggestedTags.length > 0 || q.storyTags?.length > 0) && (
          <div className="story-tag-row">
            {q.storyTags?.map((t) => <button key={t} className="story-tag story-tag-confirmed" onClick={() => removeStoryTag(t)}>{t} ✕</button>)}
            {suggestedTags.map((t) => <button key={t} className="story-tag story-tag-suggested" onClick={() => addStoryTag(t)}>+ {t}</button>)}
          </div>
        )}
        <textarea placeholder="Evidence reviewed" value={q.evidence} onChange={(e) => update(q.id, { evidence: e.target.value })} />

        <h4 className="section-heading">Consultant Assessment</h4>
        <div className="consultant-assessment-grid">
          <textarea placeholder="Strengths" value={q.consultantAssessment?.strengths || ""} onChange={(e) => updateNested(q.id, "consultantAssessment", "strengths", e.target.value)} />
          <textarea placeholder="Weaknesses" value={q.consultantAssessment?.weaknesses || ""} onChange={(e) => updateNested(q.id, "consultantAssessment", "weaknesses", e.target.value)} />
          <textarea placeholder="Risks" value={q.consultantAssessment?.risks || ""} onChange={(e) => updateNested(q.id, "consultantAssessment", "risks", e.target.value)} />
          <textarea placeholder="Opportunities" value={q.consultantAssessment?.opportunities || ""} onChange={(e) => updateNested(q.id, "consultantAssessment", "opportunities", e.target.value)} />
        </div>
        <textarea placeholder="Overall assessment" value={q.consultantAssessment?.overall || ""} onChange={(e) => updateNested(q.id, "consultantAssessment", "overall", e.target.value)} />

        <h4 className="section-heading">Escalation Flags</h4>
        <div className="escalation-flag-row">
          {escalationFlagOptions.map((flag) => (
            <button
              key={flag}
              className={(q.escalationFlags || []).includes(flag) ? "escalation-chip selected" : "escalation-chip"}
              onClick={() => toggleEscalation(q.id, flag)}
            >
              {flag}
            </button>
          ))}
        </div>

        <h4 className="section-heading">Business Performance Score</h4>
        <div className="score-buttons">
          {[1, 2, 3, 4, 5].map((score) => (
            <button key={score} className={q.score === score ? "selected" : ""} onClick={() => update(q.id, { score })}>
              {score}
            </button>
          ))}
        </div>
        {q.score > 0 && q.scoringBands && (
          <div className="q-maturity-box">
            <span className="q-maturity-label">{q.scoringBands.find((b) => b.score === q.score)?.maturity}</span>
            <p>{q.scoringBands.find((b) => b.score === q.score)?.description}</p>
          </div>
        )}
        {evidenceStrength && (
          <p className="evidence-strength">
            {"★".repeat(evidenceStrength.stars)}{"☆".repeat(5 - evidenceStrength.stars)} <span>{evidenceStrength.label}</span>
          </p>
        )}
        {(() => {
          if (!(q.score > 0 && q.improvementBands)) return null;
          const band = q.improvementBands.find((b) => b.score === q.score);
          if (!band) return null;
          return (
            <div className="opportunity-box">
              <p className="q-recommendation"><b>Opportunity:</b> {band.recommendation}</p>
              {band.benefitType && <span className="benefit-type-chip">{band.benefitType}</span>}
              {band.estimationGuidance && <p className="estimation-guidance">How to size this: {band.estimationGuidance}</p>}
            </div>
          );
        })()}
        {q.score > 0 && (
          <textarea
            className={!q.justification?.trim() ? "field-required" : ""}
            placeholder="Justification for this score (required)"
            value={q.justification || ""}
            onChange={(e) => update(q.id, { justification: e.target.value })}
          />
        )}
        {q.score > 0 && (
          <label className="judgement-select">Overall Professional Judgement (required)
            <select className={!q.professionalJudgement ? "field-required" : ""} value={q.professionalJudgement || ""} onChange={(e) => update(q.id, { professionalJudgement: e.target.value })}>
              <option value="">Select...</option>
              {JUDGEMENT_OPTIONS.map((j) => <option key={j}>{j}</option>)}
            </select>
          </label>
        )}

        {crossRefs.length > 0 && (
          <div className="cross-ref-box">
            <b>You may also wish to review</b>
            <div className="cross-ref-row">
              {crossRefs.map((ref) => (
                <button key={ref.id} className="cross-ref-chip" onClick={() => jumpToConcept(ref.concept)}>
                  {ref.concept}{ref.currentlyScored ? "" : " (not yet scored)"}
                </button>
              ))}
            </div>
          </div>
        )}

        {isImprovementPlanRequired(q) && (
          <div className="improvement-plan-box">
            <h4 className="section-heading">Improvement Plan (required for a score below 4)</h4>
            <textarea placeholder="Improvement required" value={q.improvementPlan?.required || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "required", e.target.value)} />
            <textarea placeholder="Expected outcome" value={q.improvementPlan?.expectedOutcome || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "expectedOutcome", e.target.value)} />
            <textarea placeholder="Recommended actions" value={q.improvementPlan?.recommendedActions || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "recommendedActions", e.target.value)} />
            <div className="form-grid">
              <label>Priority
                <select value={q.improvementPlan?.priority || "Medium"} onChange={(e) => updateNested(q.id, "improvementPlan", "priority", e.target.value)}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Progress Status
                <select value={q.improvementPlan?.progressStatus || "Not Started"} onChange={(e) => updateNested(q.id, "improvementPlan", "progressStatus", e.target.value)}>
                  {PROGRESS_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Action Owner<input value={q.improvementPlan?.owner || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "owner", e.target.value)} /></label>
              <label>Target Score<input type="number" min="1" max="5" value={q.improvementPlan?.targetScore ?? 5} onChange={(e) => updateNested(q.id, "improvementPlan", "targetScore", Number(e.target.value))} /></label>
              <label>Target Completion Date<input type="date" value={q.improvementPlan?.targetDate || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "targetDate", e.target.value)} /></label>
              <label>Review Date<input type="date" value={q.improvementPlan?.reviewDate || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "reviewDate", e.target.value)} /></label>
            </div>
            <textarea placeholder="Business impact" value={q.improvementPlan?.businessImpact || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "businessImpact", e.target.value)} />
            <textarea placeholder="Success measure" value={q.improvementPlan?.successMeasure || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "successMeasure", e.target.value)} />
            <textarea placeholder="Consultant recommendation" value={q.improvementPlan?.consultantRecommendation || ""} onChange={(e) => updateNested(q.id, "improvementPlan", "consultantRecommendation", e.target.value)} />
            <p className="muted-small">Saving a completed plan automatically creates a live Action for this client — no need to add it again in Actions.</p>
          </div>
        )}

        <h4 className="section-heading">Recommended Action (free text, this client only)</h4>
        <textarea placeholder="Action" value={q.action} onChange={(e) => update(q.id, { action: e.target.value })} />

        <button className="guidance-toggle timeline-toggle" onClick={() => setShowTimeline(!showTimeline)}>{showTimeline ? "Hide" : "Show"} Timeline</button>
        {showTimeline && (
          <div className="timeline-box">
            <p><b>Started:</b> {q.timeline?.startedAt ? new Date(q.timeline.startedAt).toLocaleString("en-GB") : "Not yet started"}</p>
            <p><b>Last Edited:</b> {q.timeline?.lastEditedAt ? new Date(q.timeline.lastEditedAt).toLocaleString("en-GB") : "—"}</p>
            <p><b>Completed:</b> {q.timeline?.completedAt ? new Date(q.timeline.completedAt).toLocaleString("en-GB") : "Not yet complete"}</p>
            <label>Reviewed By<input value={q.timeline?.reviewedBy || ""} onChange={(e) => updateNested(q.id, "timeline", "reviewedBy", e.target.value)} /></label>
            {q.timeline?.history?.length > 0 && (
              <div className="history-log">
                <b>Review History</b>
                <ul>{q.timeline.history.map((h, i) => <li key={i}>{new Date(h.date).toLocaleString("en-GB")} — {h.event}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        <div className="q-nav">
          <button className="secondary" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(currentQuestion - 1)}>Previous Question</button>
          <button className="secondary" disabled={currentQuestion === answers.length - 1} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next Question</button>
        </div>
      </div>
    </div>
  );
}
