import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.");
}

// Service role key bypasses Row Level Security — this is intentional here:
// access control for this app is handled entirely by the password/session
// layer in these API functions, not by Postgres RLS policies. Never expose
// this key to the frontend; it only ever lives in serverless function
// environment variables.
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});
