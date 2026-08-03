import PageHeader from "../components/PageHeader.jsx";

export default function SettingsPage({ resetData, onLogout }) {
  return (
    <section>
      <PageHeader title="Settings" subtitle="System controls." />
      <div className="card">
        <h2>Storage</h2>
        <p className="muted">KIST One stores all client, calendar, assessment and dashboard data in a Postgres database on the backend server. Any device that can reach the site and sign in sees the same data, and it survives closing the browser or redeploying the app.</p>
        <button className="danger" onClick={resetData}>Reset to Seed Data</button>
      </div>
      <div className="card">
        <h2>Account</h2>
        <p className="muted">You are signed in with the shared site password. Signing out will require the password again to get back in.</p>
        <button className="secondary" onClick={onLogout}>Log Out</button>
      </div>
    </section>
  );
}
