-- Applied directly to the live kist-one Supabase project on 2026-08-03.
-- Adds a table for Assessment Rounds — snapshots of a client's assessment
-- answers at a point in time, used to show "previous round" context when
-- revisiting a question during a later reassessment.

CREATE TABLE assessment_rounds (
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rounds_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  PRIMARY KEY (client_id)
);

-- get_full_data() and replace_full_data() were also updated to read/write
-- this table under the "assessmentRounds" key — see 002_get_full_data.sql
-- and 003_replace_full_data.sql for the full current function bodies.
