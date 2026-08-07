import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../lib/cookies.js";
import { seedData } from "../lib/seed.js";

export default async function handler(req, res) {
  if (!(await requireAuth(req, res, supabase))) return;

  if (req.method === "GET") {
    const { data, error } = await supabase.rpc("get_full_data");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const { payload, expectedVersion } = req.body || {};
    if (!payload) return res.status(400).json({ error: "Missing request body" });
    if (expectedVersion === undefined || expectedVersion === null) {
      return res.status(400).json({ error: "expectedVersion is required — every save must say which version of the data it started from, so a stale save from an old tab can be rejected rather than silently overwriting newer changes." });
    }

    const { data, error } = await supabase.rpc("replace_full_data_if_version", { payload, expected_version: expectedVersion });

    if (error) {
      if (error.message?.includes("VERSION_CONFLICT")) {
        return res.status(409).json({
          error: "This data has changed elsewhere since you loaded this page — likely another tab or a previous session. Your changes were not saved, to avoid overwriting the newer data. Reload the page to get the current version, then redo your change.",
          code: "VERSION_CONFLICT"
        });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  // Reset to seed data — folded in here (was its own file) to stay within
  // Vercel's 12 Serverless Function limit on the Hobby plan.
  if (req.method === "POST") {
    const { data, error } = await supabase.rpc("replace_full_data", { payload: seedData });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Method not allowed" });
}
