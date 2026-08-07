-- Applied directly to the live kist-one Supabase project on 2026-08-07,
-- alongside 011_critical_security_revoke_anon.sql.
--
-- Login previously had no rate limiting at all — unlimited password
-- attempts were possible. scrypt (used for password hashing, see
-- lib/auth.js) is deliberately slow, but that alone isn't real
-- protection: Vercel can run many function invocations in parallel, so a
-- scripted brute-force attempt could still make many concurrent guesses.
--
-- Tracks attempts per IP address in a real table, since serverless
-- functions have no memory between requests to count attempts
-- in-process. More than 10 failures from the same address in 15 minutes
-- blocks further attempts (see the login handler in api/auth.js) until
-- the window passes.

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at);

CREATE OR REPLACE FUNCTION count_recent_failed_logins(p_ip TEXT, p_minutes INTEGER)
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT COUNT(*)::int FROM login_attempts
  WHERE ip_address = p_ip AND success = false AND attempted_at > now() - (p_minutes || ' minutes')::interval;
$$;

-- Records the attempt and opportunistically clears attempts older than a
-- day, so this table never grows unbounded without needing a separate
-- scheduled cleanup job.
CREATE OR REPLACE FUNCTION record_login_attempt(p_ip TEXT, p_success BOOLEAN)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO login_attempts (ip_address, success) VALUES (p_ip, p_success);
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 day';
END;
$$;

REVOKE ALL ON login_attempts FROM anon, authenticated;
REVOKE ALL ON FUNCTION count_recent_failed_logins(text, integer) FROM anon, authenticated;
REVOKE ALL ON FUNCTION record_login_attempt(text, boolean) FROM anon, authenticated;
