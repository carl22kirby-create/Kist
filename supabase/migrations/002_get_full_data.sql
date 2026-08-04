-- Reassembles all app data into the single JSON shape the frontend expects,
-- in one round trip instead of a dozen separate queries per request.
--
-- Updated 2026-08-04 to include the client "profile" JSONB column
-- (migration 005), "assessmentRounds" data (migration 006), and
-- "evidenceFiles" (migration 007). This is the current live version on
-- Supabase.
CREATE OR REPLACE FUNCTION get_full_data()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'clients', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id, 'name', c.name, 'industry', c.industry, 'size', c.size,
        'turnover', c.turnover, 'website', c.website, 'address', c.address,
        'score', c.score, 'previous', c.previous, 'health', c.health,
        'status', c.status, 'notes', c.notes, 'profile', COALESCE(c.profile, '{}'::jsonb),
        'evidenceFiles', COALESCE(c.evidence_files, '[]'::jsonb),
        'tags', COALESCE((SELECT jsonb_agg(t.tag) FROM client_tags t WHERE t.client_id = c.id), '[]'::jsonb),
        'contacts', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', p.id, 'name', p.name, 'role', p.role, 'email', p.email,
            'phone', p.phone, 'primary', p.is_primary
          )) FROM client_contacts p WHERE p.client_id = c.id
        ), '[]'::jsonb),
        'timeline', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', t.id, 'date', t.date, 'type', t.type, 'title', t.title
          ) ORDER BY t.date DESC) FROM timeline_events t WHERE t.client_id = c.id
        ), '[]'::jsonb)
      ) ORDER BY c.name)
      FROM clients c
    ), '[]'::jsonb),
    'schedule', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id, 'date', s.date, 'start', s.start_time, 'end', s.end_time,
        'clientId', s.client_id, 'client', s.client_name, 'type', s.type,
        'consultant', s.consultant, 'location', s.location, 'status', s.status, 'colour', s.colour
      )) FROM schedule s
    ), '[]'::jsonb),
    'actions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id, 'clientId', a.client_id, 'client', a.client_name, 'title', a.title,
        'owner', a.owner, 'priority', a.priority, 'status', a.status, 'due', a.due
      )) FROM actions a
    ), '[]'::jsonb),
    'reports', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id, 'clientId', r.client_id, 'client', r.client_name, 'title', r.title, 'status', r.status
      )) FROM reports r
    ), '[]'::jsonb),
    'assessments', COALESCE((
      SELECT jsonb_object_agg(a.client_id, a.answers_json) FROM assessments a
    ), '{}'::jsonb),
    'assessmentRounds', COALESCE((
      SELECT jsonb_object_agg(ar.client_id, ar.rounds_json) FROM assessment_rounds ar
    ), '{}'::jsonb),
    'widgets', (SELECT w.settings FROM widget_settings w WHERE w.id = 1)
  ) INTO result;

  RETURN result;
END;
$$;
