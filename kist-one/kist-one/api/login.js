import { supabase } from "../lib/supabase.js";
import { verifyPassword, generateToken } from "../lib/auth.js";
import { setSessionCookie } from "../lib/cookies.js";

const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS) || 168;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const passwordHash = process.env.PASSWORD_HASH;
  if (!passwordHash) {
    return res.status(500).json({ error: "Server has no PASSWORD_HASH configured. Set it in your environment." });
  }

  const password = req.body?.password || "";
  if (!verifyPassword(password, passwordHash)) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const token = generateToken();
  const { error } = await supabase.rpc("create_session", { p_token: token, p_ttl_hours: SESSION_TTL_HOURS });
  if (error) return res.status(500).json({ error: error.message });

  setSessionCookie(res, token, SESSION_TTL_HOURS);
  res.status(200).json({ authenticated: true });
}
