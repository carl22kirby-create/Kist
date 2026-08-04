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
  return fetch(`${BASE}/session`, { credentials: "include" }).then(handle);
}

export function login(password) {
  return fetch(`${BASE}/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  }).then(handle);
}

export function logout() {
  return fetch(`${BASE}/logout`, { method: "POST", credentials: "include" }).then(handle);
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
  return fetch(`${BASE}/reset`, { method: "POST", credentials: "include" }).then(handle);
}

export function getBusinessSettings() {
  return fetch(`${BASE}/business-settings`, { credentials: "include" }).then(handle);
}

export function saveBusinessSettings(details) {
  return fetch(`${BASE}/business-settings`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details)
  }).then(handle);
}

export function getQuotesForClient(clientId) {
  return fetch(`${BASE}/quotes?clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createQuote(quote) {
  return fetch(`${BASE}/quotes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  }).then(handle);
}

export function updateQuoteStatus(id, status) {
  return fetch(`${BASE}/quotes`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function getBookingConfirmationsForClient(clientId) {
  return fetch(`${BASE}/booking-confirmations?clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createBookingConfirmation(booking) {
  return fetch(`${BASE}/booking-confirmations`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
  }).then(handle);
}

export function updateBookingConfirmationStatus(id, status) {
  return fetch(`${BASE}/booking-confirmations`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function getInvoicesForClient(clientId) {
  return fetch(`${BASE}/invoices?clientId=${encodeURIComponent(clientId)}`, { credentials: "include" }).then(handle);
}

export function createInvoice(invoice) {
  return fetch(`${BASE}/invoices`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoice)
  }).then(handle);
}

export function updateInvoiceStatus(id, status) {
  return fetch(`${BASE}/invoices`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  }).then(handle);
}

export function recordPayment(payment) {
  return fetch(`${BASE}/invoice-payments`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment)
  }).then(handle);
}
