import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import AssessmentPanel from "../components/AssessmentPanel.jsx";
import EvidenceUploader from "../components/EvidenceUploader.jsx";
import Toast from "../components/Toast.jsx";
import { visitStages } from "../data/seedData.js";
import { calculateOverall, getClientAssessment, setClientAssessment, buildRoadmap } from "../utils/scoring.js";

export default function VisitWorkflow({ data, setData, selectedClient, setSelectedClient, setPage }) {
  const [stage, setStage] = useState(0);
  const [clientId, setClientId] = useState(selectedClient || data.clients[0]?.id || "");
  const [attendees, setAttendees] = useState(["Managing Director"]);
  const [attendee, setAttendee] = useState("");
  const [notes, setNotes] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showExplainKist, setShowExplainKist] = useState(false);
  const [followUp, setFollowUp] = useState({ date: "", start: "10:00", end: "11:00", who: "Managing Director", type: "90 Day Follow Up", location: "" });
  const [toastMessage, setToastMessage] = useState("");
  const client = data.clients.find((c) => c.id === clientId) || data.clients[0];
  const answers = getClientAssessment(data, client.id);

  useEffect(() => { setCurrentQuestion(0); }, [clientId]);

  function setAnswers(next) { setClientAssessment(data, setData, client.id, next); }
  function chooseClient(id) { setClientId(id); if (setSelectedClient) setSelectedClient(id); }
  function addAttendee() { if (attendee.trim()) { setAttendees([...attendees, attendee.trim()]); setAttendee(""); } }

  function scheduleFollowUp() {
    if (!followUp.date) { alert("Pick a date for the follow up first."); return; }
    const appointment = {
      id: "s" + Date.now(), date: followUp.date, start: followUp.start, end: followUp.end,
      clientId: client.id, client: client.name, type: followUp.type, consultant: "Carl Kirby",
      location: followUp.location || client.address || "", status: "Scheduled", colour: "green"
    };
    const timelineItem = { id: "t" + Date.now(), date: followUp.date, type: "Calendar", title: `${followUp.type} scheduled with ${followUp.who}` };
    setData({
      ...data,
      schedule: [appointment, ...data.schedule],
      clients: data.clients.map((c) => c.id === client.id ? { ...c, timeline: [timelineItem, ...(c.timeline || [])] } : c)
    });
    setToastMessage("Follow up scheduled and added to the calendar");
  }

  function finishVisit() {
    const timelineItem = { id: "t" + Date.now(), date: new Date().toISOString().slice(0, 10), type: "Visit", title: "Visit workflow completed" };
    setData({
      ...data,
      clients: data.clients.map((c) => c.id === client.id ? {
        ...c,
        status: c.status === "Prospect" ? "Active" : c.status,
        timeline: [timelineItem, ...(c.timeline || [])]
      } : c)
    });
    setToastMessage("Visit saved");
  }

  const roadmap = buildRoadmap(answers);

  return (
    <section>
      <PageHeader title="Visit Workflow" subtitle="Restored layout with embedded assessment inside the visit flow." action={<button className="primary" onClick={finishVisit}>Save Visit</button>} />
      <Toast message={toastMessage} onDone={() => setToastMessage("")} />
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

          {stage === 2 && (
            <div>
              <p className="muted">Capture site observations, risks and opportunities. Add photos as you go — each one gets its own caption, and you choose whether it appears in the client report.</p>
              <textarea placeholder="Walkthrough observations" value={notes.walkthrough || ""} onChange={(e) => setNotes({ ...notes, walkthrough: e.target.value })} />
              <h4 className="section-heading">Photos and Evidence</h4>
              <EvidenceUploader client={client} setData={setData} stage="Business Walkthrough" />
            </div>
          )}

          {stage === 3 && <AssessmentPanel data={data} setData={setData} clientId={client.id} answers={answers} setAnswers={setAnswers} currentQuestion={currentQuestion} setCurrentQuestion={setCurrentQuestion} />}

          {stage === 4 && (
            <div>
              <p className="muted">Request and review supporting documents — policies, KPI reports, certificates, anything that backs up what's been said. Upload copies here so they're kept with the visit.</p>
              <textarea placeholder="Evidence review notes" value={notes.evidence || ""} onChange={(e) => setNotes({ ...notes, evidence: e.target.value })} />
              <h4 className="section-heading">Documents and Photos</h4>
              <EvidenceUploader client={client} setData={setData} stage="Evidence Review" />
            </div>
          )}

          {stage === 5 && (
            <div>
              <p className="muted">Overall score so far: <strong className="gold">{calculateOverall(answers)}/100</strong></p>
              <p className="muted">The full report pulls live from this assessment's category scores, notes and actions, formatted for the client.</p>
              <button className="primary" onClick={() => setPage && setPage("report")}>Open Full Report</button>
            </div>
          )}

          {stage === 6 && (
            <div>
              <p className="muted">Present live to the client, full screen, using the arrow keys or the buttons to move between slides.</p>
              <button className="primary" onClick={() => setPage("present")}>Start Presentation</button>
            </div>
          )}

          {stage === 7 && (
            <div>
              <p className="muted">Built automatically from the improvement plans already recorded against low scoring BPIs, bucketed by target date where one's been set, otherwise by priority. This organises what you've already entered — it doesn't invent anything, so review and adjust before this goes in front of the client.</p>
              <div className="roadmap-columns">
                {[
                  ["Next 30 Days", roadmap.thirty],
                  ["31 to 60 Days", roadmap.sixty],
                  ["61 to 90 Days", roadmap.ninety],
                  ["Long Term", roadmap.longTerm]
                ].map(([label, items]) => (
                  <div className="roadmap-column" key={label}>
                    <h4>{label}</h4>
                    {items.length ? items.map((item) => (
                      <div className="roadmap-item" key={item.id}>
                        <strong>{item.concept}</strong>
                        <p>{item.improvementPlan.recommendedActions}</p>
                        <span className="roadmap-owner">{item.improvementPlan.owner || "Owner not set"}</span>
                      </div>
                    )) : <p className="muted-small">Nothing here yet.</p>}
                  </div>
                ))}
              </div>
              {roadmap.thirty.length + roadmap.sixty.length + roadmap.ninety.length + roadmap.longTerm.length === 0 && (
                <p className="muted">No improvement plans recorded yet — score some BPIs below 4 in the Assessment stage first, each with a completed improvement plan, and they'll appear here automatically.</p>
              )}
            </div>
          )}

          {stage === 8 && (
            <div>
              <p className="muted">Schedule the next visit properly — this creates a real calendar entry, not just a note.</p>
              <div className="form-grid">
                <label>Date<input type="date" value={followUp.date} onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })} /></label>
                <label>Start<input type="time" value={followUp.start} onChange={(e) => setFollowUp({ ...followUp, start: e.target.value })} /></label>
                <label>End<input type="time" value={followUp.end} onChange={(e) => setFollowUp({ ...followUp, end: e.target.value })} /></label>
                <label>Who With<input value={followUp.who} onChange={(e) => setFollowUp({ ...followUp, who: e.target.value })} /></label>
                <label>Visit Type
                  <select value={followUp.type} onChange={(e) => setFollowUp({ ...followUp, type: e.target.value })}>
                    <option>90 Day Follow Up</option><option>Progress Review</option><option>Reassessment</option><option>Report Presentation</option>
                  </select>
                </label>
                <label>Location<input placeholder={client.address || "Location"} value={followUp.location} onChange={(e) => setFollowUp({ ...followUp, location: e.target.value })} /></label>
              </div>
              <button className="primary" onClick={scheduleFollowUp}>Create Calendar Invite</button>
              <textarea placeholder="Any additional follow up notes" value={notes.followup || ""} onChange={(e) => setNotes({ ...notes, followup: e.target.value })} />
            </div>
          )}

          {stage === 9 && (
            <div>
              <p className="muted">Confirm everything's recorded, then save the visit. This marks the client active and adds a timeline entry — it doesn't lock anything, you can always come back and add more.</p>
              <button className="primary finish-save-button" onClick={finishVisit}>Save and Finish Visit</button>
            </div>
          )}

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
