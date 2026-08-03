import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;

  if (req.method === "GET") {
    const { data, error } = await supabase.rpc("get_full_data");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: "Missing request body" });
    const { data, error } = await supabase.rpc("replace_full_data", { payload });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
