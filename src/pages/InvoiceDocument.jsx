import { renderTermsAndConditions } from "../data/termsAndConditions.js";

export default function InvoiceDocument({ data, selectedClient, selectedInvoice, setPage }) {
  const client = data.clients.find((c) => c.id === selectedClient);
  const invoice = selectedInvoice;

  if (!invoice) {
    return (
      <div className="report-shell">
        <div className="report-toolbar no-print"><button className="secondary" onClick={() => setPage("client")}>Back</button></div>
        <p style={{ padding: 40 }}>No invoice selected.</p>
      </div>
    );
  }

  const terms = renderTermsAndConditions(invoice.businessDetailsSnapshot);
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
            <div><strong>{invoice.businessDetailsSnapshot?.legalName || "KIST PERFORMANCE GROUP"}</strong><span>Invoice</span></div>
          </div>
          <div className="report-date">{invoice.invoiceNumber}</div>
        </header>

        <div className="quote-meta-grid">
          <div><b>Issued to</b><p>{client?.name}</p></div>
          <div><b>Issued date</b><p>{invoice.issuedDate}</p></div>
          <div><b>Due date</b><p>{invoice.dueDate}</p></div>
          <div><b>Status</b><p className={invoice.isOverdue ? "invoice-overdue-text" : ""}>{invoice.isOverdue ? "Overdue" : invoice.status}</p></div>
        </div>

        {invoice.servicesDescription && <p className="quote-description">{invoice.servicesDescription}</p>}

        <table className="quote-line-items">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
          <tbody>
            {invoice.lineItems.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{money(item.unitPrice)}</td>
                <td>{money(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Subtotal</td><td>{money(invoice.subtotal)}</td></tr>
            {invoice.discountAmount > 0 && (
              <tr><td colSpan={3}>Discount{invoice.discountReason ? ` (${invoice.discountReason})` : ""}</td><td>-{money(invoice.discountAmount)}</td></tr>
            )}
            <tr><td colSpan={3}>VAT ({invoice.vatRate}%)</td><td>{money(invoice.vatAmount)}</td></tr>
            <tr className="quote-total-row"><td colSpan={3}>Total Due</td><td>{money(invoice.total)}</td></tr>
          </tfoot>
        </table>

        {invoice.payments?.length > 0 && (
          <div className="invoice-payments-section">
            <h4>Payments Received</h4>
            <table className="quote-line-items">
              <thead><tr><th>Date</th><th>Method</th><th>Note</th><th>Amount</th></tr></thead>
              <tbody>
                {invoice.payments.map((p) => (
                  <tr key={p.id}><td>{p.paymentDate}</td><td>{p.method || "—"}</td><td>{p.note || "—"}</td><td>{money(p.amount)}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="invoice-outstanding-line">
              Paid to date: <strong>{money(invoice.amountPaid)}</strong> · Outstanding: <strong>{money(invoice.amountOutstanding)}</strong>
            </p>
          </div>
        )}

        {invoice.notes && <p className="quote-notes">{invoice.notes}</p>}

        <p className="quote-acceptance-note">This invoice is issued subject to the Terms and Conditions of Business printed below, which form part of the contract for these Services.</p>

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
