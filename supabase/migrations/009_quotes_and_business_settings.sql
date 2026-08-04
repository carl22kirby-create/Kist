-- Applied directly to the live kist-one Supabase project on 2026-08-04.
--
-- Adds Quotes as a genuine audit record. Deliberately built OUTSIDE the
-- general replace_full_data sync used for everything else in this app —
-- that pattern replaces an entire dataset from browser memory on every
-- save, which is fine for day to day editing but wrong for a financial
-- document that needs a real, tamper-resistant audit trail. A quote can
-- only be created (create_quote) or have its status changed
-- (update_quote_status) via narrow, dedicated operations — its financial
-- content can never be silently rewritten by the general save mechanism,
-- and it is not affected by Settings > Reset to Seed Data.
--
-- Also adds Business Settings — the legal details (name, structure,
-- company number, registered office, address, liability cap) that get
-- substituted into the Terms and Conditions template attached to every
-- quote. Each quote freezes a snapshot of these details at the moment of
-- issue, so correcting a detail later doesn't rewrite the historical
-- record of what was actually issued.

CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  legal_name TEXT NOT NULL DEFAULT '',
  business_structure TEXT NOT NULL DEFAULT '',
  company_number TEXT NOT NULL DEFAULT '',
  registered_office TEXT NOT NULL DEFAULT '',
  principal_address TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'kistconsultinguk@gmail.com',
  website TEXT NOT NULL DEFAULT 'kistconsulting.co.uk',
  liability_cap TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO business_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL UNIQUE,
  issued_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  services_description TEXT NOT NULL DEFAULT '',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20,
  vat_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  business_details_snapshot JSONB NOT NULL,
  terms_version TEXT NOT NULL DEFAULT '2026-08-04',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'Carl Kirby'
);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);

CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Functions: next_quote_number(), get_business_settings(),
-- update_business_settings(details), create_quote(...),
-- get_quotes_for_client(client_id), update_quote_status(id, status).
-- See the live database for full current function bodies — these were
-- tested directly (create, list, invalid-status rejection all confirmed)
-- before any application code was written.
