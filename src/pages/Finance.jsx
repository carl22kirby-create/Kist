import { useState, useEffect } from "react";
import { PoundSterling, Plus, Upload, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { getFinanceSummary, getIncome, getExpenses, createExpense, deleteExpense } from "../api.js";
import { uploadEvidenceFile } from "../utils/upload.js";
import { estimateTax, currentTaxYear, HMRC_EXPENSE_CATEGORIES, TAX_YEAR_LABEL } from "../utils/tax.js";

export default function Finance() {
  const defaultYear = currentTaxYear();
  const [from, setFrom] = useState(defaultYear.from);
  const [to, setTo] = useState(defaultYear.to);
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadAll(); }, [from, to]);

  function loadAll() {
    setLoading(true);
    setLoadError("");
    Promise.all([
      getFinanceSummary(from, to).then(setSummary),
      getIncome(from, to).then(setIncome),
      getExpenses(from, to).then(setExpenses)
    ])
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }

  function jumpToTaxYear(offsetYears) {
    const base = currentTaxYear();
    const baseYear = Number(base.from.slice(0, 4)) + offsetYears;
    setFrom(`${baseYear}-04-06`);
    setTo(`${baseYear + 1}-04-05`);
  }

  function startNewExpense() {
    setExpenseForm({
      date: new Date().toISOString().slice(0, 10), supplier: "", description: "",
      category: HMRC_EXPENSE_CATEGORIES[HMRC_EXPENSE_CATEGORIES.length - 1],
      amount: "", vatAmount: "", notes: "", receiptUrl: null, receiptPath: null, receiptFileName: null
    });
    setShowExpenseForm(true);
  }

  async function handleReceiptSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadEvidenceFile(file);
      setExpenseForm((f) => ({ ...f, receiptUrl: result.url, receiptPath: result.path, receiptFileName: result.fileName }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  function submitExpense() {
    if (!expenseForm.date || !expenseForm.amount) { alert("Date and amount are required."); return; }
    createExpense({
      date: expenseForm.date, supplier: expenseForm.supplier, description: expenseForm.description,
      category: expenseForm.category, amount: Number(expenseForm.amount), vatAmount: Number(expenseForm.vatAmount) || 0,
      receiptUrl: expenseForm.receiptUrl, receiptPath: expenseForm.receiptPath, notes: expenseForm.notes
    })
      .then(() => { setShowExpenseForm(false); loadAll(); })
      .catch((err) => alert(err.message));
  }

  function removeExpense(id) {
    if (!confirm("Delete this expense record? This cannot be undone.")) return;
    deleteExpense(id).then(loadAll).catch((err) => alert(err.message));
  }

  const tax = summary ? estimateTax(summary.profit) : null;
  const money = (n) => `£${Number(n || 0).toFixed(2)}`;

  return (
    <section>
      <PageHeader
        title="Finance"
        subtitle={`Tax year ${from} to ${to}. Turnover and income are never entered separately — both come directly from real recorded invoice payments.`}
        action={
          <div className="action-row">
            <button className="secondary" onClick={() => jumpToTaxYear(-1)}>Previous Tax Year</button>
            <button className="secondary" onClick={() => jumpToTaxYear(0)}>Current Tax Year</button>
            <button className="primary" onClick={startNewExpense}><Plus size={16} /> Add Expense</button>
          </div>
        }
      />

      {loadError && <p className="ai-error">Couldn't load finance data: {loadError}</p>}

      <div className="metrics">
        <div className="metric"><span>Turnover</span><strong>{loading ? "…" : money(summary?.turnover)}</strong></div>
        <div className="metric"><span>Expenses</span><strong>{loading ? "…" : money(summary?.expenses)}</strong></div>
        <div className="metric"><span>Profit</span><strong>{loading ? "…" : money(summary?.profit)}</strong></div>
        <div className="metric">
          <span>Estimated Tax + Class 4 NIC</span>
          <strong>{loading || !tax ? "…" : money(tax.totalEstimatedTax)}</strong>
        </div>
      </div>
      <p className="muted-small tax-disclaimer">
        Tax estimate uses {TAX_YEAR_LABEL}, based on this profit figure alone — it doesn't account for other income, pension contributions, Gift Aid, student loan repayments or any other personal circumstance. This is a working estimate to plan against, not a filing calculation. Always verify current rates and get an accountant's view before relying on it.
      </p>

      {showExpenseForm && expenseForm && (
        <div className="card protected">
          <h2>Add Expense</h2>
          <div className="form-grid">
            <label>Date<input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} /></label>
            <label>Supplier<input value={expenseForm.supplier} onChange={(e) => setExpenseForm({ ...expenseForm, supplier: e.target.value })} /></label>
            <label>Amount excl. VAT (£)<input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></label>
            <label>VAT (£)<input type="number" value={expenseForm.vatAmount} onChange={(e) => setExpenseForm({ ...expenseForm, vatAmount: e.target.value })} /></label>
            <label className="wide">Category (HMRC Self Assessment category)
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                {HMRC_EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <textarea placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <textarea placeholder="Notes (optional)" value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />

          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleReceiptSelected} className="evidence-file-input" id="receipt-input" />
          <label htmlFor="receipt-input" className="secondary evidence-upload-button">
            <Upload size={16} /> {uploading ? "Uploading..." : expenseForm.receiptFileName || "Attach Receipt or Supplier Invoice"}
          </label>

          <div className="edit-actions">
            <button className="secondary" onClick={() => setShowExpenseForm(false)}>Cancel</button>
            <button className="primary" onClick={submitExpense}>Save Expense</button>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card wide">
          <h2>Income This Tax Year</h2>
          <p className="muted-small">Every payment recorded against a real invoice — the same figures shown on each invoice itself.</p>
          {loading ? <p className="muted">Loading…</p> : income.length === 0 ? (
            <p className="muted-small">No payments recorded in this period yet.</p>
          ) : (
            income.map((p) => (
              <div className="row" key={p.id}>
                <span><strong>{p.invoiceNumber}</strong><small>{p.paymentDate} · {p.method || "Method not recorded"}</small></span>
                <b>{money(p.amount)}</b>
              </div>
            ))
          )}
        </div>

        <div className="card wide">
          <h2>Expenses This Tax Year</h2>
          {loading ? <p className="muted">Loading…</p> : expenses.length === 0 ? (
            <p className="muted-small">No expenses recorded in this period yet.</p>
          ) : (
            expenses.map((exp) => (
              <div className="row expense-row" key={exp.id}>
                <span><strong>{exp.supplier || "No supplier recorded"}</strong><small>{exp.date} · {exp.category}</small></span>
                <b>{money(exp.totalAmount)}</b>
                {exp.receiptUrl && <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="secondary receipt-link">Receipt</a>}
                <button className="evidence-remove-button" onClick={() => removeExpense(exp.id)}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
