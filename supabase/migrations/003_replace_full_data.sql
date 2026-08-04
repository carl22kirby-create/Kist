-- Transactional wipe-and-rewrite of every table from one posted JSON blob.
--
-- Updated 2026-08-04 to include the client "profile" JSONB column
-- (migration 005), "assessmentRounds" data (migration 006),
-- "evidenceFiles" (migration 007), and version incrementing on every
-- write (migration 008) so stale saves from an old tab can be detected.
-- This is the current live version on Supabase. See 008_sync_version.sql
-- for replace_full_data_if_version(), the atomic check-then-write wrapper
-- normal saves actually call.
CREATE OR REPLACE FUNCTION replace_full_data(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  c jsonb;
  s jsonb;
  a jsonb;
  r jsonb;
  contact jsonb;
  item jsonb;
  assessment_key text;
  round_key text;
BEGIN
  DELETE FROM client_tags;
  DELETE FROM client_contacts;
  DELETE FROM timeline_events;
  DELETE FROM clients;
  DELETE FROM schedule;
  DELETE FROM actions;
  DELETE FROM reports;
  DELETE FROM assessments;
  DELETE FROM assessment_rounds;

  FOR c IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'clients', '[]'::jsonb))
  LOOP
    INSERT INTO clients (id, name, industry, size, turnover, website, address, score, previous, health, status, notes, profile, evidence_files)
    VALUES (
      c->>'id', c->>'name', COALESCE(c->>'industry',''), COALESCE(c->>'size',''),
      COALESCE(c->>'turnover',''), COALESCE(c->>'website',''), COALESCE(c->>'address',''),
      COALESCE((c->>'score')::int, 0), COALESCE((c->>'previous')::int, 0),
      COALESCE(c->>'health',''), COALESCE(c->>'status',''), COALESCE(c->>'notes',''),
      COALESCE(c->'profile', '{}'::jsonb), COALESCE(c->'evidenceFiles', '[]'::jsonb)
    );

    IF c->'tags' IS NOT NULL THEN
      INSERT INTO client_tags (client_id, tag)
      SELECT c->>'id', tag_value FROM jsonb_array_elements_text(c->'tags') AS tag_value;
    END IF;

    IF c->'contacts' IS NOT NULL THEN
      FOR contact IN SELECT * FROM jsonb_array_elements(c->'contacts')
      LOOP
        INSERT INTO client_contacts (id, client_id, name, role, email, phone, is_primary)
        VALUES (
          contact->>'id', c->>'id', COALESCE(contact->>'name',''), COALESCE(contact->>'role',''),
          COALESCE(contact->>'email',''), COALESCE(contact->>'phone',''),
          COALESCE((contact->>'primary')::boolean, false)
        );
      END LOOP;
    END IF;

    IF c->'timeline' IS NOT NULL THEN
      FOR item IN SELECT * FROM jsonb_array_elements(c->'timeline')
      LOOP
        INSERT INTO timeline_events (id, client_id, date, type, title)
        VALUES (item->>'id', c->>'id', COALESCE(item->>'date',''), COALESCE(item->>'type',''), COALESCE(item->>'title',''));
      END LOOP;
    END IF;
  END LOOP;

  FOR s IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'schedule', '[]'::jsonb))
  LOOP
    INSERT INTO schedule (id, date, start_time, end_time, client_id, client_name, type, consultant, location, status, colour)
    VALUES (
      s->>'id', COALESCE(s->>'date',''), COALESCE(s->>'start',''), COALESCE(s->>'end',''),
      COALESCE(s->>'clientId',''), COALESCE(s->>'client',''), COALESCE(s->>'type',''),
      COALESCE(s->>'consultant',''), COALESCE(s->>'location',''), COALESCE(s->>'status',''), COALESCE(s->>'colour','')
    );
  END LOOP;

  FOR a IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'actions', '[]'::jsonb))
  LOOP
    INSERT INTO actions (id, client_id, client_name, title, owner, priority, status, due)
    VALUES (
      a->>'id', COALESCE(a->>'clientId',''), COALESCE(a->>'client',''), COALESCE(a->>'title',''),
      COALESCE(a->>'owner',''), COALESCE(a->>'priority',''), COALESCE(a->>'status',''), COALESCE(a->>'due','')
    );
  END LOOP;

  FOR r IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'reports', '[]'::jsonb))
  LOOP
    INSERT INTO reports (id, client_id, client_name, title, status)
    VALUES (
      r->>'id', COALESCE(r->>'clientId',''), COALESCE(r->>'client',''), COALESCE(r->>'title',''), COALESCE(r->>'status','')
    );
  END LOOP;

  IF payload->'assessments' IS NOT NULL THEN
    FOR assessment_key IN SELECT * FROM jsonb_object_keys(payload->'assessments')
    LOOP
      INSERT INTO assessments (client_id, answers_json) VALUES (assessment_key, payload->'assessments'->assessment_key);
    END LOOP;
  END IF;

  IF payload->'assessmentRounds' IS NOT NULL THEN
    FOR round_key IN SELECT * FROM jsonb_object_keys(payload->'assessmentRounds')
    LOOP
      INSERT INTO assessment_rounds (client_id, rounds_json) VALUES (round_key, payload->'assessmentRounds'->round_key);
    END LOOP;
  END IF;

  IF payload->'widgets' IS NOT NULL THEN
    INSERT INTO widget_settings (id, settings) VALUES (1, payload->'widgets')
    ON CONFLICT (id) DO UPDATE SET settings = excluded.settings;
  END IF;

  UPDATE sync_state SET version = version + 1, updated_at = now() WHERE id = 1;

  RETURN get_full_data();
END;
$$;

CREATE OR REPLACE FUNCTION replace_full_data_if_version(payload jsonb, expected_version bigint)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_version bigint;
BEGIN
  SELECT version INTO current_version FROM sync_state WHERE id = 1;

  IF current_version IS DISTINCT FROM expected_version THEN
    RAISE EXCEPTION 'VERSION_CONFLICT: data has changed since it was loaded (expected %, current %)', expected_version, current_version
      USING ERRCODE = 'P0001';
  END IF;

  RETURN replace_full_data(payload);
END;
$$;
