import { useState } from "react";
import { Tag, Mail, Phone } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

export default function Client({ data, setData, selectedClient, setPage, setCalendarAnchor }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ date: "2026-07-08", start: "09:00", end: "10:00", type: "First Consultation", consultant: "Carl Kirby", location: client.address || "" });

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
        <div className="card">
          <h2>Quick Actions</h2>
          <button className="primary" onClick={() => setShowBooking(!showBooking)}>Schedule Consultation</button><br /><br />
          <button className="secondary" onClick={() => setPage("visits")}>Start Visit Workflow</button><br /><br />
          <button className="secondary" onClick={() => setPage("assessments")}>Start Assessment</button><br /><br />
          <button className="secondary" onClick={() => setPage("reports")}>Generate Report</button>
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
