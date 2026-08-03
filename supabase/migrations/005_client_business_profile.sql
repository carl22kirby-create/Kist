-- Applied directly to the live kist-one Supabase project on 2026-08-03.
-- Adds the Business Profile field that drives the dynamic assessment engine.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}'::jsonb;

-- get_full_data() and replace_full_data() were also updated to read/write
-- this column — see 002_get_full_data.sql and 003_replace_full_data.sql for
-- the full function bodies; re-running those two files after this one
-- reproduces the current live versions exactly.
