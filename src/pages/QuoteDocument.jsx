import { renderTermsAndConditions } from "../data/termsAndConditions.js";

export default function QuoteDocument({ data, selectedClient, selectedQuote, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient);
  const quote = selectedQuote;

  if (!quote) {
    return (
      <div className="report-shell">
        <div className="report-toolbar no-print"><button className="secondary" onClick={() => setPage("client")}>Back</button></div>
        <p style={{ padding: 40 }}>No quote selected.</p>
      </div>
    );
  }

  const terms = renderTermsAndConditions(quote.businessDetailsSnapshot);
  const money = (n) => `£${Number(n).toFixed(2)}`;

  return (
    <div className="report-shell">
      <div className="report-toolbar no-print">
        <button className="secondary" onClick={() => setPage("client")}>Back to Client</button>
        <button className="primary" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      <div className="quote-page">
        <header className="report-header">
          <div className="report-brand">
            <div className="report-bars"><span /><span /><span /></div>
            <div><strong>{quote.businessDetailsSnapshot?.legalName || "KIST PERFORMANCE GROUP"}</strong><span>Quotation</span></div>
          </div>
          <div className="report-date">{quote.quoteNumber}</div>
        </header>

        <div className="quote-meta-grid">
          <div><b>Issued to</b><p>{client?.name}</p></div>
          <div><b>Issued date</b><p>{quote.issuedDate}</p></div>
          <div><b>Valid until</b><p>{quote.validUntil}</p></div>
          <div><b>Status</b><p>{quote.status}</p></div>
        </div>

        {quote.servicesDescription && <p className="quote-description">{quote.servicesDescription}</p>}

        <table className="quote-line-items">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
          <tbody>
            {quote.lineItems.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{money(item.unitPrice)}</td>
                <td>{money(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Subtotal</td><td>{money(quote.subtotal)}</td></tr>
            <tr><td colSpan={3}>VAT ({quote.vatRate}%)</td><td>{money(quote.vatAmount)}</td></tr>
            <tr className="quote-total-row"><td colSpan={3}>Total</td><td>{money(quote.total)}</td></tr>
          </tfoot>
        </table>

        {quote.notes && <p className="quote-notes">{quote.notes}</p>}

        <p className="quote-acceptance-note">This quotation is issued subject to the Terms and Conditions of Business printed below, which form part of any contract created by acceptance of this quotation.</p>

        <div className="quote-terms-section">
          {terms.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            if (trimmed.startsWith("# ")) return <h1 key={i} className="terms-h1">{trimmed.replace(/^#\s*/, "")}</h1>;
            if (trimmed.startsWith("## ")) return <h2 key={i} className="terms-h2">{trimmed.replace(/^##\s*/, "")}</h2>;
            return <p key={i} className="terms-p">{trimmed.replace(/\*\*/g, "")}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
