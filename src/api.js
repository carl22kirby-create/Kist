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
