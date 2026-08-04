import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AssessmentPanel from "../components/AssessmentPanel.jsx";
import { PresentationMode } from "../components/ReportComponents.jsx";
import { visitStages } from "../data/seedData.js";
import { calculateOverall, getClientAssessment, setClientAssessment } from "../utils/scoring.js";

export default function VisitWorkflow({ data, setData, selectedClient, setSelectedClient, setPage }) {
  const [stage, setStage] = useState(0);
  const [clientId, setClientId] = useState(selectedClient || data.clients[0]?.id || "");
  const [attendees, setAttendees] = useState(["Managing Director"]);
  const [attendee, setAttendee] = useState("");
  const [notes, setNotes] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExplainKist, setShowExplainKist] = useState(false);
  const client = data.clients.find((c) => c.id === clientId) || data.clients[0];
  const answers = getClientAssessment(data, client.id);

  useEffect(() => { setCurrentQuestion(0); }, [clientId]);

  function setAnswers(next) { setClientAssessment(data, setData, client.id, next); }
  function chooseClient(id) { setClientId(id); if (setSelectedClient) setSelectedClient(id); }
  function addAttendee() { if (attendee.trim()) { setAttendees([...attendees, attendee.trim()]); setAttendee(""); } }

  return (
    <section>
      <PageHeader title="Visit Workflow" subtitle="Restored layout with embedded assessment inside the visit flow." action={<button className="primary">Save Visit</button>} />
      <div className="visit-metrics">
        <div className="metric"><span>Client</span><strong>{client?.name}</strong></div>
        <div className="metric"><span>Stage</span><strong>{stage + 1}/10</strong></div>
        <div className="metric"><span>Progress</span><strong>{Math.round(((stage + 1) / visitStages.length) * 100)}%</strong></div>
      </div>
      <div className="visit-shell">
        <div className="stage-rail">{visitStages.map((s, i) => <button className={`stage-button ${stage === i ? "active" : ""}`} key={s} onClick={() => setStage(i)}><b>{i + 1}</b><span>{s}</span></button>)}</div>
        <div className="stage-card card">
          <h2>{visitStages[stage]}</h2>
          {stage === 0 && (
            <div>
              <label>Client<select value={clientId} onChange={(e) => chooseClient(e.target.value)}>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <p className="muted">Confirm the agenda, expected finish time and attendees.</p>

              <button className="secondary explain-kist-toggle" onClick={() => setShowExplainKist(!showExplainKist)}>
                {showExplainKist ? "Hide" : "Explain KIST"} {showExplainKist ? "" : "▾"}
              </button>
              {showExplainKist && (
                <div className="explain-kist-box">
                  <p>We're not here to audit compliance or catch anyone out with a checklist. We're here to work out, with them, why the business isn't performing where they want it to — and give them a clear, evidence based plan to close that gap.</p>
                  <p><strong>How it works, in order:</strong> we ask what they actually want to achieve, we form our own professional theory of what's likely holding them back, we test that theory through observation and evidence rather than assumption, then we deliver a prioritised roadmap tied to real commercial impact — not just a score.</p>
                  <p><strong>Worth saying out loud to the client:</strong> the score they'll eventually see is supporting evidence, not the point of the exercise. The plan is the point.</p>
                  <button className="primary print-flyer-button" onClick={() => setPage("flyer")}>Print One-Page Flyer for Client</button>
                </div>
              )}

              <div className="attendee-row"><input placeholder="Attendee role or name" value={attendee} onChange={(e) => setAttendee(e.target.value)} /><button className="primary" onClick={addAttendee}>Add</button></div>
              <div className="client-tags">{attendees.map((a, i) => <span key={i}>{a}<button className="chip-remove" onClick={() => setAttendees(attendees.filter((_, x) => x !== i))}>Remove</button></span>)}</div>
            </div>
          )}
          {stage === 1 && <Interview notes={notes} setNotes={setNotes} />}
          {stage === 2 && <Walkthrough notes={notes} setNotes={setNotes} />}
          {stage === 3 && <AssessmentPanel data={data} setData={setData} clientId={client.id} answers={answers} setAnswers={setAnswers} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} />}
          {stage === 4 && <textarea placeholder="Evidence review notes" value={notes.evidence || ""} onChange={(e) => setNotes({ ...notes, evidence: e.target.value })} />}
          {stage === 5 && (
            <div>
              <p className="muted">Overall score so far: <strong className="gold">{calculateOverall(answers)}/100</strong></p>
              <p className="muted">The full report pulls live from this assessment's category scores, notes and actions, formatted for the client.</p>
              <button className="primary" onClick={() => setPage && setPage("report")}>Open Full Report</button>
            </div>
          )}
          {stage === 6 && <PresentationMode client={client} score={calculateOverall(answers)} answers={answers} />}
          {stage === 7 && <textarea placeholder="90 day action plan" value={notes.plan || ""} onChange={(e) => setNotes({ ...notes, plan: e.target.value })} />}
          {stage === 8 && <textarea placeholder="Follow up schedule notes" value={notes.followup || ""} onChange={(e) => setNotes({ ...notes, followup: e.target.value })} />}
          {stage === 9 && <p className="muted">Finish visit, confirm agreed actions, save notes and generate next steps.</p>}
          <div className="wizard-actions"><button className="secondary" disabled={stage === 0} onClick={() => setStage(stage - 1)}>Back</button><button className="primary" disabled={stage === visitStages.length - 1} onClick={() => setStage(stage + 1)}>Next</button></div>
        </div>
      </div>
    </section>
  );
}

function Interview({ notes, setNotes }) {
  const fields = ["Business overview", "Three year change", "Biggest concerns", "Opportunities", "Frustrations", "Future ambition"];
  return <div>{fields.map((field) => <label key={field}>{field}<textarea value={notes[field] || ""} onChange={(e) => setNotes({ ...notes, [field]: e.target.value })} /></label>)}</div>;
}

function Walkthrough({ notes, setNotes }) {
  return (
    <div>
      <p className="muted">Capture site observations, risks, opportunities and photo notes.</p>
      <textarea placeholder="Walkthrough observations" value={notes.walkthrough || ""} onChange={(e) => setNotes({ ...notes, walkthrough: e.target.value })} />
      <textarea placeholder="Photo evidence notes" value={notes.photos || ""} onChange={(e) => setNotes({ ...notes, photos: e.target.value })} />
    </div>
  );
}
