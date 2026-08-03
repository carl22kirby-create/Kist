CREATE OR REPLACE FUNCTION create_session(p_token text, p_ttl_hours numeric)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO sessions (token, expires_at) VALUES (p_token, now() + (p_ttl_hours || ' hours')::interval);
$$;

CREATE OR REPLACE FUNCTION is_session_valid(p_token text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (SELECT 1 FROM sessions WHERE token = p_token AND expires_at > now());
$$;

CREATE OR REPLACE FUNCTION delete_session(p_token text)
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM sessions WHERE token = p_token;
$$;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM sessions WHERE expires_at <= now();
$$;
