import PageHeader from "../components/PageHeader.jsx";
import { ReportPreview } from "../components/ReportComponents.jsx";

export default function Reports({ data, setPage, setSelectedClient }) {
  return (
    <section>
      <PageHeader title="Reports" subtitle="Report queue and report preview retained." />
      <div className="card">
        <h2>Reports Due</h2>
        {data.reports.map((r) => (
          <div className="row" key={r.id}>
            <span><strong>{r.client}</strong><small>{r.title}</small></span>
            <b>{r.status}</b>
            <button className="secondary" onClick={() => { setSelectedClient(r.clientId); setPage("client"); }}>Open</button>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Report Template</h2>
        <ReportPreview client={data.clients[0]} score={data.clients[0].score} />
      </div>
    </section>
  );
}
