import PageHeader from "../components/PageHeader.jsx";
import { getClientScoreSummary } from "../utils/scoring.js";

export default function Reports({ data, setPage, setSelectedClient }) {
  function openReport(clientId) {
    setSelectedClient(clientId);
    setPage("report");
  }

  return (
    <section>
      <PageHeader title="Reports" subtitle="Opens the full client report for any client, ready to print or save as PDF." />
      <div className="card">
        <h2>All Clients</h2>
        {data.clients.map((c) => {
          const { overall, hasAssessment } = getClientScoreSummary(data, c.id);
          return (
            <div className="row" key={c.id}>
              <span><strong>{c.name}</strong><small>{c.industry}</small></span>
              <b>{hasAssessment ? overall : "Not yet assessed"}</b>
              <button className="secondary" onClick={() => openReport(c.id)}>Open Report</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
