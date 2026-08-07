import { getClientScoreSummary } from "../utils/scoring.js";

export function ClientRows({ data, setPage, setSelectedClient }) {
  return (
    <div>
      {data.clients.map((c) => {
        const { overall, tier, hasAssessment } = getClientScoreSummary(data, c.id);
        return (
          <button className="row" key={c.id} onClick={() => { setSelectedClient(c.id); setPage("client"); }}>
            <span><strong>{c.name}</strong><small>{c.industry} · {hasAssessment ? tier.tier : "Not yet assessed"}</small></span>
            <b>{hasAssessment ? overall : "—"}</b>
          </button>
        );
      })}
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

export function ScoreRows({ data }) {
  return (
    <div>
      {data.clients.map((c) => {
        const { overall, previousOverall, hasAssessment } = getClientScoreSummary(data, c.id);
        const delta = hasAssessment && previousOverall != null ? overall - previousOverall : null;
        return (
          <div className="row" key={c.id}>
            <span>
              <strong>{c.name}</strong>
              <small>{previousOverall != null ? `Previous ${previousOverall} · ` : ""}Current {hasAssessment ? overall : "Not yet assessed"}</small>
            </span>
            <b>{delta != null ? `${delta >= 0 ? "+" : ""}${delta}` : "—"}</b>
          </div>
        );
      })}
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

export function EscalationRows({ escalations, setPage, setSelectedClient }) {
  return (
    <div>
      {escalations.map((e) => (
        <button
          className="row"
          key={`${e.clientId}-${e.id}`}
          onClick={() => { setSelectedClient(e.clientId); setPage("client"); }}
        >
          <span><strong>{e.clientName}</strong><small>{e.concept} · {e.category}</small></span>
          <b>{e.flags.join(", ")}</b>
        </button>
      ))}
    </div>
  );
}
