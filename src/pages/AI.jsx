import { useState } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

export default function AI({ data, selectedClient, setSelectedClient }) {
  const [clientId, setClientId] = useState(selectedClient || data.clients[0]?.id || "");
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseClient(id) {
    setClientId(id);
    if (setSelectedClient) setSelectedClient(id);
    setConversation([]);
  }

  async function ask() {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setError("");
    setConversation((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-ask", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, clientId })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Request failed with status ${res.status}`);
      setConversation((prev) => [...prev, { role: "assistant", ...body }]);
    } catch (err) {
      setError(err.message || "Something went wrong asking KIST Brain.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <PageHeader title="AI Consultant" subtitle="KIST Brain: evidence-grounded answers, scoped to one client's recorded assessment data." />

      <div className="card ai-setup-card">
        <label>Client
          <select value={clientId} onChange={(e) => chooseClient(e.target.value)}>
            {data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <p className="muted-small">Every answer below is grounded only in this client's actually recorded scores, notes and evidence — not general knowledge. If the evidence doesn't cover your question, KIST Brain will say so rather than guess.</p>
      </div>

      <div className="card ai-conversation-card">
        {conversation.length === 0 && (
          <p className="muted">Ask something like "why is this client's growth limited?" or "what's the strongest evidence for the current hypothesis?"</p>
        )}
        {conversation.map((turn, i) => (
          <div className={turn.role === "user" ? "ai-turn ai-turn-user" : "ai-turn ai-turn-assistant"} key={i}>
            {turn.role === "user" ? (
              <p>{turn.text}</p>
            ) : (
              <>
                {!turn.groundedInEvidence && (
                  <div className="ai-ungrounded-banner"><AlertTriangle size={14} /> Evidence for this client didn't fully cover the question</div>
                )}
                <p className="ai-answer-text">{turn.answer}</p>
                {turn.insufficientEvidenceNote && <p className="ai-insufficient-note">{turn.insufficientEvidenceNote}</p>}
                {turn.citations?.length > 0 && (
                  <div className="ai-citations">
                    <b>Sources</b>
                    {turn.citations.map((c, ci) => (
                      <div className="ai-citation" key={ci}>
                        <span className="ai-citation-concept">{c.concept}{c.score ? ` — ${c.score}/5` : ""}</span>
                        <span className="ai-citation-quote">"{c.evidenceQuoted}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {loading && <p className="muted">KIST Brain is checking the evidence...</p>}
        {error && <p className="ai-error"><AlertTriangle size={14} /> {error}</p>}
      </div>

      <div className="ai-input-row">
        <input
          placeholder="Ask KIST Brain about this client..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
        />
        <button className="primary" onClick={ask} disabled={loading}><Sparkles size={16} /> Ask</button>
      </div>
    </section>
  );
}
