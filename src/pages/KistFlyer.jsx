export default function KistFlyer({ data, selectedClient, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="report-shell">
      <div className="report-toolbar no-print">
        <button className="secondary" onClick={() => setPage("visits")}>Back to Visit</button>
        <button className="primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="flyer-page">
        <header className="report-header">
          <div className="report-brand">
            <div className="report-bars"><span /><span /><span /></div>
            <div>
              <strong>KIST ONE</strong>
              <span>Business Consultancy</span>
            </div>
          </div>
          <div className="report-date">{today}</div>
        </header>

        <h1 className="flyer-title">What Is KIST One?</h1>
        <p className="flyer-subtitle">A different kind of business assessment.</p>

        <p className="flyer-lead">
          We're not here to audit your compliance or catch you out with a checklist. We're here to work out, with you,
          why {client?.name || "your business"} isn't performing where you want it to — and give you a clear, evidence based
          plan to close that gap.
        </p>

        <div className="flyer-steps">
          <div className="flyer-step">
            <span className="flyer-step-number">1</span>
            <div><strong>We ask what you actually want</strong><p>More revenue, lower costs, more time back — whatever success looks like for you specifically.</p></div>
          </div>
          <div className="flyer-step">
            <span className="flyer-step-number">2</span>
            <div><strong>We form a professional hypothesis</strong><p>Our own theory of what's likely holding you back, stated before we've seen any evidence.</p></div>
          </div>
          <div className="flyer-step">
            <span className="flyer-step-number">3</span>
            <div><strong>We test it properly</strong><p>Through observation, real evidence and conversation — never assumption or a tick-box list.</p></div>
          </div>
          <div className="flyer-step">
            <span className="flyer-step-number">4</span>
            <div><strong>We deliver a roadmap</strong><p>Specific, prioritised actions tied to commercial impact — not just a score on a page.</p></div>
          </div>
        </div>

        <h2 className="flyer-section-head">What You Can Expect</h2>
        <ul className="flyer-list">
          <li>A structured visit, not an interrogation</li>
          <li>Straight, evidence based answers — no jargon</li>
          <li>A report that tells the story of your business, not a checklist of scores</li>
          <li>A 90 day plan you can actually put into action</li>
        </ul>

        <footer className="flyer-footer">
          <p>Prepared for {client?.name || "you"} · KIST One Business Consultancy · {today}</p>
        </footer>
      </div>
    </div>
  );
}
