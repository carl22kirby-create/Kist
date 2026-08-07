import { supabase } from "../lib/supabase.js";
import { verifyPassword, generateToken } from "../lib/auth.js";
import { setSessionCookie, clearSessionCookie, parseCookies, COOKIE_NAME } from "../lib/cookies.js";

const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS) || 168;

// Consolidates what were four separate files (health, session, login,
// logout) into one, dispatched by ?action=. Vercel's Hobby plan caps
// Serverless Functions at 12 per project — every file under /api counts
// as one, regardless of how small — so this kind of consolidation is
// necessary headroom, not just tidiness, as the number of real features
// grows.
export default async function handler(req, res) {
  const action = req.query.action || (req.method === "GET" ? "session" : null);

  if (action === "health") {
    return res.status(200).json({ status: "ok", time: new Date().toISOString() });
  }

  if (action === "session") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];
    if (!token) return res.status(200).json({ authenticated: false });

    const { data, error } = await supabase.rpc("is_session_valid", { p_token: token });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ authenticated: !!data });
  }

  if (action === "login") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // Rate limit before even checking the password — scrypt is
    // deliberately slow, but Vercel can run many invocations in parallel,
    // so that slowness alone isn't real protection against a scripted
    // brute-force attempt.
    const ip = (req.headers["x-forwarded-for"]?.split(",")[0].trim()) || req.socket?.remoteAddress || "unknown";
    const { data: recentFailures, error: rateError } = await supabase.rpc("count_recent_failed_logins", { p_ip: ip, p_minutes: 15 });
    if (rateError) return res.status(500).json({ error: rateError.message });
    if (recentFailures >= 10) {
      return res.status(429).json({ error: "Too many failed attempts from this network. Try again in 15 minutes." });
    }

    const passwordHash = process.env.PASSWORD_HASH;
    if (!passwordHash) {
      return res.status(500).json({ error: "Server has no PASSWORD_HASH configured. Set it in your environment." });
    }
    const password = req.body?.password || "";
    if (!verifyPassword(password, passwordHash)) {
      await supabase.rpc("record_login_attempt", { p_ip: ip, p_success: false });
      return res.status(401).json({ error: "Incorrect password" });
    }
    await supabase.rpc("record_login_attempt", { p_ip: ip, p_success: true });
    const token = generateToken();
    const { error } = await supabase.rpc("create_session", { p_token: token, p_ttl_hours: SESSION_TTL_HOURS });
    if (error) return res.status(500).json({ error: error.message });
    setSessionCookie(res, token, SESSION_TTL_HOURS);
    return res.status(200).json({ authenticated: true });
  }

  if (action === "logout") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];
    if (token) {
      const { error } = await supabase.rpc("delete_session", { p_token: token });
      if (error) return res.status(500).json({ error: error.message });
    }
    clearSessionCookie(res);
    return res.status(200).json({ authenticated: false });
  }

  return res.status(400).json({ error: "Unknown or missing action. Use ?action=health|session|login|logout" });
}
