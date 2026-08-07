import { useState, useEffect } from "react";
import { Tag, Mail, Phone, Layers, Target, FlaskConical, Pencil, FileText, Plus, Trash2, CalendarClock } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Toast from "../components/Toast.jsx";
import { industryOptions, capabilityOptions, regulatoryOptions, dependencyQuestions, businessObjectiveOptions, conceptNames } from "../data/knowledgeBase.js";
import { activeModulesForProfile, activeExclusionsForProfile } from "../utils/assessmentEngine.js";
import { getClientAssessment, reviewHypothesis, getClientScoreSummary, getLatestRound, calculateOverall } from "../utils/scoring.js";
import { getQuotesForClient, createQuote, updateQuoteStatus, getBookingConfirmationsForClient, createBookingConfirmation, updateBookingConfirmationStatus, getInvoicesForClient, createInvoice, updateInvoiceStatus, recordPayment } from "../api.js";

export default function Client({ data, setData, selectedClient, setPage, setCalendarAnchor, setSelectedQuote, setSelectedBooking, setSelectedInvoice }) {
  const client = data.clients.find((c) => c.id === selectedClient) || data.clients[0];
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHypothesisEditor, setShowHypothesisEditor] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsForm, setDetailsForm] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [checkinBaseline, setCheckinBaseline] = useState("");
  const [editingContacts, setEditingContacts] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentSearch, setDocumentSearch] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState(null);
  const [quotesError, setQuotesError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentDate: new Date().toISOString().slice(0, 10), method: "Bank transfer", note: "" });
  const [booking, setBooking] = useState({ date: "2026-07-08", start: "09:00", end: "10:00", type: "First Consultation", consultant: "Carl Kirby", location: client.address || "" });
  const profile = client.profile || { industry: "Other", capabilities: [], regulations: [], dependencies: {}, objectives: [], threeProblems: "", hypothesis: null };
  const activeModules = activeModulesForProfile(profile);
  const activeExclusions = activeExclusionsForProfile(profile);
  const assessmentAnswers = getClientAssessment(data, client.id);
  const hypothesisReview = reviewHypothesis(assessmentAnswers, profile.hypothesis);
  const scoreSummary = getClientScoreSummary(data, client.id);
  const assessmentRounds = (data.assessmentRounds && data.assessmentRounds[client.id]) || [];

  // A single, searchable view across everything that's genuinely a
  // document for this client — quotes, invoices, booking confirmations
  // and evidence files — rather than four separate lists a consultant has
  // to check one at a time. Each source already exists and is already
  // fetched; this only ever combines and filters, it doesn't duplicate
  // any of it.
  const allDocuments = [
    ...quotes.map((q) => ({ id: q.id, kind: "Quote", label: q.quoteNumber, date: q.issuedDate, status: q.status, search: `${q.quoteNumber} ${q.status} ${q.servicesDescription || ""}`.toLowerCase(), onClick: () => { setSelectedQuote(q); setPage("quote"); } })),
    ...invoices.map((i) => ({ id: i.id, kind: "Invoice", label: i.invoiceNumber, date: i.issuedDate, status: i.isOverdue ? "Overdue" : i.status, search: `${i.invoiceNumber} ${i.status} ${i.servicesDescription || ""}`.toLowerCase(), onClick: () => { setSelectedInvoice(i); setPage("invoice"); } })),
    ...bookings.map((b) => ({ id: b.id, kind: "Booking Confirmation", label: b.bookingNumber, date: b.visitDate, status: b.status, search: `${b.bookingNumber} ${b.visitType} ${b.status}`.toLowerCase(), onClick: () => { setSelectedBooking(b); setPage("booking"); } })),
    ...(client.evidenceFiles || []).map((f) => ({ id: f.id, kind: "Evidence File", label: f.fileName, date: f.uploadedAt ? f.uploadedAt.slice(0, 10) : null, status: f.stage, search: `${f.fileName} ${f.caption || ""} ${f.stage}`.toLowerCase(), onClick: null }))
  ]
    .filter((doc) => !documentSearch || doc.search.includes(documentSearch.toLowerCase()))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const latestRound = getLatestRound(data, client.id);

  // Defaults the reminder baseline to this client's most recent Assessment
  // or Report timeline entry, since that's genuinely when the "9 month
  // plan" this cadence tracks against was actually formed — falls back to
  // today only if no such entry exists yet.
  const lastAssessmentEntry = [...(client.timeline || [])]
    .filter((t) => t.type === "Assessment" || t.type === "Report")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const defaultCheckinBaseline = lastAssessmentEntry?.date || new Date().toISOString().slice(0, 10);
  const existingCheckins = data.schedule.filter((s) => s.clientId === client.id && s.type?.includes("Month Check-in"));

  function addMonths(dateStr, months) {
    const d = new Date(dateStr + "T00:00:00Z");
    const day = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + months);
    if (d.getUTCDate() !== day) d.setUTCDate(0); // clamp short months (e.g. 31 Jan + 1mo) to the real month-end
    return d.toISOString().slice(0, 10);
  }

  function scheduleCheckins() {
    const baseline = checkinBaseline || defaultCheckinBaseline;
    if (existingCheckins.length > 0 && !confirm(`${client.name} already has ${existingCheckins.length} check-in${existingCheckins.length === 1 ? "" : "s"} scheduled. Add three more anyway?`)) {
      return;
    }
    const points = [["3 Month Check-in", 3], ["6 Month Check-in", 6], ["9 Month Check-in", 9]];
    const newEntries = points.map(([label, months]) => ({
      id: "s" + Date.now() + "-" + months, date: addMonths(baseline, months), start: "10:00", end: "10:30",
      clientId: client.id, client: client.name, type: label, consultant: "Carl Kirby",
      location: "Phone / video call", status: "Scheduled", colour: "blue"
    }));
    const timelineItem = { id: "t" + Date.now(), date: new Date().toISOString().slice(0, 10), type: "Calendar", title: "3, 6 and 9 month check-ins scheduled" };
    setData({
      ...data,
      schedule: [...newEntries, ...data.schedule],
      clients: data.clients.map((c) => c.id === client.id ? { ...c, timeline: [timelineItem, ...(c.timeline || [])] } : c)
    });
    setToastMessage(`Check-ins scheduled for ${newEntries.map((e) => e.date).join(", ")}`);
  }

  function addContact() {
    const newContact = { id: "p" + Date.now(), name: "", role: "", email: "", phone: "", primary: (client.contacts || []).length === 0 };
    setData({ ...data, clients: data.clients.map((c) => c.id === client.id ? { ...c, contacts: [...(c.contacts || []), newContact] } : c) });
    setEditingContacts(true);
  }
  function updateContact(id, updates) {
    setData((current) => ({
      ...current,
      clients: current.clients.map((c) => c.id === client.id ? { ...c, contacts: (c.contacts || []).map((p) => p.id === id ? { ...p, ...updates } : p) } : c)
    }));
  }
  function removeContact(id) {
    if (!confirm("Remove this contact?")) return;
    setData((current) => ({
      ...current,
      clients: current.clients.map((c) => c.id === client.id ? { ...c, contacts: (c.contacts || []).filter((p) => p.id !== id) } : c)
    }));
  }

  function updateProfile(next) {
    setData({ ...data, clients: data.clients.map((c) => c.id === client.id ? { ...c, profile: next } : c) });
  }
  function toggleInProfile(key, value) {
    const list = profile[key] || [];
    updateProfile({ ...profile, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  }
  function setDependency(field, value) {
    updateProfile({ ...profile, dependencies: { ...(profile.dependencies || {}), [field]: value } });
  }
  function updateHypothesis(field, value) {
    const current = profile.hypothesis || { statement: "", targetConcepts: [], formedDate: new Date().toISOString().slice(0, 10) };
    updateProfile({ ...profile, hypothesis: { ...current, [field]: value } });
  }
  function toggleHypothesisTarget(name) {
    const current = profile.hypothesis || { statement: "", targetConcepts: [], formedDate: new Date().toISOString().slice(0, 10) };
    const list = current.targetConcepts || [];
    updateHypothesis("targetConcepts", list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);
  }

  function startEditingDetails() {
    setDetailsForm({
      name: client.name, industry: profile.industry || "Other", size: client.size || "", turnover: client.turnover || "",
      website: client.website || "", address: client.address || "", status: client.status || "Active",
      notes: client.notes || "", tags: (client.tags || []).join(", ")
    });
    setEditingDetails(true);
  }
  function saveDetails() {
    if (!detailsForm.name.trim()) { alert("Company name can't be empty."); return; }
    setData({
      ...data,
      clients: data.clients.map((c) => c.id === client.id ? {
        ...c,
        name: detailsForm.name.trim(), industry: detailsForm.industry, size: detailsForm.size,
        turnover: detailsForm.turnover, website: detailsForm.website, address: detailsForm.address,
        status: detailsForm.status, notes: detailsForm.notes,
        tags: detailsForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        profile: { ...(c.profile || {}), industry: detailsForm.industry }
      } : c)
    });
    setEditingDetails(false);
    setToastMessage("Client details saved");
  }
  function cancelEditingDetails() {
    setEditingDetails(false);
    setDetailsForm(null);
  }

  useEffect(() => {
    setDocumentsLoading(true);
    Promise.allSettled([
      getQuotesForClient(client.id).then(setQuotes).catch((err) => setQuotesError(err.message)),
      getBookingConfirmationsForClient(client.id).then(setBookings).catch(() => {}),
      getInvoicesForClient(client.id).then(setInvoices).catch(() => {})
    ]).then(() => setDocumentsLoading(false));
  }, [client.id]);

  function startNewBooking() {
    setBookingForm({
      visitType: "First Consultation", visitDate: new Date().toISOString().slice(0, 10),
      startTime: "09:00", endTime: "10:00", location: client.address || "", consultant: "Carl Kirby", attendees: "", notes: ""
    });
    setShowBookingForm(true);
  }
  function submitBooking() {
    createBookingConfirmation({ clientId: client.id, ...bookingForm })
      .then((created) => { setBookings([created, ...bookings]); setShowBookingForm(false); setToastMessage(`Booking ${created.bookingNumber} confirmed and filed`); })
      .catch((err) => alert(err.message));
  }
  function setBookingStatus(id, status) {
    updateBookingConfirmationStatus(id, status)
      .then(() => setBookings(bookings.map((b) => b.id === id ? { ...b, status } : b)))
      .catch((err) => alert(err.message));
  }

  function startInvoiceFromQuote(quote) {
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setInvoiceForm({ fromQuoteId: quote.id, quoteNumber: quote.quoteNumber, dueDate: due, discountAmount: 0, discountReason: "", notes: "" });
    setShowInvoiceForm(true);
  }
  function submitInvoice() {
    createInvoice(invoiceForm)
      .then((created) => { setInvoices([created, ...invoices]); setShowInvoiceForm(false); setToastMessage(`Invoice ${created.invoiceNumber} created and filed`); })
      .catch((err) => alert(err.message));
  }
  function setInvoiceStatusValue(id, status) {
    updateInvoiceStatus(id, status)
      .then((updated) => setInvoices(invoices.map((i) => i.id === id ? updated : i)))
      .catch((err) => alert(err.message));
  }
  function submitPayment(invoiceId) {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) { alert("Enter a payment amount greater than zero."); return; }
    recordPayment({ invoiceId, amount: Number(paymentForm.amount), paymentDate: paymentForm.paymentDate, method: paymentForm.method, note: paymentForm.note })
      .then((updated) => {
        setInvoices(invoices.map((i) => i.id === invoiceId ? updated : i));
        setPayingInvoiceId(null);
        setPaymentForm({ amount: "", paymentDate: new Date().toISOString().slice(0, 10), method: "Bank transfer", note: "" });
        setToastMessage("Payment recorded");
      })
      .catch((err) => alert(err.message));
  }

  function startNewQuote() {
    const today = new Date().toISOString().slice(0, 10);
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setQuoteForm({
      servicesDescription: "", issuedDate: today, validUntil,
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
      vatRate: 20, notes: ""
    });
    setShowQuoteForm(true);
  }

  function updateLineItem(index, field, value) {
    const items = [...quoteForm.lineItems];
    items[index] = { ...items[index], [field]: value };
    setQuoteForm({ ...quoteForm, lineItems: items });
  }
  function addLineItem() {
    setQuoteForm({ ...quoteForm, lineItems: [...quoteForm.lineItems, { description: "", quantity: 1, unitPrice: 0 }] });
  }
  function removeLineItem(index) {
    setQuoteForm({ ...quoteForm, lineItems: quoteForm.lineItems.filter((_, i) => i !== index) });
  }

  function quoteTotals(form) {
    const subtotal = form.lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
    const vatAmount = subtotal * (Number(form.vatRate) / 100);
    return { subtotal: Math.round(subtotal * 100) / 100, vatAmount: Math.round(vatAmount * 100) / 100, total: Math.round((subtotal + vatAmount) * 100) / 100 };
  }

  function submitQuote() {
    const validItems = quoteForm.lineItems.filter((i) => i.description.trim());
    if (validItems.length === 0) { alert("Add at least one line item with a description."); return; }
    const totals = quoteTotals({ ...quoteForm, lineItems: validItems });
    createQuote({
      clientId: client.id, issuedDate: quoteForm.issuedDate, validUntil: quoteForm.validUntil,
      servicesDescription: quoteForm.servicesDescription, lineItems: validItems,
      subtotal: totals.subtotal, vatRate: Number(quoteForm.vatRate), vatAmount: totals.vatAmount, total: totals.total,
      notes: quoteForm.notes
    })
      .then((created) => {
        setQuotes([created, ...quotes]);
        setShowQuoteForm(false);
        setToastMessage(`Quote ${created.quoteNumber} created and filed`);
      })
      .catch((err) => alert(err.message));
  }

  function setQuoteStatus(id, status) {
    updateQuoteStatus(id, status)
      .then(() => setQuotes(quotes.map((q) => q.id === id ? { ...q, status } : q)))
      .catch((err) => alert(err.message));
  }

  function book() {
    const appointment = { id: "s" + Date.now(), date: booking.date, start: booking.start, end: booking.end, clientId: client.id, client: client.name, type: booking.type, consultant: booking.consultant, location: booking.location, status: "Scheduled", colour: "gold" };
    const timelineItem = { id: "t" + Date.now(), date: booking.date, type: "Calendar", title: `${booking.type} scheduled` };
    setData({ ...data, schedule: [appointment, ...data.schedule], clients: data.clients.map((c) => c.id === client.id ? { ...c, timeline: [timelineItem, ...(c.timeline || [])] } : c) });
    setCalendarAnchor(booking.date); setPage("calendar");
  }

  return (
    <section>
      <PageHeader title={client.name} subtitle="Client workspace, contacts, diary, reports, timeline and actions." action={<button className="secondary" onClick={() => setPage("clients")}>Back</button>} />
      <Toast message={toastMessage} onDone={() => setToastMessage("")} />
      <div className="grid">
        <div className="card wide">
          <div className="card-head-row">
            <h2>Client Overview</h2>
            {!editingDetails && <button className="secondary edit-button" onClick={startEditingDetails}><Pencil size={14} /> Edit</button>}
          </div>
          {!editingDetails ? (
            <>
              <p className="muted">{client.notes || "No notes recorded yet."}</p>
              <div className="detail-grid">
                <p><strong>Industry:</strong> {client.industry}</p>
                <p><strong>Size:</strong> {client.size || "Not set"}</p>
                <p><strong>Turnover:</strong> {client.turnover || "Not set"}</p>
                <p><strong>Website:</strong> {client.website || "Not set"}</p>
                <p><strong>Address:</strong> {client.address || "Not set"}</p>
                <p><strong>Status:</strong> {client.status}</p>
              </div>
              <div className="client-tags">{(client.tags || []).map((t) => <span key={t}><Tag size={12} />{t}</span>)}</div>
            </>
          ) : (
            <div className="edit-details-form">
              <div className="form-grid">
                <label>Company Name<input value={detailsForm.name} onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })} /></label>
                <label>Industry
                  <select value={detailsForm.industry} onChange={(e) => setDetailsForm({ ...detailsForm, industry: e.target.value })}>
                    {industryOptions.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </label>
                <label>Size<input value={detailsForm.size} onChange={(e) => setDetailsForm({ ...detailsForm, size: e.target.value })} /></label>
                <label>Turnover<input value={detailsForm.turnover} onChange={(e) => setDetailsForm({ ...detailsForm, turnover: e.target.value })} /></label>
                <label>Website<input value={detailsForm.website} onChange={(e) => setDetailsForm({ ...detailsForm, website: e.target.value })} /></label>
                <label>Address<input value={detailsForm.address} onChange={(e) => setDetailsForm({ ...detailsForm, address: e.target.value })} /></label>
                <label>Status
                  <select value={detailsForm.status} onChange={(e) => setDetailsForm({ ...detailsForm, status: e.target.value })}>
                    <option>Prospect</option><option>Active</option><option>New</option><option>Inactive</option>
                  </select>
                </label>
                <label>Tags (comma separated)<input value={detailsForm.tags} onChange={(e) => setDetailsForm({ ...detailsForm, tags: e.target.value })} /></label>
              </div>
              <label className="notes-label">Notes<textarea value={detailsForm.notes} onChange={(e) => setDetailsForm({ ...detailsForm, notes: e.target.value })} /></label>
              <div className="edit-actions">
                <button className="secondary" onClick={cancelEditingDetails}>Cancel</button>
                <button className="primary" onClick={saveDetails}>Save Changes</button>
              </div>
            </div>
          )}
        </div>
        <div className="card wide objectives-card">
          <h2><Target size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />What This Client Wants to Achieve</h2>
          <p className="muted">The primary driver of this assessment. The Business Performance Score still matters, but it's evidence supporting these objectives, not the main product.</p>
          <textarea placeholder="In their own words: if we could only solve three problems, what would success look like?" value={profile.threeProblems || ""} onChange={(e) => updateProfile({ ...profile, threeProblems: e.target.value })} />
          <div className="checklist">
            {businessObjectiveOptions.map((obj) => (
              <label className="check-row" key={obj}>
                <input type="checkbox" checked={(profile.objectives || []).includes(obj)} onChange={() => toggleInProfile("objectives", obj)} />
                {obj}
              </label>
            ))}
          </div>
        </div>
        <div className="card wide hypothesis-card">
          <h2><FlaskConical size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Consultancy Hypothesis</h2>
          <p className="muted">The working theory of what's actually limiting the objectives above, formed before the evidence is gathered and tested against it as BPIs get scored.</p>
          {hypothesisReview && (
            <div className={`hypothesis-status hypothesis-status-${hypothesisReview.status.replace(/\s+/g, "-").toLowerCase()}`}>
              {hypothesisReview.status}{hypothesisReview.averageScore != null && ` — average score ${hypothesisReview.averageScore}/5 across target BPIs`}
            </div>
          )}
          <button className="secondary" onClick={() => setShowHypothesisEditor(!showHypothesisEditor)}>{showHypothesisEditor ? "Hide" : profile.hypothesis ? "Edit" : "Form"} Hypothesis</button>
          {!showHypothesisEditor && profile.hypothesis?.statement && <p className="hypothesis-statement">"{profile.hypothesis.statement}"</p>}
          {showHypothesisEditor && (
            <div className="profile-editor">
              <textarea placeholder="Working theory: e.g. 'Growth is limited by weak digital conversion, not capacity.'" value={profile.hypothesis?.statement || ""} onChange={(e) => updateHypothesis("statement", e.target.value)} />
              <h4 className="profile-subhead">Which BPIs is this hypothesis actually about?</h4>
              <div className="checklist">
                {conceptNames.map((name) => (
                  <label className="check-row" key={name}>
                    <input type="checkbox" checked={(profile.hypothesis?.targetConcepts || []).includes(name)} onChange={() => toggleHypothesisTarget(name)} />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card wide quotes-card">
          <div className="card-head-row">
            <h2><FileText size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Quotes</h2>
            <button className="secondary edit-button" onClick={startNewQuote}><Plus size={14} /> New Quote</button>
          </div>
          <p className="muted">Kept as a permanent audit record — every issued quote freezes the business details and Terms and Conditions in force at the time, and is never affected by a data reset.</p>
          {quotesError && <p className="ai-error">{quotesError}</p>}

          {showQuoteForm && quoteForm && (
            <div className="quote-form">
              <textarea placeholder="Services description" value={quoteForm.servicesDescription} onChange={(e) => setQuoteForm({ ...quoteForm, servicesDescription: e.target.value })} />
              <div className="form-grid">
                <label>Issued Date<input type="date" value={quoteForm.issuedDate} onChange={(e) => setQuoteForm({ ...quoteForm, issuedDate: e.target.value })} /></label>
                <label>Valid Until<input type="date" value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} /></label>
                <label>VAT Rate %<input type="number" value={quoteForm.vatRate} onChange={(e) => setQuoteForm({ ...quoteForm, vatRate: e.target.value })} /></label>
              </div>
              <h4 className="profile-subhead">Line Items</h4>
              {quoteForm.lineItems.map((item, i) => (
                <div className="quote-line-item-row" key={i}>
                  <input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(i, "description", e.target.value)} />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(i, "quantity", e.target.value)} />
                  <input type="number" placeholder="Unit price" value={item.unitPrice} onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)} />
                  <button className="evidence-remove-button" onClick={() => removeLineItem(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button className="secondary" onClick={addLineItem}><Plus size={14} /> Add Line Item</button>
              <p className="quote-form-total">Total (inc. VAT): <strong>£{quoteTotals(quoteForm).total.toFixed(2)}</strong></p>
              <textarea placeholder="Notes (optional)" value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} />
              <div className="edit-actions">
                <button className="secondary" onClick={() => setShowQuoteForm(false)}>Cancel</button>
                <button className="primary" onClick={submitQuote}>Issue Quote</button>
              </div>
            </div>
          )}

          {documentsLoading ? (
            <p className="muted-small">Loading quotes...</p>
          ) : quotes.length === 0 ? (
            <p className="muted-small">No quotes issued yet.</p>
          ) : (
            <div className="quote-list">
              {quotes.map((q) => (
                <div className="quote-row" key={q.id}>
                  <div>
                    <strong>{q.quoteNumber}</strong>
                    <span className="quote-row-meta">{q.issuedDate} · £{Number(q.total).toFixed(2)} · {q.status}</span>
                  </div>
                  <div className="quote-row-actions">
                    <button className="secondary" onClick={() => { setSelectedQuote(q); setPage("quote"); }}>View / Print</button>
                    {q.status === "Issued" && (
                      <>
                        <button className="secondary" onClick={() => setQuoteStatus(q.id, "Accepted")}>Mark Accepted</button>
                        <button className="secondary" onClick={() => setQuoteStatus(q.id, "Declined")}>Mark Declined</button>
                      </>
                    )}
                    {q.status === "Accepted" && (
                      <button className="primary" onClick={() => startInvoiceFromQuote(q)}>Create Invoice</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card wide bookings-card">
          <div className="card-head-row">
            <h2><FileText size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Booking Confirmations</h2>
            <button className="secondary edit-button" onClick={startNewBooking}><Plus size={14} /> New Confirmation</button>
          </div>
          <p className="muted">Kept as a permanent audit record, same as Quotes — never affected by a data reset.</p>

          {showBookingForm && bookingForm && (
            <div className="quote-form">
              <div className="form-grid">
                <label>Visit Type
                  <select value={bookingForm.visitType} onChange={(e) => setBookingForm({ ...bookingForm, visitType: e.target.value })}>
                    <option>First Consultation</option><option>Discovery Call</option><option>Business Assessment</option>
                    <option>Site Visit</option><option>Report Review</option><option>90 Day Follow Up</option>
                  </select>
                </label>
                <label>Date<input type="date" value={bookingForm.visitDate} onChange={(e) => setBookingForm({ ...bookingForm, visitDate: e.target.value })} /></label>
                <label>Start<input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} /></label>
                <label>End<input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} /></label>
                <label>Location<input value={bookingForm.location} onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })} /></label>
                <label>Consultant<input value={bookingForm.consultant} onChange={(e) => setBookingForm({ ...bookingForm, consultant: e.target.value })} /></label>
                <label>Attendees Expected<input value={bookingForm.attendees} onChange={(e) => setBookingForm({ ...bookingForm, attendees: e.target.value })} /></label>
              </div>
              <textarea placeholder="Notes (optional)" value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
              <div className="edit-actions">
                <button className="secondary" onClick={() => setShowBookingForm(false)}>Cancel</button>
                <button className="primary" onClick={submitBooking}>Confirm Booking</button>
              </div>
            </div>
          )}

          {documentsLoading ? (
            <p className="muted-small">Loading booking confirmations...</p>
          ) : bookings.length === 0 ? (
            <p className="muted-small">No booking confirmations issued yet.</p>
          ) : (
            <div className="quote-list">
              {bookings.map((b) => (
                <div className="quote-row" key={b.id}>
                  <div>
                    <strong>{b.bookingNumber}</strong>
                    <span className="quote-row-meta">{b.visitDate} · {b.visitType} · {b.status}</span>
                  </div>
                  <div className="quote-row-actions">
                    <button className="secondary" onClick={() => { setSelectedBooking(b); setPage("booking"); }}>View / Print</button>
                    {b.status === "Confirmed" && (
                      <>
                        <button className="secondary" onClick={() => setBookingStatus(b.id, "Rescheduled")}>Mark Rescheduled</button>
                        <button className="secondary" onClick={() => setBookingStatus(b.id, "Cancelled")}>Cancel</button>
                        <button className="secondary" onClick={() => setBookingStatus(b.id, "Completed")}>Mark Completed</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card wide invoices-card">
          <div className="card-head-row">
            <h2><FileText size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Invoices</h2>
          </div>
          <p className="muted">Create an invoice from an Accepted quote above, or track payments on an existing invoice below. Kept as a permanent audit record, never affected by a data reset.</p>

          {showInvoiceForm && invoiceForm && (
            <div className="quote-form">
              <p className="muted-small">Creating invoice from quote {invoiceForm.quoteNumber}.</p>
              <div className="form-grid">
                <label>Due Date<input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} /></label>
                <label>Discount Amount (£)<input type="number" value={invoiceForm.discountAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })} /></label>
                <label>Discount Reason<input value={invoiceForm.discountReason} onChange={(e) => setInvoiceForm({ ...invoiceForm, discountReason: e.target.value })} placeholder="e.g. Loyalty discount" /></label>
              </div>
              <textarea placeholder="Notes (optional)" value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
              <div className="edit-actions">
                <button className="secondary" onClick={() => setShowInvoiceForm(false)}>Cancel</button>
                <button className="primary" onClick={submitInvoice}>Issue Invoice</button>
              </div>
            </div>
          )}

          {documentsLoading ? (
            <p className="muted-small">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="muted-small">No invoices issued yet.</p>
          ) : (
            <div className="quote-list">
              {invoices.map((inv) => (
                <div className="quote-row" key={inv.id}>
                  <div>
                    <strong>{inv.invoiceNumber}</strong>
                    <span className="quote-row-meta">
                      Due {inv.dueDate} · £{Number(inv.total).toFixed(2)} · {inv.isOverdue ? "Overdue" : inv.status}
                      {inv.amountOutstanding > 0 && inv.amountOutstanding < inv.total && ` · £${Number(inv.amountOutstanding).toFixed(2)} outstanding`}
                    </span>
                  </div>
                  <div className="quote-row-actions">
                    <button className="secondary" onClick={() => { setSelectedInvoice(inv); setPage("invoice"); }}>View / Print</button>
                    {(inv.status === "Issued" || inv.status === "Partially Paid") && (
                      <button className="primary" onClick={() => setPayingInvoiceId(payingInvoiceId === inv.id ? null : inv.id)}>Record Payment</button>
                    )}
                    {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                      <button className="secondary" onClick={() => setInvoiceStatusValue(inv.id, "Written Off")}>Write Off</button>
                    )}
                  </div>
                  {payingInvoiceId === inv.id && (
                    <div className="payment-form">
                      <div className="form-grid">
                        <label>Amount (£)<input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder={`Outstanding: £${Number(inv.amountOutstanding).toFixed(2)}`} /></label>
                        <label>Date<input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} /></label>
                        <label>Method
                          <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                            <option>Bank transfer</option><option>Card</option><option>Cash</option><option>Cheque</option><option>Other</option>
                          </select>
                        </label>
                      </div>
                      <input placeholder="Note (optional)" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} />
                      <button className="primary" onClick={() => submitPayment(inv.id)}>Save Payment</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2>Quick Actions</h2>
          <button className="primary" onClick={() => setShowBooking(!showBooking)}>Schedule Consultation</button><br /><br />
          <button className="secondary" onClick={() => setPage("visits")}>Start Visit Workflow</button><br /><br />
          <button className="secondary" onClick={() => setPage("assessments")}>Start Assessment</button><br /><br />
          <button className="secondary" onClick={() => setPage("report")}>View Full Report</button>
        </div>
        <div className="card">
          <h2>Assessment History</h2>
          <div className="row">
            <span><strong>Current</strong><small>Live, computed from what's scored right now</small></span>
            <b>{scoreSummary.hasAssessment ? `${scoreSummary.overall}/100` : "Not yet assessed"}</b>
          </div>
          {assessmentRounds.length === 0 ? (
            <p className="muted-small">No assessment round has been saved yet. Save one from the Assessment screen once scoring is complete, to track progress over successive visits.</p>
          ) : (
            [...assessmentRounds].reverse().map((round, i) => {
              const roundScore = calculateOverall(round.snapshot);
              return (
                <div className="row" key={round.date + i}>
                  <span><strong>{round.label || "Saved round"}</strong><small>{round.date}</small></span>
                  <b>{roundScore}/100</b>
                </div>
              );
            })
          )}
          {latestRound && (
            <p className="muted-small">Last saved round: {latestRound.date}. Consider a reassessment if it's been several months, or use Check-in Reminders below to schedule one.</p>
          )}
        </div>
        <div className="card wide">
          <h2><FileText size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Documents</h2>
          <p className="muted-small">Every quote, invoice, booking confirmation and evidence file for this client, in one searchable place.</p>
          <input placeholder="Search documents by number, status, file name or note..." value={documentSearch} onChange={(e) => setDocumentSearch(e.target.value)} />
          {documentsLoading ? (
            <p className="muted-small">Loading documents...</p>
          ) : allDocuments.length === 0 ? (
            <p className="muted-small">{documentSearch ? "No documents match that search." : "No documents yet for this client."}</p>
          ) : (
            <div className="quote-list">
              {allDocuments.map((doc) => (
                doc.onClick ? (
                  <button className="quote-row" key={doc.kind + doc.id} onClick={doc.onClick}>
                    <div><strong>{doc.label}</strong><span className="quote-row-meta">{doc.kind} · {doc.date || "No date"} · {doc.status}</span></div>
                  </button>
                ) : (
                  <div className="quote-row" key={doc.kind + doc.id}>
                    <div><strong>{doc.label}</strong><span className="quote-row-meta">{doc.kind} · {doc.date || "Date not recorded"} · {doc.status}</span></div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head-row">
            <h2>Contacts</h2>
            <button className="secondary edit-button" onClick={() => setEditingContacts(!editingContacts)}>{editingContacts ? "Done" : "Edit"}</button>
          </div>
          {(client.contacts || []).length === 0 && !editingContacts && <p className="muted">No contacts recorded yet.</p>}
          {(client.contacts || []).map((contact) => (
            editingContacts ? (
              <div className="contact-edit-row" key={contact.id}>
                <input placeholder="Name" value={contact.name} onChange={(e) => updateContact(contact.id, { name: e.target.value })} />
                <input placeholder="Role" value={contact.role} onChange={(e) => updateContact(contact.id, { role: e.target.value })} />
                <input placeholder="Email" value={contact.email} onChange={(e) => updateContact(contact.id, { email: e.target.value })} />
                <input placeholder="Phone" value={contact.phone} onChange={(e) => updateContact(contact.id, { phone: e.target.value })} />
                <label className="check-row contact-primary-row">
                  <input type="checkbox" checked={!!contact.primary} onChange={() => setData({ ...data, clients: data.clients.map((c) => c.id === client.id ? { ...c, contacts: (c.contacts || []).map((p) => ({ ...p, primary: p.id === contact.id })) } : c) })} />
                  Primary contact
                </label>
                <button className="evidence-remove-button" onClick={() => removeContact(contact.id)}><Trash2 size={14} /></button>
              </div>
            ) : (
              <div className="contact-card" key={contact.id}>
                <strong>{contact.name || "Unnamed contact"}{contact.primary && <span className="contact-primary-tag">Primary</span>}</strong><small>{contact.role}</small>
                {contact.email && <span><Mail size={14} />{contact.email}</span>}
                {contact.phone && <span><Phone size={14} />{contact.phone}</span>}
              </div>
            )
          ))}
          {editingContacts && <button className="secondary" onClick={addContact}><Plus size={14} /> Add Contact</button>}
        </div>
        <div className="card">
          <h2><CalendarClock size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Check-in Reminders</h2>
          <p className="muted">Schedule 3, 6 and 9 month follow-ups to check progress against the plan agreed at assessment.</p>
          {existingCheckins.length > 0 && (
            <p className="muted-small">{existingCheckins.length} check-in{existingCheckins.length === 1 ? "" : "s"} already on the diary for this client.</p>
          )}
          <label>Baseline date (usually the assessment or report date)
            <input type="date" value={checkinBaseline || defaultCheckinBaseline} onChange={(e) => setCheckinBaseline(e.target.value)} />
          </label>
          <button className="primary" onClick={scheduleCheckins}>Schedule 3 / 6 / 9 Month Check-ins</button>
        </div>
        <div className="card">
          <h2>Upcoming Diary</h2>
          {data.schedule.filter((s) => s.clientId === client.id).length
            ? data.schedule.filter((s) => s.clientId === client.id).map((s) => (
              <div className="row" key={s.id}><span><strong>{s.type}</strong><small>{s.date} · {s.start} to {s.end}</small></span><b>{s.status}</b></div>
            ))
            : <p className="muted">No diary entries yet.</p>}
        </div>
        <div className="card wide">
          <h2><Layers size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />Business Profile and Active Modules</h2>
          <p className="muted">This drives which assessment questions apply to this client — the engine assembles a different question set per client based on what's selected here.</p>
          <div className="module-chip-row">
            {activeModules.map((m) => <span className={`module-chip module-chip-${m.type.toLowerCase().replace(/\s+/g, "-")}`} key={m.type + m.name}>{m.name}</span>)}
          </div>
          {activeExclusions.length > 0 && (
            <div className="exclusion-row">
              {activeExclusions.map((ex) => <span className="exclusion-chip" key={ex.tag}>Excluded: {ex.tag}</span>)}
            </div>
          )}
          <button className="secondary" onClick={() => setShowProfile(!showProfile)}>{showProfile ? "Hide" : "Edit"} Business Profile</button>
          {showProfile && (
            <div className="profile-editor">
              <p className="muted">Industry: <strong className="gold">{profile.industry || "Other"}</strong> — change this on Client Overview → Edit, not here, so it can never drift out of sync.</p>
              <h4 className="profile-subhead">Capabilities</h4>
              <div className="checklist">
                {capabilityOptions.map((cap) => (
                  <label className="check-row" key={cap}>
                    <input type="checkbox" checked={(profile.capabilities || []).includes(cap)} onChange={() => toggleInProfile("capabilities", cap)} />
                    {cap}
                  </label>
                ))}
              </div>
              <h4 className="profile-subhead">Regulatory Frameworks</h4>
              <div className="checklist">
                {regulatoryOptions.map((reg) => (
                  <label className="check-row" key={reg}>
                    <input type="checkbox" checked={(profile.regulations || []).includes(reg)} onChange={() => toggleInProfile("regulations", reg)} />
                    {reg}
                  </label>
                ))}
              </div>
              <h4 className="profile-subhead">Business Characteristics</h4>
              <p className="muted">A "No" here hard removes every related question, even if a capability above suggests otherwise.</p>
              <div className="dependency-list">
                {dependencyQuestions.map((dep) => {
                  const current = (profile.dependencies || {})[dep.field];
                  return (
                    <div className="dependency-row" key={dep.field}>
                      <span>{dep.label}</span>
                      <div className="dependency-buttons">
                        <button type="button" className={current === true ? "dep-yes selected" : "dep-yes"} onClick={() => setDependency(dep.field, true)}>Yes</button>
                        <button type="button" className={current === false ? "dep-no selected" : "dep-no"} onClick={() => setDependency(dep.field, false)}>No</button>
                        <button type="button" className={current == null ? "dep-unknown selected" : "dep-unknown"} onClick={() => setDependency(dep.field, null)}>Not Yet Known</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="card wide">
          <h2>Client Timeline</h2>
          {(client.timeline || []).map((item) => (
            <div className="timeline-row" key={item.id}><b>{item.date}</b><span><strong>{item.type}</strong><small>{item.title}</small></span></div>
          ))}
        </div>
      </div>
      {showBooking && (
        <div className="card booking-panel">
          <h2>Schedule Consultation</h2>
          <div className="form-grid">
            <label>Date<input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} /></label>
            <label>Start<input type="time" value={booking.start} onChange={(e) => setBooking({ ...booking, start: e.target.value })} /></label>
            <label>End<input type="time" value={booking.end} onChange={(e) => setBooking({ ...booking, end: e.target.value })} /></label>
            <label>Visit type
              <select value={booking.type} onChange={(e) => setBooking({ ...booking, type: e.target.value })}>
                <option>First Consultation</option><option>Discovery Call</option><option>Business Assessment</option>
                <option>Site Visit</option><option>Report Review</option><option>90 Day Follow Up</option>
              </select>
            </label>
            <label>Consultant<input value={booking.consultant} onChange={(e) => setBooking({ ...booking, consultant: e.target.value })} /></label>
            <label>Location<input value={booking.location} onChange={(e) => setBooking({ ...booking, location: e.target.value })} /></label>
          </div>
          <button className="primary" onClick={book}>Book and Open Calendar</button>
        </div>
      )}
    </section>
  );
}
