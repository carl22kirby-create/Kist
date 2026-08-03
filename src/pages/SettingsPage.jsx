import PageHeader from "../components/PageHeader.jsx";

export default function SettingsPage({ resetData }) {
  return (
    <section>
      <PageHeader title="Settings" subtitle="System controls." />
      <div className="card">
        <h2>Storage</h2>
        <p className="muted">KIST One stores all client, calendar, assessment and dashboard data locally in this browser (localStorage). Clearing browser data or switching browsers/devices will lose it.</p>
        <button className="danger" onClick={resetData}>Reset Local Data</button>
      </div>
    </section>
  );
}
