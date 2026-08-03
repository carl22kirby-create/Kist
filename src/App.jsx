import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
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
import { seedData } from "./data/seedData.js";

const STORAGE_KEY = "kist_repair_v220";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState("c1");
  const [calendarAnchor, setCalendarAnchor] = useState("2026-07-06");
  const [data, setDataState] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || seedData);

  function setData(nextOrFn) {
    setDataState((current) => {
      const next = typeof nextOrFn === "function" ? nextOrFn(current) : nextOrFn;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }
  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("kist_widgets_v220");
    setDataState(seedData);
  }

  const props = { data, setData, page, setPage, selectedClient, setSelectedClient, calendarAnchor, setCalendarAnchor, resetData };

  const pages = {
    dashboard: <Dashboard {...props} />,
    clients: <Clients {...props} />,
    client: <Client {...props} />,
    calendar: <Calendar {...props} />,
    visits: <VisitWorkflow {...props} />,
    assessments: <Assessments {...props} />,
    reports: <Reports {...props} />,
    actions: <Actions {...props} />,
    analytics: <Analytics {...props} />,
    ai: <AI />,
    foundation: <Foundation />,
    versions: <Versions />,
    settings: <SettingsPage {...props} />
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />
      <main className="main">{pages[page]}</main>
    </div>
  );
}
