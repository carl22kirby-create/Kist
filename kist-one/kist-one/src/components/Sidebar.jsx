import {
  Home, Users, CalendarDays, ClipboardList, FileText, BarChart3, Sparkles,
  Settings, Database, History, ListChecks, LogOut
} from "lucide-react";

const groups = [
  ["CRM", [["dashboard", "Dashboard", Home], ["clients", "Clients", Users]]],
  ["Consultancy", [
    ["calendar", "Calendar", CalendarDays],
    ["visits", "Visit Workflow", ClipboardList],
    ["assessments", "Assessments", ClipboardList],
    ["reports", "Reports", FileText],
    ["actions", "Actions", ListChecks]
  ]],
  ["Insights", [["analytics", "Analytics", BarChart3], ["ai", "AI Consultant", Sparkles]]],
  ["System", [["foundation", "Foundation", Database], ["versions", "Version History", History], ["settings", "Settings", Settings]]]
];

const STATUS_LABEL = {
  idle: "Connected",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Save failed — check backend"
};

export default function Sidebar({ page, setPage, saveStatus, onLogout }) {
  return (
    <aside className="side">
      <div className="brand">
        <div className="bars"><span /><span /><span /></div>
        <div><h1>KIST ONE</h1><p>LIVE BUILD</p></div>
      </div>
      {groups.map(([group, items]) => (
        <div key={group}>
          <div className="nav-title">{group}</div>
          {items.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
              <Icon size={19} />{label}
            </button>
          ))}
        </div>
      ))}
      <button className="logout-button" onClick={onLogout}><LogOut size={17} /> Log Out</button>
      <div className="version">
        Version 4.0.0<br /><span>Vercel + Supabase release</span>
        {saveStatus && <div className={`sync-status ${saveStatus}`}>{STATUS_LABEL[saveStatus] || ""}</div>}
      </div>
    </aside>
  );
}
