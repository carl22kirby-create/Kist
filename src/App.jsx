import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Finance from "./pages/Finance.jsx";
import Clients from "./pages/Clients.jsx";
import Client from "./pages/Client.jsx";
import Calendar from "./pages/Calendar.jsx";
import VisitWorkflow from "./pages/VisitWorkflow.jsx";
import Assessments from "./pages/Assessments.jsx";
import Reports from "./pages/Reports.jsx";
import Actions from "./pages/Actions.jsx";
import Analytics from "./pages/Analytics.jsx";
import AI from "./pages/AI.jsx";
import Foundation from "./pages/Foundation.jsx";
import Versions from "./pages/Versions.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ClientReport from "./pages/ClientReport.jsx";
import KistFlyer from "./pages/KistFlyer.jsx";
import Presentation from "./pages/Presentation.jsx";
import QuoteDocument from "./pages/QuoteDocument.jsx";
import BookingConfirmationDocument from "./pages/BookingConfirmationDocument.jsx";
import InvoiceDocument from "./pages/InvoiceDocument.jsx";
import { checkSession, login, logout, fetchData, saveData, resetData as apiResetData } from "./api.js";

const SAVE_DEBOUNCE_MS = 600;

export default function App() {
  const [authState, setAuthState] = useState("checking"); // checking | out | in
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState("c1");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [calendarAnchor, setCalendarAnchor] = useState("2026-07-06");
  const [data, setDataState] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error | conflict
  const [conflictMessage, setConflictMessage] = useState("");
  const saveTimer = useRef(null);
  const syncVersionRef = useRef(null);

  useEffect(() => {
    checkSession()
      .then((res) => setAuthState(res.authenticated ? "in" : "out"))
      .catch(() => setAuthState("out"));
  }, []);

  useEffect(() => {
    if (authState !== "in") return;
    fetchData()
      .then((result) => {
        syncVersionRef.current = result.syncVersion;
        setDataState(result);
      })
      .catch((err) => {
        if (err.status === 401) { setAuthState("out"); return; }
        setLoadError(err.message);
      });
  }, [authState]);

  const persist = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      saveData(next, syncVersionRef.current)
        .then((result) => {
          syncVersionRef.current = result.syncVersion;
          setSaveStatus("saved");
        })
        .catch((err) => {
          if (err.status === 401) { setAuthState("out"); return; }
          if (err.code === "VERSION_CONFLICT") {
            setSaveStatus("conflict");
            setConflictMessage(err.message);
            // Reload the current live data rather than silently discarding
            // it or leaving the tab stuck on a stale snapshot it can never
            // successfully save again.
            fetchData().then((result) => {
              syncVersionRef.current = result.syncVersion;
              setDataState(result);
            }).catch(() => {});
            return;
          }
          setSaveStatus("error");
        });
    }, SAVE_DEBOUNCE_MS);
  }, []);

  function setData(nextOrFn) {
    setDataState((current) => {
      const next = typeof nextOrFn === "function" ? nextOrFn(current) : nextOrFn;
      persist(next);
      return next;
    });
  }

  function resetData() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    apiResetData()
      .then((fresh) => {
        syncVersionRef.current = fresh.syncVersion;
        setDataState(fresh);
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  }

  async function handleLogin(password) {
    await login(password);
    setAuthState("in");
  }

  async function handleLogout() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await logout().catch(() => {});
    setDataState(null);
    setAuthState("out");
  }

  if (authState === "checking") {
    return <div className="app-loading">Loading KIST One…</div>;
  }

  if (authState === "out") {
    return <Login onLogin={handleLogin} />;
  }

  if (loadError) {
    return (
      <div className="app-error">
        <h1>Can't reach the KIST One API</h1>
        <p>{loadError}</p>
        <p className="muted">Make sure the backend is running and DATABASE_URL is set correctly.</p>
      </div>
    );
  }

  if (!data) {
    return <div className="app-loading">Loading KIST One…</div>;
  }

  const props = { data, setData, page, setPage, selectedClient, setSelectedClient, selectedQuote, setSelectedQuote, selectedBooking, setSelectedBooking, selectedInvoice, setSelectedInvoice, calendarAnchor, setCalendarAnchor, resetData };

  if (page === "report") {
    return <ClientReport {...props} />;
  }

  if (page === "flyer") {
    return <KistFlyer {...props} />;
  }

  if (page === "present") {
    return <Presentation {...props} />;
  }

  if (page === "quote") {
    return <QuoteDocument {...props} />;
  }

  if (page === "booking") {
    return <BookingConfirmationDocument {...props} />;
  }

  if (page === "invoice") {
    return <InvoiceDocument {...props} />;
  }

  const pages = {
    dashboard: <Dashboard {...props} />,
    finance: <Finance {...props} />,
    clients: <Clients {...props} />,
    client: <Client {...props} />,
    calendar: <Calendar {...props} />,
    visits: <VisitWorkflow {...props} />,
    assessments: <Assessments {...props} />,
    reports: <Reports {...props} />,
    actions: <Actions {...props} />,
    analytics: <Analytics {...props} />,
    ai: <AI {...props} />,
    foundation: <Foundation />,
    versions: <Versions />,
    settings: <SettingsPage {...props} onLogout={handleLogout} />
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} saveStatus={saveStatus} onLogout={handleLogout} />
      <main className="main">
        {saveStatus === "conflict" && (
          <div className="conflict-banner">
            <strong>Save blocked to protect newer data.</strong> {conflictMessage} The page has reloaded the current data automatically — check your most recent change and redo it if needed.
            <button className="secondary" onClick={() => setSaveStatus("idle")}>Dismiss</button>
          </div>
        )}
        {pages[page]}
      </main>
    </div>
  );
}
