export const COOKIE_NAME = "kist_session";

export function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function setSessionCookie(res, token, ttlHours) {
  const maxAgeSeconds = Number(ttlHours) * 3600;
  const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  res.setHeader("Set-Cookie", [
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${isProd ? "; Secure" : ""}`
  ]);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", [`${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`]);
}

// Returns true and lets the caller continue if the session is valid;
// otherwise sends the 401 itself and returns false so the caller can `return`.
export async function requireAuth(req, res, supabase) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  const { data, error } = await supabase.rpc("is_session_valid", { p_token: token });
  if (error) {
    res.status(500).json({ error: error.message });
    return false;
  }
  if (!data) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}
