import PageHeader from "../components/PageHeader.jsx";
import { versionHistory } from "../data/seedData.js";

export default function Versions() {
  return (
    <section>
      <PageHeader title="Version History" subtitle="Visible product release history." />
      <div className="card">
        <h2>Release History</h2>
        {versionHistory.map(([version, title]) => (
          <div className="timeline-row" key={version}><b>{version}</b><span><strong>{title}</strong><small>Retained in build register</small></span></div>
        ))}
      </div>
    </section>
  );
}
