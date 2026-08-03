import { useState, useMemo } from "react";
import { Plus, Search, Tag } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import ClientOnboarding from "./ClientOnboarding.jsx";

export default function Clients({ data, setData, setPage, setSelectedClient, setCalendarAnchor }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState("All");
  const [tag, setTag] = useState("All");
  const allTags = useMemo(() => ["All", ...Array.from(new Set(data.clients.flatMap((c) => c.tags || [])))], [data.clients]);
  const filtered = data.clients.filter((client) => {
    const q = query.toLowerCase();
    return (
      (client.name.toLowerCase().includes(q) || client.industry.toLowerCase().includes(q) || (client.contacts || []).some((c) => c.name.toLowerCase().includes(q))) &&
      (health === "All" || client.health === health) &&
      (tag === "All" || (client.tags || []).includes(tag))
    );
  });

  return (
    <section>
      <PageHeader
        title="Clients"
        subtitle="CRM restored with dark styled cards, search, tags and onboarding."
        action={<button className="primary" onClick={() => setShowOnboarding(true)}><Plus size={16} /> Add New Client</button>}
      />
      {showOnboarding && (
        <ClientOnboarding
          data={data} setData={setData} setPage={setPage}
          setSelectedClient={setSelectedClient} setCalendarAnchor={setCalendarAnchor}
          onClose={() => setShowOnboarding(false)}
        />
      )}
      <div className="crm-toolbar">
        <div className="search-box"><Search size={18} /><input placeholder="Search company, industry or contact" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={health} onChange={(e) => setHealth(e.target.value)}>
          <option>All</option><option>Excellent</option><option>Stable</option><option>Watch</option><option>New</option>
        </select>
        <select value={tag} onChange={(e) => setTag(e.target.value)}>{allTags.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <div className="client-grid">
        {filtered.map((client) => {
          const primary = (client.contacts || [])[0] || {};
          return (
            <button className="client-card card" key={client.id} onClick={() => { setSelectedClient(client.id); setPage("client"); }}>
              <div className="client-top"><div><h2>{client.name}</h2><p>{client.industry} · {client.health}</p></div><strong>{client.score}</strong></div>
              <div className="client-tags">{(client.tags || []).slice(0, 3).map((t) => <span key={t}><Tag size={12} />{t}</span>)}</div>
              <div className="client-contact"><small>{primary.name || "No contact"} · {primary.role || ""}</small></div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
