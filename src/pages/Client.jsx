import { useState } from "react";
import { Tag, Mail, Phone, Layers, Target, FlaskConical } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { industryOptions, capabilityOptions, regulatoryOptions, dependencyQuestions, businessObjectiveOptions, conceptNames } from "../data/knowledgeBase.js";
import { activeModulesForProfile, activeExclusionsForProfile } from "../utils/assessmentEngine.js";
import { getClientAssessment, reviewHypothesis } from "../utils/scoring.js";

export default function Client({ data, setData, selectedClient, setPage, setCalendarAnchor }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHypothesisEditor, setShowHypothesisEditor] = useState(false);
  const [booking, setBooking] = useState({ date: "2026-07-08", start: "09:00", end: "10:00", type: "First Consultation", consultant: "Carl Kirby", location: client.address || "" });
  const profile = client.profile || { industry: "Other", capabilities: [], regulations: [], dependencies: {}, objectives: [], threeProblems: "", hypothesis: null };
  const activeModules = activeModulesForProfile(profile);
  const activeExclusions = activeExclusionsForProfile(profile);
  const assessmentAnswers = getClientAssessment(data, client.id);
  const hypothesisReview = reviewHypothesis(assessmentAnswers, profile.hypothesis);

  function updateProfile(next) {
    setData({ ...data, clients: data.clients.map((c) => c.id === client.id ? { ...c, profile: next } : c) });
  }
  function toggleInProfile(key, value) {
    const list = profile[key] || [];
    updateProfile({ ...profile, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  }
  function setDependency(field, value) {
    updateProfile({ ...profile, dependencies: { ...(profile.dependencies || {}), [field]: value } });
  }
  function updateHypothesis(field, value) {
    const current = profile.hypothesis || { statement: "", targetConcepts: [], formedDate: new Date().toISOString().slice(0, 10) };
    updateProfile({ ...profile, hypothesis: { ...current, [field]: value } });
  }
  function toggleHypothesisTarget(name) {
    const current = profile.hypothesis || { statement: "", targetConcepts: [], formedDate: new Date().toISOString().slice(0, 10) };
    const list = current.targetConcepts || [];
    updateHypothesis("targetConcepts", list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);
  }

  function book() {
    const appointment = { id: "s" + Date.now(), date: booking.date, start: booking.start, end: booking.end, clientId: client.id, client: client.name, type: booking.type, consultant: booking.consultant, location: booking.location, status: "Scheduled", colour: "gold" };
    const timelineItem = { id: "t" + Date.now(), date: booking.date, type: "Calendar", title: `${booking.type} scheduled` };
    setData({ ...data, schedule: [appointment, ...data.schedule], clients: data.clients.map((c) => c.id === client.id ? { ...c, timeline: [timelineItem, ...(c.timeline || [])] } : c) });
    setCalendarAnchor(booking.date); setPage("calendar");
  }

  return (
    <section>
      <PageHeader title={client.name} subtitle="Client workspace, contacts, diary, reports, timeline and actions." action={<button className="secondary" onClick={() => setPage("clients")}>Back</button>} />
      <div className="grid">
        <div className="card wide">
          <h2>Client Overview</h2>
          <p className="muted">{client.notes || "No notes recorded yet."}</p>
          <div className="detail-grid">
            <p><strong>Industry:</strong> {client.industry}</p>
            <p><strong>Size:</strong> {client.size || "Not set"}</p>
            <p><strong>Turnover:</strong> {client.turnover || "Not set"}</p>
            <p><strong>Website:</strong> {client.website || "Not set"}</p>
            <p><strong>Address:</strong> {client.address || "Not set"}</p>
            <p><strong>Status:</strong> {client.status}</p>
          </div>
          <div className="client-tags">{(client.tags || []).map((t) => <span key={t}><Tag size={12} />{t}</span>)}</div>
        </div>
        <div className="card wide objectives-card">
          <h2><Target size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />What This Client Wants to Achieve</h2>
          <p className="muted">The primary driver of this assessment. The Business Performance Score still matters, but it's evidence supporting these objectives, not the main product.</p>
          <textarea placeholder="In their own words: if we could only solve three problems, what would success look like?" value={profile.threeProblems || ""} onChange={(e) => updateProfile({ ...profile, threeProblems: e.target.value })} />
          <div className="checklist">
            {businessObjectiveOptions.map((obj) => (
              <label className="check-row" key={obj}>
                <input type="checkbox" checked={(profile.objectives || []).includes(obj)} onChange={() => toggleInProfile("objectives", obj)} />
                {obj}
              </label>
            ))}
          </div>
        </div>
        <div className="card wide hypothesis-card">
          <h2><FlaskConical size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Consultancy Hypothesis</h2>
          <p className="muted">The working theory of what's actually limiting the objectives above, formed before the evidence is gathered and tested against it as BPIs get scored.</p>
          {hypothesisReview && (
            <div className={`hypothesis-status hypothesis-status-${hypothesisReview.status.replace(/\s+/g, "-").toLowerCase()}`}>
              {hypothesisReview.status}{hypothesisReview.averageScore != null && ` — average score ${hypothesisReview.averageScore}/5 across target BPIs`}
            </div>
          )}
          <button className="secondary" onClick={() => setShowHypothesisEditor(!showHypothesisEditor)}>{showHypothesisEditor ? "Hide" : profile.hypothesis ? "Edit" : "Form"} Hypothesis</button>
          {!showHypothesisEditor && profile.hypothesis?.statement && <p className="hypothesis-statement">"{profile.hypothesis.statement}"</p>}
          {showHypothesisEditor && (
            <div className="profile-editor">
              <textarea placeholder="Working theory: e.g. 'Growth is limited by weak digital conversion, not capacity.'" value={profile.hypothesis?.statement || ""} onChange={(e) => updateHypothesis("statement", e.target.value)} />
              <h4 className="profile-subhead">Which BPIs is this hypothesis actually about?</h4>
              <div className="checklist">
                {conceptNames.map((name) => (
                  <label className="check-row" key={name}>
                    <input type="checkbox" checked={(profile.hypothesis?.targetConcepts || []).includes(name)} onChange={() => toggleHypothesisTarget(name)} />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <h2>Quick Actions</h2>
          <button className="primary" onClick={() => setShowBooking(!showBooking)}>Schedule Consultation</button><br /><br />
          <button className="secondary" onClick={() => setPage("visits")}>Start Visit Workflow</button><br /><br />
          <button className="secondary" onClick={() => setPage("assessments")}>Start Assessment</button><br /><br />
          <button className="secondary" onClick={() => setPage("report")}>View Full Report</button>
        </div>
        <div className="card">
          <h2>Contacts</h2>
          {(client.contacts || []).map((contact) => (
            <div className="contact-card" key={contact.id}>
              <strong>{contact.name}</strong><small>{contact.role}</small>
              <span><Mail size={14} />{contact.email}</span>
              <span><Phone size={14} />{contact.phone}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Upcoming Diary</h2>
          {data.schedule.filter((s) => s.clientId === client.id).length
            ? data.schedule.filter((s) => s.clientId === client.id).map((s) => (
              <div className="row" key={s.id}><span><strong>{s.type}</strong><small>{s.date} · {s.start} to {s.end}</small></span><b>{s.status}</b></div>
            ))
            : <p className="muted">No diary entries yet.</p>}
        </div>
        <div className="card wide">
          <h2><Layers size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Business Profile and Active Modules</h2>
          <p className="muted">This drives which assessment questions apply to this client — the engine assembles a different question set per client based on what's selected here.</p>
          <div className="module-chip-row">
            {activeModules.map((m) => <span className={`module-chip module-chip-${m.type.toLowerCase().replace(/\s+/g, "-")}`} key={m.type + m.name}>{m.name}</span>)}
          </div>
          {activeExclusions.length > 0 && (
            <div className="exclusion-row">
              {activeExclusions.map((ex) => <span className="exclusion-chip" key={ex.tag}>Excluded: {ex.tag}</span>)}
            </div>
          )}
          <button className="secondary" onClick={() => setShowProfile(!showProfile)}>{showProfile ? "Hide" : "Edit"} Business Profile</button>
          {showProfile && (
            <div className="profile-editor">
              <label>Primary Industry Module
                <select value={profile.industry || "Other"} onChange={(e) => updateProfile({ ...profile, industry: e.target.value })}>
                  {industryOptions.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
              <h4 className="profile-subhead">Capabilities</h4>
              <div className="checklist">
                {capabilityOptions.map((cap) => (
                  <label className="check-row" key={cap}>
                    <input type="checkbox" checked={(profile.capabilities || []).includes(cap)} onChange={() => toggleInProfile("capabilities", cap)} />
                    {cap}
                  </label>
                ))}
              </div>
              <h4 className="profile-subhead">Regulatory Frameworks</h4>
              <div className="checklist">
                {regulatoryOptions.map((reg) => (
                  <label className="check-row" key={reg}>
                    <input type="checkbox" checked={(profile.regulations || []).includes(reg)} onChange={() => toggleInProfile("regulations", reg)} />
                    {reg}
                  </label>
                ))}
              </div>
              <h4 className="profile-subhead">Business Characteristics</h4>
              <p className="muted">A "No" here hard removes every related question, even if a capability above suggests otherwise.</p>
              <div className="dependency-list">
                {dependencyQuestions.map((dep) => {
                  const current = (profile.dependencies || {})[dep.field];
                  return (
                    <div className="dependency-row" key={dep.field}>
                      <span>{dep.label}</span>
                      <div className="dependency-buttons">
                        <button type="button" className={current === true ? "dep-yes selected" : "dep-yes"} onClick={() => setDependency(dep.field, true)}>Yes</button>
                        <button type="button" className={current === false ? "dep-no selected" : "dep-no"} onClick={() => setDependency(dep.field, false)}>No</button>
                        <button type="button" className={current == null ? "dep-unknown selected" : "dep-unknown"} onClick={() => setDependency(dep.field, null)}>Not Yet Known</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="card wide">
          <h2>Client Timeline</h2>
          {(client.timeline || []).map((item) => (
            <div className="timeline-row" key={item.id}><b>{item.date}</b><span><strong>{item.type}</strong><small>{item.title}</small></span></div>
          ))}
        </div>
      </div>
      {showBooking && (
        <div className="card booking-panel">
          <h2>Schedule Consultation</h2>
          <div className="form-grid">
            <label>Date<input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} /></label>
            <label>Start<input type="time" value={booking.start} onChange={(e) => setBooking({ ...booking, start: e.target.value })} /></label>
            <label>End<input type="time" value={booking.end} onChange={(e) => setBooking({ ...booking, end: e.target.value })} /></label>
            <label>Visit type
              <select value={booking.type} onChange={(e) => setBooking({ ...booking, type: e.target.value })}>
                <option>First Consultation</option><option>Discovery Call</option><option>Business Assessment</option>
                <option>Site Visit</option><option>Report Review</option><option>90 Day Follow Up</option>
              </select>
            </label>
            <label>Consultant<input value={booking.consultant} onChange={(e) => setBooking({ ...booking, consultant: e.target.value })} /></label>
            <label>Location<input value={booking.location} onChange={(e) => setBooking({ ...booking, location: e.target.value })} /></label>
          </div>
          <button className="primary" onClick={book}>Book and Open Calendar</button>
        </div>
      )}
    </section>
  );
}
