-- Applied directly to the live kist-one Supabase project on 2026-08-07.
-- CRITICAL SECURITY FIX — read this before touching grants again.
--
-- Before this migration, the anon and authenticated Postgres roles had
-- full SELECT/INSERT/UPDATE/DELETE on every table in this schema and
-- EXECUTE on every function, including get_full_data(). Row Level
-- Security was (and remains) disabled on every table.
--
-- This app was never designed to rely on RLS or Supabase Auth. Access
-- control lives entirely in the password/session layer inside the API
-- functions (requireAuth in lib/cookies.js) — that was always the
-- intended design. But that layer is enforced by this app's own code,
-- not by Postgres. With anon holding real grants, anyone in possession of
-- this project's anon key could call the database directly via
-- Supabase's REST API — e.g. POST /rest/v1/rpc/get_full_data — and
-- receive every client's complete data, with no password required at
-- all, completely independent of and bypassing this app's login screen.
--
-- Fixed by revoking everything from anon and authenticated, and fixing
-- default privileges so a future migration run through the Supabase SQL
-- editor doesn't silently reopen this (Supabase's editor grants broadly
-- to these roles by default unless overridden).
--
-- service_role — the only role this app's server-side code actually
-- uses, via SUPABASE_SERVICE_ROLE_KEY, never exposed to the frontend —
-- has its own separate, explicit grants and was confirmed unaffected.

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- If you ever add a new table or function directly via the Supabase
-- dashboard SQL editor rather than through a migration file tracked here,
-- double check afterward that it didn't get default anon/authenticated
-- grants — the ALTER DEFAULT PRIVILEGES above only covers objects
-- created by the same role that ran this migration.

-- Also added in this same release: login rate limiting (login_attempts
-- table, count_recent_failed_logins(), record_login_attempt() — see
-- 012_login_rate_limiting.sql for the full definitions), since Vercel's
-- serverless functions have no persistent memory between invocations to
-- track attempts in-process.
