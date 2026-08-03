import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AssessmentPanel from "../components/AssessmentPanel.jsx";
import { ReportPreview, PresentationMode } from "../components/ReportComponents.jsx";
import { visitStages } from "../data/seedData.js";
import { calculateOverall, getClientAssessment, setClientAssessment } from "../utils/scoring.js";

export default function VisitWorkflow({ data, setData, selectedClient, setSelectedClient }) {
  const [stage, setStage] = useState(0);
  const [clientId, setClientId] = useState(selectedClient || data.clients[0]?.id || "");
  const [attendees, setAttendees] = useState(["Managing Director"]);
  const [attendee, setAttendee] = useState("");
  const [notes, setNotes] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
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
              <p className="muted">Explain KIST, confirm agenda, expected finish time and attendees.</p>
              <div className="attendee-row"><input placeholder="Attendee role or name" value={attendee} onChange={(e) => setAttendee(e.target.value)} /><button className="primary" onClick={addAttendee}>Add</button></div>
              <div className="client-tags">{attendees.map((a, i) => <span key={i}>{a}<button className="chip-remove" onClick={() => setAttendees(attendees.filter((_, x) => x !== i))}>Remove</button></span>)}</div>
            </div>
          )}
          {stage === 1 && <Interview notes={notes} setNotes={setNotes} />}
          {stage === 2 && <Walkthrough notes={notes} setNotes={setNotes} />}
          {stage === 3 && <AssessmentPanel answers={answers} setAnswers={setAnswers} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} />}
          {stage === 4 && <textarea placeholder="Evidence review notes" value={notes.evidence || ""} onChange={(e) => setNotes({ ...notes, evidence: e.target.value })} />}
          {stage === 5 && <ReportPreview client={client} score={calculateOverall(answers)} />}
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
