-- Applied directly to the live kist-one Supabase project on 2026-08-04.
--
-- Fixes a real data-loss risk: the app previously had no protection
-- against a stale browser tab (holding older data in memory — from before
-- a deploy, or just left open from an earlier session) silently
-- overwriting newer data on its next save, since every save replaced the
-- entire dataset with no check on whether it was still current.

CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sync_state (id, version) VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;

-- get_full_data() now also returns 'syncVersion'. replace_full_data()
-- increments the version on every successful write (used by both normal
-- saves and the reset endpoint). replace_full_data_if_version(payload,
-- expected_version) is the new entry point normal saves actually use — it
-- atomically checks the expected version matches what's live before
-- writing anything, and raises a VERSION_CONFLICT exception if not, which
-- api/data.js turns into a clean 409 response.
--
-- See 002_get_full_data.sql and 003_replace_full_data.sql for the full
-- current function bodies — both were updated in place rather than
-- versioned separately here, consistent with how every other schema
-- change in this project has been tracked.
