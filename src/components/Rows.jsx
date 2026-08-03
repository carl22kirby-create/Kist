export function ClientRows({ clients, setPage, setSelectedClient }) {
  return (
    <div>
      {clients.map((c) => (
        <button className="row" key={c.id} onClick={() => { setSelectedClient(c.id); setPage("client"); }}>
          <span><strong>{c.name}</strong><small>{c.industry} · {c.health}</small></span>
          <b>{c.score}</b>
        </button>
      ))}
    </div>
  );
}

export function ScheduleRows({ schedule }) {
  return (
    <div>
      {schedule.map((s) => (
        <div className="row" key={s.id}>
          <span><strong>{s.client}</strong><small>{s.date} · {s.start} to {s.end}</small></span>
          <b>{s.status}</b>
        </div>
      ))}
    </div>
  );
}

export function ScoreRows({ clients }) {
  return (
    <div>
      {clients.map((c) => (
        <div className="row" key={c.id}>
          <span><strong>{c.name}</strong><small>Previous {c.previous} · Current {c.score}</small></span>
          <b>{c.score - c.previous >= 0 ? "+" : ""}{c.score - c.previous}</b>
        </div>
      ))}
    </div>
  );
}

export function ReportRows({ reports, setPage, setSelectedClient }) {
  return (
    <div>
      {reports.map((r) => (
        <button
          className="row"
          key={r.id}
          onClick={() => { if (setSelectedClient) setSelectedClient(r.clientId); if (setPage) setPage("client"); }}
        >
          <span><strong>{r.client}</strong><small>{r.title}</small></span>
          <b>{r.status}</b>
        </button>
      ))}
    </div>
  );
}
