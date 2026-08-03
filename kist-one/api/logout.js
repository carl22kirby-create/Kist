import { supabase } from "../lib/supabase.js";
import { parseCookies, clearSessionCookie, COOKIE_NAME } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (token) {
    const { error } = await supabase.rpc("delete_session", { p_token: token });
    if (error) return res.status(500).json({ error: error.message });
  }

  clearSessionCookie(res);
  res.status(200).json({ authenticated: false });
}
