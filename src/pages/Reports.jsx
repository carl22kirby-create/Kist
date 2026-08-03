import PageHeader from "../components/PageHeader.jsx";

export default function Reports({ data, setPage, setSelectedClient }) {
  function openReport(clientId) {
    setSelectedClient(clientId);
    setPage("report");
  }

  return (
    <section>
      <PageHeader title="Reports" subtitle="Report queue. Opens the full client report, ready to print or save as PDF." />
      <div className="card">
        <h2>Reports Due</h2>
        {data.reports.map((r) => (
          <div className="row" key={r.id}>
            <span><strong>{r.client}</strong><small>{r.title}</small></span>
            <b>{r.status}</b>
            <button className="secondary" onClick={() => openReport(r.clientId)}>Open Report</button>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>All Clients</h2>
        {data.clients.map((c) => (
          <div className="row" key={c.id}>
            <span><strong>{c.name}</strong><small>{c.industry}</small></span>
            <b>{c.score}</b>
            <button className="secondary" onClick={() => openReport(c.id)}>Open Report</button>
          </div>
        ))}
      </div>
    </section>
  );
}
