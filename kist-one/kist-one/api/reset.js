import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";
import { seedData } from "../lib/seed.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await requireAuth(req, res, supabase))) return;

  const { data, error } = await supabase.rpc("replace_full_data", { payload: seedData });
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
