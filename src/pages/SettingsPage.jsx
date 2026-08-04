import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

const CONFIRM_PHRASE = "RESET";

export default function SettingsPage({ resetData, onLogout }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  function confirmReset() {
    resetData();
    setShowConfirm(false);
    setConfirmText("");
  }

  return (
    <section>
      <PageHeader title="Settings" subtitle="System controls." />
      <div className="card">
        <h2>Storage</h2>
        <p className="muted">KIST One stores all client, calendar, assessment and dashboard data in a Postgres database on the backend server. Any device that can reach the site and sign in sees the same data, and it survives closing the browser or redeploying the app.</p>
        <p className="muted">A save from an old browser tab that's fallen behind the latest data is automatically rejected rather than silently overwriting anything newer — you'll see a clear message if that ever happens.</p>

        {!showConfirm ? (
          <button className="danger" onClick={() => setShowConfirm(true)}>Reset to Seed Data</button>
        ) : (
          <div className="reset-confirm-box">
            <p className="reset-confirm-warning">This permanently deletes every real client, assessment, action, report and photo currently stored, and replaces them with the three demo clients. This cannot be undone.</p>
            <label>Type <strong>RESET</strong> to confirm
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESET" />
            </label>
            <div className="reset-confirm-actions">
              <button className="secondary" onClick={() => { setShowConfirm(false); setConfirmText(""); }}>Cancel</button>
              <button className="danger" disabled={confirmText !== CONFIRM_PHRASE} onClick={confirmReset}>Permanently Reset</button>
            </div>
          </div>
        )}
      </div>
      <div className="card">
        <h2>Account</h2>
        <p className="muted">You are signed in with the shared site password. Signing out will require the password again to get back in.</p>
        <button className="secondary" onClick={onLogout}>Log Out</button>
      </div>
    </section>
  );
}
