import { useState } from "react";
import { Plus, LayoutDashboard } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import BusinessDNA from "../components/BusinessDNA.jsx";
import { ClientRows, ScheduleRows, ScoreRows, ReportRows, EscalationRows } from "../components/Rows.jsx";
import { getAllEscalations } from "../utils/scoring.js";

const DEFAULT_WIDGETS = { metrics: true, diary: true, health: true, dna: true, reports: true, actions: true, ai: true };

export default function Dashboard({ data, setData, setPage, setSelectedClient, setCalendarAnchor }) {
  const [detail, setDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const widgets = data.widgets || DEFAULT_WIDGETS;
  const escalations = getAllEscalations(data);

  function saveWidgets(next) {
    setData({ ...data, widgets: next });
  }

  const average = Math.round(data.clients.reduce((sum, c) => sum + (c.score || 0), 0) / data.clients.length);
  const upcoming = [...data.schedule].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).slice(0, 6);
  const openCalendar = () => { setCalendarAnchor(upcoming[0]?.date || "2026-07-06"); setPage("calendar"); };

  return (
    <section>
      <PageHeader
        title="KIST One Dashboard"
        subtitle="Clickable command centre. Cards open their detail and remain synced with calendar and CRM."
        action={
          <div className="action-row">
            <button className="primary" onClick={() => setPage("clients")}><Plus size={16} /> Add Client</button>
            <button className="secondary" onClick={openCalendar}>Open Calendar</button>
            <button className="secondary" onClick={() => setShowEdit(!showEdit)}><LayoutDashboard size={16} /> Customise</button>
          </div>
        }
      />
      {showEdit && (
        <div className="card protected">
          <h2>Customise Dashboard</h2>
          <div className="checklist">
            {Object.keys(widgets).map((key) => (
              <label className="check-row" key={key}>
                <input type="checkbox" checked={widgets[key]} onChange={() => saveWidgets({ ...widgets, [key]: !widgets[key] })} />
                {key}
              </label>
            ))}
          </div>
        </div>
      )}
      {detail && (
        <div className="card detail-panel">
          <div className="detail-head"><h2>{detail.title}</h2><button className="secondary" onClick={() => setDetail(null)}>Close</button></div>
          {detail.body}
        </div>
      )}
      {widgets.metrics && (
        <div className="metrics">
          <button className="metric" onClick={() => setDetail({ title: "Active Clients", body: <ClientRows clients={data.clients} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <span>Clients</span><strong>{data.clients.length}</strong><em>click to view</em>
          </button>
          <button className="metric" onClick={() => setDetail({ title: "Diary Entries", body: <ScheduleRows schedule={data.schedule} /> })}>
            <span>Diary Entries</span><strong>{data.schedule.length}</strong><em>click to view</em>
          </button>
          <button className="metric" onClick={() => setDetail({ title: "Average Score", body: <ScoreRows clients={data.clients} /> })}>
            <span>Average Score</span><strong>{average}</strong><em>click to inspect</em>
          </button>
          <button className="metric" onClick={() => setDetail({ title: "Reports Due", body: <ReportRows reports={data.reports} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <span>Reports Due</span><strong>{data.reports.length}</strong><em>click to view</em>
          </button>
        </div>
      )}
      <div className="grid">
        {widgets.diary && (
          <button className="widget wide" onClick={openCalendar}>
            <h2>Diary</h2>
            {upcoming.map((item) => (
              <div className="row" key={item.id}>
                <span><strong>{item.client}</strong><small>{item.date} · {item.start} to {item.end} · {item.type}</small></span>
                <b>{item.status}</b>
              </div>
            ))}
            <em>Click to open full calendar.</em>
          </button>
        )}
        {widgets.health && (
          <button className="widget" onClick={() => setDetail({ title: "Client Health", body: <ClientRows clients={data.clients} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <h2>Client Health</h2>
            {data.clients.map((client) => (
              <div className="row" key={client.id}>
                <span><strong>{client.name}</strong><small>{client.industry} · {client.health}</small></span>
                <b>{client.score}</b>
              </div>
            ))}
          </button>
        )}
        {widgets.dna && (
          <button className="widget" onClick={() => setPage("analytics")}>
            <h2>KIST Business DNA</h2>
            <BusinessDNA />
          </button>
        )}
        {widgets.reports && (
          <button className="widget" onClick={() => setDetail({ title: "Reports Due", body: <ReportRows reports={data.reports} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <h2>Reports Due</h2>
            {data.reports.map((r) => (
              <div className="row" key={r.id}>
                <span><strong>{r.client}</strong><small>{r.title}</small></span>
                <b>{r.status}</b>
              </div>
            ))}
          </button>
        )}
        {widgets.actions && (
          <button className="widget" onClick={() => setPage("actions")}>
            <h2>Open Actions</h2>
            {data.actions.map((a) => (
              <div className="row" key={a.id}>
                <span><strong>{a.title}</strong><small>{a.client} · {a.owner}</small></span>
                <b>{a.priority}</b>
              </div>
            ))}
          </button>
        )}
        {widgets.ai && (
          <button className="widget" onClick={() => setPage("ai")}>
            <h2>AI Alerts</h2>
            <p className="muted">ABC Engineering has high operational risk. Suggested action: process mapping workshop.</p>
            <p className="muted">Demo Company has a report due. Suggested action: complete executive summary.</p>
          </button>
        )}
        {escalations.length > 0 && (
          <button className="widget escalation-widget" onClick={() => setDetail({ title: "Escalations", body: <EscalationRows escalations={escalations} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <h2>Escalations</h2>
            {escalations.slice(0, 4).map((e) => (
              <div className="row" key={`${e.clientId}-${e.id}`}>
                <span><strong>{e.clientName}</strong><small>{e.concept} · {e.flags.join(", ")}</small></span>
                <b className="escalation-count">{e.flags.length}</b>
              </div>
            ))}
            {escalations.length > 4 && <em>+{escalations.length - 4} more</em>}
          </button>
        )}
      </div>
    </section>
  );
}
