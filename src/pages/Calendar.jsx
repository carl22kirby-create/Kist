import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { dateToParts, formatDate, startOfWeek, addDays, addMonths, addYears } from "../utils/dates.js";

export default function Calendar({ data, setData, calendarAnchor, setCalendarAnchor, setPage, setSelectedClient }) {
  const [view, setView] = useState("week");
  const [selected, setSelected] = useState(null);
  const anchorDate = dateToParts(calendarAnchor);
  const weekStart = startOfWeek(anchorDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const monthCells = Array.from({ length: 42 }, (_, i) => addDays(startOfWeek(monthStart), i));

  function update(id, updates) {
    const nextSchedule = data.schedule.map((item) => (item.id === id ? { ...item, ...updates } : item));
    const updated = nextSchedule.find((item) => item.id === id);
    setData({ ...data, schedule: nextSchedule }); setSelected(updated);
  }
  function addEntry() {
    const client = data.clients[0];
    const item = { id: "s" + Date.now(), date: calendarAnchor, start: "09:00", end: "10:00", clientId: client.id, client: client.name, type: "First Consultation", consultant: "Carl Kirby", location: client.address || "", status: "Scheduled", colour: "gold" };
    setData({ ...data, schedule: [item, ...data.schedule] }); setSelected(item);
  }
  function jumpYear(year) {
    const next = new Date(anchorDate); next.setFullYear(Number(year)); setCalendarAnchor(formatDate(next));
  }
  function openVisit() {
    if (!selected) return;
    setSelectedClient(selected.clientId);
    setPage("visits");
  }

  return (
    <section>
      <PageHeader title="Calendar" subtitle="Calendar retained. Day, week, month, year and list views. Jump to 2035." action={<button className="primary" onClick={addEntry}>Add Diary Entry</button>} />
      <div className="calendar-top">
        <div className="calendar-toolbar">{["day", "week", "month", "year", "list"].map((v) => <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>{v}</button>)}</div>
        <div className="calendar-nav">
          <button className="secondary" onClick={() => setCalendarAnchor(formatDate(view === "month" ? addMonths(anchorDate, -1) : view === "year" ? addYears(anchorDate, -1) : addDays(anchorDate, -7)))}><ArrowLeft size={16} /> Previous</button>
          <input type="date" value={calendarAnchor} onChange={(e) => setCalendarAnchor(e.target.value)} />
          <select value={anchorDate.getFullYear()} onChange={(e) => jumpYear(e.target.value)}>{Array.from({ length: 40 }, (_, i) => 2026 + i).map((y) => <option key={y}>{y}</option>)}</select>
          <button className="secondary" onClick={() => setCalendarAnchor("2035-01-01")}>Jump to 2035</button>
          <button className="secondary" onClick={() => setCalendarAnchor(formatDate(view === "month" ? addMonths(anchorDate, 1) : view === "year" ? addYears(anchorDate, 1) : addDays(anchorDate, 7)))}>Next <ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="calendar-layout">
        <div className="card">
          {view === "week" && (
            <div className="week">
              {weekDates.map((date) => {
                const ds = formatDate(date);
                return (
                  <div className="day" key={ds}>
                    <h3>{date.toLocaleDateString("en-GB", { weekday: "long" })}<br /><small>{ds}</small></h3>
                    {data.schedule.filter((item) => item.date === ds).map((item) => (
                      <button className={`event ${item.colour || "gold"}`} key={item.id} onClick={() => setSelected(item)}><b>{item.start}</b><strong>{item.client}</strong><span>{item.type}</span></button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {view === "day" && data.schedule.filter((item) => item.date === calendarAnchor).map((item) => (
            <button className="row" key={item.id} onClick={() => setSelected(item)}><span><strong>{item.client}</strong><small>{item.start} to {item.end} · {item.type}</small></span><b>{item.status}</b></button>
          ))}
          {view === "month" && (
            <div className="month">
              {monthCells.map((date) => {
                const ds = formatDate(date);
                return (
                  <div className="month-cell" key={ds}>
                    <b>{date.getDate()}</b>
                    {data.schedule.filter((item) => item.date === ds).map((item) => (
                      <button className="event compact" key={item.id} onClick={() => setSelected(item)}>{item.client}</button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {view === "year" && (
            <div className="year-grid">
              {Array.from({ length: 12 }, (_, i) => {
                const month = new Date(anchorDate.getFullYear(), i, 1);
                const count = data.schedule.filter((item) => item.date.startsWith(`${anchorDate.getFullYear()}-${String(i + 1).padStart(2, "0")}`)).length;
                return (
                  <button className="year-card" key={i} onClick={() => { setCalendarAnchor(formatDate(month)); setView("month"); }}>
                    <strong>{month.toLocaleDateString("en-GB", { month: "long" })}</strong><span>{count} appointments</span>
                  </button>
                );
              })}
            </div>
          )}
          {view === "list" && data.schedule.filter((item) => item.date.slice(0, 4) === String(anchorDate.getFullYear())).sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).map((item) => (
            <button className="row" key={item.id} onClick={() => setSelected(item)}><span><strong>{item.client}</strong><small>{item.date} · {item.start} to {item.end} · {item.type}</small></span><b>{item.status}</b></button>
          ))}
        </div>
        <div className="card">
          <h2>Appointment</h2>
          {selected ? (
            <div className="editor">
              <label>Client
                <select value={selected.clientId || ""} onChange={(e) => { const client = data.clients.find((c) => c.id === e.target.value); update(selected.id, { clientId: client.id, client: client.name, location: client.address || selected.location }); }}>
                  {data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              {["date", "start", "end", "type", "consultant", "location", "status"].map((key) => (
                <label key={key}>{key}<input type={key === "date" ? "date" : key === "start" || key === "end" ? "time" : "text"} value={selected[key] || ""} onChange={(e) => update(selected.id, { [key]: e.target.value })} /></label>
              ))}
              <button className="primary" onClick={openVisit}>Open Visit</button>
              <button className="secondary" onClick={() => { const copy = { ...selected, id: "s" + Date.now(), start: "13:00", end: "14:00" }; setData({ ...data, schedule: [copy, ...data.schedule] }); setSelected(copy); }}>Duplicate</button>
              <button className="danger" onClick={() => update(selected.id, { status: "Cancelled" })}>Cancel Visit</button>
            </div>
          ) : <p className="muted">Select an appointment to edit it. Reschedule updates Dashboard.</p>}
        </div>
      </div>
    </section>
  );
}
