import { useState } from "react";
import { industryOptions, capabilityOptions, regulatoryOptions, dependencyQuestions } from "../data/knowledgeBase.js";

export default function ClientOnboarding({ data, setData, setPage, setSelectedClient, setCalendarAnchor, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", industry: "", size: "", turnover: "", website: "", address: "",
    profileIndustry: "Other", capabilities: [], regulations: [],
    dependencies: Object.fromEntries(dependencyQuestions.map((d) => [d.field, null])),
    contactName: "", contactRole: "Managing Director", email: "", phone: "",
    tags: "", notes: "", scheduleConsultation: true,
    consultationDate: "2026-07-08", consultationStart: "09:00", consultationEnd: "10:00",
    consultationType: "First Consultation", consultant: "Carl Kirby", location: ""
  });
  const update = (k, v) => setForm({ ...form, [k]: v });
  const toggleInList = (key, value) => {
    const list = form[key];
    update(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };
  const setDependency = (field, value) => update("dependencies", { ...form.dependencies, [field]: value });

  function save() {
    if (!form.name.trim()) { alert("Please enter a company name."); setStep(1); return; }
    const clientId = "c" + Date.now();
    const client = {
      id: clientId, name: form.name, industry: form.industry || "Not set", size: form.size,
      turnover: form.turnover, website: form.website, address: form.address, score: 0, previous: 0,
      health: "New", status: "Prospect", tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: form.notes,
      profile: { industry: form.profileIndustry, capabilities: form.capabilities, regulations: form.regulations, dependencies: form.dependencies },
      contacts: [{ id: "p" + Date.now(), name: form.contactName, role: form.contactRole, email: form.email, phone: form.phone, primary: true }],
      timeline: [{ id: "t" + Date.now(), date: new Date().toISOString().slice(0, 10), type: "Client", title: "Client created" }]
    };
    const next = { ...data, clients: [client, ...data.clients] };
    if (form.scheduleConsultation) {
      const appointment = {
        id: "s" + Date.now(), date: form.consultationDate, start: form.consultationStart, end: form.consultationEnd,
        clientId, client: client.name, type: form.consultationType, consultant: form.consultant,
        location: form.location || form.address, status: "Scheduled", colour: "gold"
      };
      next.schedule = [appointment, ...data.schedule];
      next.clients = next.clients.map((c) => c.id === clientId ? { ...c, timeline: [...c.timeline, { id: "t" + Date.now() + "b", date: form.consultationDate, type: "Calendar", title: `${form.consultationType} scheduled` }] } : c);
      setCalendarAnchor(form.consultationDate); setData(next); setSelectedClient(clientId); setPage("calendar");
    } else {
      setData(next); setSelectedClient(clientId); setPage("client");
    }
  }

  const totalSteps = 5;

  return (
    <div className="card onboarding-card">
      <div className="wizard-head"><div><h2>Add Client and Book First Consultation</h2><p>Step {step} of {totalSteps}</p></div><button className="secondary" onClick={onClose}>Close</button></div>
      <div className="wizard-progress"><span style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
      {step === 1 && (
        <div>
          <h3>Company Details</h3>
          <div className="form-grid">
            <input placeholder="Company name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <input placeholder="Industry (display label)" value={form.industry} onChange={(e) => update("industry", e.target.value)} />
            <input placeholder="Company size" value={form.size} onChange={(e) => update("size", e.target.value)} />
            <input placeholder="Turnover" value={form.turnover} onChange={(e) => update("turnover", e.target.value)} />
            <input placeholder="Website" value={form.website} onChange={(e) => update("website", e.target.value)} />
            <input placeholder="Address / location" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3>Business Profile</h3>
          <p className="muted">This determines which assessment modules apply — the client only sees questions relevant to how their business actually operates.</p>
          <label>Primary Industry Module
            <select value={form.profileIndustry} onChange={(e) => update("profileIndustry", e.target.value)}>
              {industryOptions.map((i) => <option key={i}>{i}</option>)}
            </select>
          </label>
          <h4 className="profile-subhead">Capabilities</h4>
          <div className="checklist">
            {capabilityOptions.map((cap) => (
              <label className="check-row" key={cap}>
                <input type="checkbox" checked={form.capabilities.includes(cap)} onChange={() => toggleInList("capabilities", cap)} />
                {cap}
              </label>
            ))}
          </div>
          <h4 className="profile-subhead">Regulatory Frameworks</h4>
          <div className="checklist">
            {regulatoryOptions.map((reg) => (
              <label className="check-row" key={reg}>
                <input type="checkbox" checked={form.regulations.includes(reg)} onChange={() => toggleInList("regulations", reg)} />
                {reg}
              </label>
            ))}
          </div>
          <h4 className="profile-subhead">Business Characteristics</h4>
          <p className="muted">Answering these shrinks the assessment automatically — a "No" here hard removes every related question, even if a capability above suggests otherwise.</p>
          <div className="dependency-list">
            {dependencyQuestions.map((dep) => (
              <div className="dependency-row" key={dep.field}>
                <span>{dep.label}</span>
                <div className="dependency-buttons">
                  <button type="button" className={form.dependencies[dep.field] === true ? "dep-yes selected" : "dep-yes"} onClick={() => setDependency(dep.field, true)}>Yes</button>
                  <button type="button" className={form.dependencies[dep.field] === false ? "dep-no selected" : "dep-no"} onClick={() => setDependency(dep.field, false)}>No</button>
                  <button type="button" className={form.dependencies[dep.field] === null ? "dep-unknown selected" : "dep-unknown"} onClick={() => setDependency(dep.field, null)}>Not Yet Known</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3>Primary Contact</h3>
          <div className="form-grid">
            <input placeholder="Contact name" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
            <input placeholder="Role" value={form.contactRole} onChange={(e) => update("contactRole", e.target.value)} />
            <input placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>
      )}
      {step === 4 && (
        <div>
          <h3>Client Notes and Tags</h3>
          <input placeholder="Tags separated by commas" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
          <textarea placeholder="Initial notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
      )}
      {step === 5 && (
        <div>
          <h3>First Consultation</h3>
          <label className="check-row">
            <input type="checkbox" checked={form.scheduleConsultation} onChange={(e) => update("scheduleConsultation", e.target.checked)} />
            Schedule first consultation now
          </label>
          {form.scheduleConsultation && (
            <div className="consultation-box">
              <div className="form-grid">
                <label>Date<input type="date" value={form.consultationDate} onChange={(e) => update("consultationDate", e.target.value)} /></label>
                <label>Start<input type="time" value={form.consultationStart} onChange={(e) => update("consultationStart", e.target.value)} /></label>
                <label>End<input type="time" value={form.consultationEnd} onChange={(e) => update("consultationEnd", e.target.value)} /></label>
                <label>Visit type
                  <select value={form.consultationType} onChange={(e) => update("consultationType", e.target.value)}>
                    <option>First Consultation</option><option>Discovery Call</option><option>Business Assessment</option>
                    <option>Site Visit</option><option>Report Review</option>
                  </select>
                </label>
                <label>Consultant<input value={form.consultant} onChange={(e) => update("consultant", e.target.value)} /></label>
                <label>Location<input value={form.location} onChange={(e) => update("location", e.target.value)} /></label>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="wizard-actions">
        <button className="secondary" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</button>
        {step < totalSteps ? <button className="primary" onClick={() => setStep(step + 1)}>Next</button> : <button className="primary" onClick={save}>Save Client and Continue</button>}
      </div>
    </div>
  );
}
