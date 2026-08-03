-- Applied to Supabase project "kist-one" (gigitazwycombckueiwt) on 2026-08-03.
-- This file documents that migration for version control; re-running it
-- against a fresh project reproduces the same schema.

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  turnover TEXT,
  website TEXT,
  address TEXT,
  score INTEGER DEFAULT 0,
  previous INTEGER DEFAULT 0,
  health TEXT,
  status TEXT,
  notes TEXT
);

CREATE TABLE client_tags (
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);

-- Named client_contacts rather than "contacts" because this project is
-- deliberately separate from any other Supabase project you may have that
-- already uses that table name.
CREATE TABLE client_contacts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date TEXT,
  type TEXT,
  title TEXT
);

CREATE TABLE schedule (
  id TEXT PRIMARY KEY,
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  client_id TEXT,
  client_name TEXT,
  type TEXT,
  consultant TEXT,
  location TEXT,
  status TEXT,
  colour TEXT
);

CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  title TEXT,
  owner TEXT,
  priority TEXT,
  status TEXT,
  due TEXT
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  title TEXT,
  status TEXT
);

CREATE TABLE assessments (
  client_id TEXT PRIMARY KEY,
  answers_json JSONB NOT NULL
);

CREATE TABLE widget_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  settings JSONB NOT NULL
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
