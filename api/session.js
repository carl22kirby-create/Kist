import { supabase } from "../lib/supabase.js";
import { parseCookies, COOKIE_NAME } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return res.status(200).json({ authenticated: false });

  const { data, error } = await supabase.rpc("is_session_valid", { p_token: token });
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ authenticated: !!data });
}
