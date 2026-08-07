import { useState, useEffect } from "react";
import { LayoutDashboard, AlertTriangle, Clock, CalendarClock, FileText } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import BusinessDNA from "../components/BusinessDNA.jsx";
import { ScheduleRows, EscalationRows } from "../components/Rows.jsx";
import { getAllEscalations, getClientScoreSummary, categoryScores, getClientAssessment } from "../utils/scoring.js";
import { getCommercialOverview } from "../api.js";

const DEFAULT_WIDGETS = { health: true, actions: true, diary: true, dna: true };

export default function Dashboard({ data, setPage, setSelectedClient, setCalendarAnchor, setData }) {
  const [detail, setDetail] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState("");
  const widgets = data.widgets || DEFAULT_WIDGETS;

  useEffect(() => {
    getCommercialOverview().then(setOverview).catch((err) => setOverviewError(err.message));
  }, []);

  function saveWidgets(next) {
    setData({ ...data, widgets: next });
  }

  const escalations = getAllEscalations(data);
  const upcoming = [...data.schedule].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)).slice(0, 6);
  const openCalendar = () => { setCalendarAnchor(upcoming[0]?.date || data.schedule[0]?.date || ""); setPage("calendar"); };

  // Every client's real score summary, computed once here and reused
  // throughout — this is the single source of truth every part of this
  // page reads from, never a stored field.
  const scoreSummaries = data.clients.map((c) => ({ client: c, summary: getClientScoreSummary(data, c.id) }));
  const assessedClients = scoreSummaries.filter((s) => s.summary.hasAssessment);
  const unassessedClients = scoreSummaries.filter((s) => !s.summary.hasAssessment);
  const mostAtRisk = assessedClients.length
    ? assessedClients.reduce((worst, s) => (s.summary.overall < worst.summary.overall ? s : worst))
    : null;

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const overdueActions = data.actions.filter((a) => a.due && a.due < today && a.status !== "Complete");
  const twoDaysOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const visitsNeedingPrep = data.schedule.filter((s) => s.date >= today && s.date <= twoDaysOut);

  const [actionsFilter, setActionsFilter] = useState("This Week");
  const [diaryFilter, setDiaryFilter] = useState("This Week");

  // Same filter logic, used identically for both the widget tile preview
  // and the detail panel opened on click — the two must never disagree
  // about what "Overdue" or "This Week" means.
  function filterActions(list, filter) {
    if (filter === "Overdue") return list.filter((a) => a.due && a.due < today && a.status !== "Complete");
    if (filter === "Today") return list.filter((a) => a.due === today);
    if (filter === "This Week") return list.filter((a) => a.due && a.due >= today && a.due <= sevenDaysOut);
    return list;
  }
  function filterVisits(list, filter) {
    if (filter === "Overdue") return list.filter((s) => s.date < today);
    if (filter === "Today") return list.filter((s) => s.date === today);
    if (filter === "This Week") return list.filter((s) => s.date >= today && s.date <= sevenDaysOut);
    return list;
  }
  const filteredActions = [...filterActions(data.actions, actionsFilter)].sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
  const filteredVisits = [...filterVisits(data.schedule, diaryFilter)].sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));

  function actionRow(a) {
    const isOverdue = a.due && a.due < today && a.status !== "Complete";
    return (
      <div className="row" key={a.id}>
        <span><strong>{a.title}</strong><small>{a.client} · {a.owner}</small></span>
        <b className={isOverdue ? "action-overdue" : ""}>{isOverdue ? "Overdue" : a.priority}</b>
      </div>
    );
  }
  function visitRow(item) {
    return (
      <div className="row" key={item.id}>
        <span><strong>{item.client}</strong><small>{item.date} · {item.start} to {item.end} · {item.type}</small></span>
        <b>{item.status}</b>
      </div>
    );
  }
  function FilterTabs({ value, onChange }) {
    return (
      <div className="filter-tabs" onClick={(e) => e.stopPropagation()}>
        {["Overdue", "Today", "This Week", "All"].map((f) => (
          <button key={f} className={`filter-tab ${value === f ? "filter-tab-active" : ""}`} onClick={() => onChange(f)}>{f}</button>
        ))}
      </div>
    );
  }

  function openMostAtRisk() {
    if (mostAtRisk) { setSelectedClient(mostAtRisk.client.id); setPage("client"); }
    else setPage("clients");
  }

  // The "needs attention today" list — every entry here is a real,
  // computed fact, never a placeholder. If nothing needs attention, that
  // gets said plainly rather than showing an empty-looking widget.
  const attentionItems = [];
  if (overview?.invoicesOverdue > 0) {
    attentionItems.push({ icon: AlertTriangle, text: `${overview.invoicesOverdue} invoice${overview.invoicesOverdue === 1 ? "" : "s"} overdue`, tone: "urgent" });
  }
  for (const e of escalations.slice(0, 3)) {
    attentionItems.push({ icon: AlertTriangle, text: `${e.clientName}: ${e.concept} flagged ${e.flags.join(", ")}`, tone: "urgent", onClick: () => { setSelectedClient(e.clientId); setPage("client"); } });
  }
  if (overdueActions.length > 0) {
    attentionItems.push({ icon: Clock, text: `${overdueActions.length} action${overdueActions.length === 1 ? "" : "s"} overdue`, tone: "warning", onClick: () => setPage("actions") });
  }
  if (overview?.quotesAwaitingResponse > 0) {
    attentionItems.push({ icon: FileText, text: `${overview.quotesAwaitingResponse} quote${overview.quotesAwaitingResponse === 1 ? "" : "s"} awaiting response`, tone: "info" });
  }
  for (const v of visitsNeedingPrep) {
    attentionItems.push({ icon: CalendarClock, text: `${v.client} — ${v.type} on ${v.date} at ${v.start}`, tone: "info", onClick: openCalendar });
  }
  if (unassessedClients.length > 0) {
    attentionItems.push({ icon: FileText, text: `${unassessedClients.length} client${unassessedClients.length === 1 ? "" : "s"} not yet assessed: ${unassessedClients.map((s) => s.client.name).join(", ")}`, tone: "info", onClick: () => setPage("clients") });
  }

  return (
    <section>
      <PageHeader
        title="KIST One Dashboard"
        subtitle="What needs your attention right now."
        action={
          <div className="action-row">
            <button className="secondary" onClick={openCalendar}>Open Calendar</button>
            <button className="secondary" onClick={() => setShowEdit(!showEdit)}><LayoutDashboard size={16} /> Customise</button>
          </div>
        }
      />

      {showEdit && (
        <div className="card protected">
          <h2>Customise Dashboard</h2>
          <p className="muted-small">"Needs Attention" and the Business Overview strip always show — they're the point of this page. Everything below is optional.</p>
          <div className="checklist">
            {Object.keys(widgets).map((key) => (
              <label className="check-row" key={key}>
                <input type="checkbox" checked={widgets[key]} onChange={() => saveWidgets({ ...widgets, [key]: !widgets[key] })} />
                {key}
              </label>
            ))}
          </div>
        </div>
      )}

      {detail && (
        <div className="card detail-panel">
          <div className="detail-head"><h2>{detail.title}</h2><button className="secondary" onClick={() => setDetail(null)}>Close</button></div>
          {detail.body}
        </div>
      )}

      <div className="card attention-card">
        <h2>Needs Your Attention</h2>
        {attentionItems.length === 0 ? (
          <p className="muted">Nothing needs attention right now.</p>
        ) : (
          <div className="attention-list">
            {attentionItems.map((item, i) => {
              const Icon = item.icon;
              const Tag = item.onClick ? "button" : "div";
              return (
                <Tag className={`attention-item attention-${item.tone}`} key={i} onClick={item.onClick}>
                  <Icon size={16} /><span>{item.text}</span>
                </Tag>
              );
            })}
          </div>
        )}
      </div>

      <div className="overview-strip">
        {overviewError ? (
          <p className="ai-error">Couldn't load business overview: {overviewError}</p>
        ) : !overview ? (
          <p className="muted-small">Loading business overview…</p>
        ) : (
          <>
            <div className="overview-stat"><strong>{overview.quotesAwaitingResponse}</strong><span>Quotes awaiting response</span></div>
            <div className="overview-stat"><strong>{overview.upcomingVisits7Days}</strong><span>Visits in next 7 days</span></div>
            <div className="overview-stat"><strong>{overview.invoicesOutstanding}</strong><span>Invoices outstanding</span></div>
            <div className={`overview-stat ${overview.invoicesOverdue > 0 ? "overview-stat-urgent" : ""}`}><strong>{overview.invoicesOverdue}</strong><span>Invoices overdue</span></div>
          </>
        )}
      </div>

      <div className="grid">
        {widgets.health && (
          <button className="widget" onClick={() => setDetail({ title: "Client Health", body: (
            <div>
              {scoreSummaries.map(({ client, summary }) => (
                <div className="row" key={client.id}>
                  <span><strong>{client.name}</strong><small>{client.industry} · {summary.hasAssessment ? summary.tier.tier : "Not yet assessed"}</small></span>
                  <b>{summary.hasAssessment ? summary.overall : "—"}</b>
                </div>
              ))}
            </div>
          ) })}>
            <h2>Client Health</h2>
            {scoreSummaries.slice(0, 5).map(({ client, summary }) => (
              <div className="row" key={client.id}>
                <span><strong>{client.name}</strong><small>{client.industry} · {summary.hasAssessment ? summary.tier.tier : "Not yet assessed"}</small></span>
                <b>{summary.hasAssessment ? summary.overall : "—"}</b>
              </div>
            ))}
          </button>
        )}

        {widgets.dna && (
          <button className="widget" onClick={openMostAtRisk}>
            <h2>Most At-Risk Client</h2>
            {mostAtRisk ? (
              <>
                <p className="muted-small">{mostAtRisk.client.name} — {mostAtRisk.summary.overall}/100 ({mostAtRisk.summary.tier.tier})</p>
                <BusinessDNA scores={categoryScores(getClientAssessment(data, mostAtRisk.client.id)).map((c) => c.score)} />
              </>
            ) : (
              <p className="muted">No client has a completed assessment yet — this will show the lowest-scoring client's Business DNA once one does.</p>
            )}
          </button>
        )}

        {widgets.diary && (
          <div className="widget wide">
            <div className="widget-head-row">
              <h2>Diary</h2>
              <FilterTabs value={diaryFilter} onChange={setDiaryFilter} />
            </div>
            <button className="widget-body-link" onClick={() => setDetail({ title: `Diary — ${diaryFilter}`, body: <div>{filteredVisits.length === 0 ? <p className="muted">Nothing in this view.</p> : filteredVisits.map(visitRow)}</div> })}>
              {filteredVisits.length === 0 ? <p className="muted">Nothing in this view.</p> : filteredVisits.slice(0, 6).map(visitRow)}
              {filteredVisits.length > 6 && <em>+{filteredVisits.length - 6} more — click to see all</em>}
            </button>
          </div>
        )}

        {widgets.actions && (
          <div className="widget">
            <div className="widget-head-row">
              <h2>Open Actions</h2>
              <FilterTabs value={actionsFilter} onChange={setActionsFilter} />
            </div>
            <button className="widget-body-link" onClick={() => setDetail({ title: `Actions — ${actionsFilter}`, body: <div>{filteredActions.length === 0 ? <p className="muted">Nothing in this view.</p> : filteredActions.map(actionRow)}</div> })}>
              {filteredActions.length === 0 ? <p className="muted">Nothing in this view.</p> : filteredActions.slice(0, 6).map(actionRow)}
              {filteredActions.length > 6 && <em>+{filteredActions.length - 6} more — click to see all</em>}
            </button>
          </div>
        )}

        {escalations.length > 0 && (
          <button className="widget escalation-widget" onClick={() => setDetail({ title: "Escalations", body: <EscalationRows escalations={escalations} setPage={setPage} setSelectedClient={setSelectedClient} /> })}>
            <h2>Escalations</h2>
            {escalations.slice(0, 4).map((e) => (
              <div className="row" key={`${e.clientId}-${e.id}`}>
                <span><strong>{e.clientName}</strong><small>{e.concept} · {e.flags.join(", ")}</small></span>
                <b className="escalation-count">{e.flags.length}</b>
              </div>
            ))}
            {escalations.length > 4 && <em>+{escalations.length - 4} more</em>}
          </button>
        )}
      </div>
    </section>
  );
}
