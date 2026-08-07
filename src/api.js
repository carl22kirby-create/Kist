const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.code = body.code;
    throw err;
  }
  return res.json();
}

export function checkSession() {
  return fetch(`${BASE}/auth?action=session`, { credentials: "include" }).then(handle);
}

export function login(password) {
  return fetch(`${BASE}/auth?action=login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  }).then(handle);
}

export function logout() {
  return fetch(`${BASE}/auth?action=logout`, { method: "POST", credentials: "include" }).then(handle);
}

export function fetchData() {
  return fetch(`${BASE}/data`, { credentials: "include" }).then(handle);
}

export function saveData(data, expectedVersion) {
  return fetch(`${BASE}/data`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: data, expectedVersion })
  }).then(handle);
}

export function resetData() {
  return fetch(`${BASE}/data`, { method: "POST", credentials: "include" }).then(handle);
}

export function getBusinessSettings() {
  return fetch(`${BASE}/documents?type=business-settings`, { credentials: "include" }).then(handle);
}

export function saveBusinessSettings(details) {
  return fetch(`${BASE}/documents?type=business-settings`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details)
  }).then(handle);
}

export function getQuotesForClient(clientId) {
  return fetch(`${BASE}/documents?type=quote&clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createQuote(quote) {
  return fetch(`${BASE}/documents?type=quote`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  }).then(handle);
}

export function updateQuoteStatus(id, status) {
  return fetch(`${BASE}/documents?type=quote`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function getBookingConfirmationsForClient(clientId) {
  return fetch(`${BASE}/documents?type=booking&clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createBookingConfirmation(booking) {
  return fetch(`${BASE}/documents?type=booking`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
  }).then(handle);
}

export function updateBookingConfirmationStatus(id, status) {
  return fetch(`${BASE}/documents?type=booking`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function getInvoicesForClient(clientId) {
  return fetch(`${BASE}/documents?type=invoice&clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createInvoice(invoice) {
  return fetch(`${BASE}/documents?type=invoice`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice)
  }).then(handle);
}

export function updateInvoiceStatus(id, status) {
  return fetch(`${BASE}/documents?type=invoice`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function recordPayment(payment) {
  return fetch(`${BASE}/documents?type=payment`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment)
  }).then(handle);
}

export function getCommercialOverview() {
  return fetch(`${BASE}/documents?type=overview`, { credentials: "include" }).then(handle);
}

export function getExpenses(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return fetch(`${BASE}/documents?type=expense&${params}`, { credentials: "include" }).then(handle);
}

export function createExpense(expense) {
  return fetch(`${BASE}/documents?type=expense`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  }).then(handle);
}

export function updateExpense(id, updates) {
  return fetch(`${BASE}/documents?type=expense`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates })
  }).then(handle);
}

export function deleteExpense(id) {
  return fetch(`${BASE}/documents?type=expense&id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" }).then(handle);
}

export function getFinanceSummary(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return fetch(`${BASE}/documents?type=finance-summary&${params}`, { credentials: "include" }).then(handle);
}

export function getIncome(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return fetch(`${BASE}/documents?type=income&${params}`, { credentials: "include" }).then(handle);
}
