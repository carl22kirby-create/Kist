import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Toast from "../components/Toast.jsx";
import { getBusinessSettings, saveBusinessSettings } from "../api.js";
import { getMissingRequiredBusinessDetails } from "../data/termsAndConditions.js";

const CONFIRM_PHRASE = "RESET";

export default function SettingsPage({ resetData, onLogout }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [business, setBusiness] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getBusinessSettings().then(setBusiness).catch((err) => setLoadError(err.message));
  }, []);

  function confirmReset() {
    resetData();
    setShowConfirm(false);
    setConfirmText("");
  }

  function saveBusiness() {
    saveBusinessSettings(business)
      .then((saved) => { setBusiness(saved); setToastMessage("Business details saved"); })
      .catch((err) => alert(err.message));
  }

  const missing = business ? getMissingRequiredBusinessDetails(business) : [];

  return (
    <section>
      <PageHeader title="Settings" subtitle="System controls." />
      <Toast message={toastMessage} onDone={() => setToastMessage("")} />

      <div className="card">
        <h2>Business Legal Details</h2>
        <p className="muted">Fills in the Terms and Conditions attached to every quote. Anything left blank shows its original [INSERT ...] placeholder on issued documents, rather than being silently skipped — so an incomplete quote is visibly incomplete, not quietly wrong.</p>
        {loadError && <p className="ai-error">{loadError}</p>}
        {!business ? (
          <p className="muted">Loading...</p>
        ) : (
          <>
            {missing.length > 0 && (
              <div className="business-details-warning">
                <strong>Missing before quotes are complete:</strong> {missing.join(", ")}.
              </div>
            )}
            <div className="form-grid">
              <label>Full Legal Name<input value={business.legalName || ""} onChange={(e) => setBusiness({ ...business, legalName: e.target.value })} placeholder="e.g. KIST Performance Group Ltd" /></label>
              <label>Business Structure
                <select value={business.businessStructure || ""} onChange={(e) => setBusiness({ ...business, businessStructure: e.target.value })}>
                  <option value="">Select...</option>
                  <option>Sole trader</option>
                  <option>Partnership</option>
                  <option>Limited company</option>
                  <option>Limited liability partnership</option>
                </select>
              </label>
              <label>Company Number (if applicable)<input value={business.companyNumber || ""} onChange={(e) => setBusiness({ ...business, companyNumber: e.target.value })} /></label>
              <label>Registered Office (if applicable)<input value={business.registeredOffice || ""} onChange={(e) => setBusiness({ ...business, registeredOffice: e.target.value })} /></label>
              <label>Principal Business Address<input value={business.principalAddress || ""} onChange={(e) => setBusiness({ ...business, principalAddress: e.target.value })} /></label>
              <label>Contact Email<input value={business.contactEmail || ""} onChange={(e) => setBusiness({ ...business, contactEmail: e.target.value })} /></label>
              <label>Website<input value={business.website || ""} onChange={(e) => setBusiness({ ...business, website: e.target.value })} /></label>
              <label>Liability Cap<input value={business.liabilityCap || ""} onChange={(e) => setBusiness({ ...business, liabilityCap: e.target.value })} placeholder="e.g. the total Fees paid under the relevant Proposal" /></label>
            </div>
            <p className="muted-small">The liability cap is a genuine legal decision, not a formality — worth checking with a solicitor or your insurer before setting this, since it directly limits what a client could recover from a claim.</p>
            <button className="primary" onClick={saveBusiness}>Save Business Details</button>
          </>
        )}
      </div>

      <div className="card">
        <h2>Storage</h2>
        <p className="muted">KIST One stores all client, calendar, assessment and dashboard data in a Postgres database on the backend server. Any device that can reach the site and sign in sees the same data, and it survives closing the browser or redeploying the app.</p>
        <p className="muted">A save from an old browser tab that's fallen behind the latest data is automatically rejected rather than silently overwriting anything newer — you'll see a clear message if that ever happens.</p>

        {!showConfirm ? (
          <button className="danger" onClick={() => setShowConfirm(true)}>Reset to Seed Data</button>
        ) : (
          <div className="reset-confirm-box">
            <p className="reset-confirm-warning">This permanently deletes every real client, assessment, action, report and photo currently stored, and replaces them with the three demo clients. This cannot be undone. Quotes are kept as a permanent audit record and are not affected by this reset.</p>
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
