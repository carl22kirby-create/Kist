-- Applied directly to the live kist-one Supabase project on 2026-08-04.
-- Adds storage for photo and document evidence captured during a visit
-- (Business Walkthrough and Evidence Review stages).

-- Real file storage — a private bucket, accessed only through the
-- authenticated /api/upload.js endpoint using the service role key.
-- Never made public; files are served via signed URLs generated on upload.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('evidence-files', 'evidence-files', false, 8388608, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Metadata (path, signed URL, caption, include-in-report flag) lives on
-- the client record itself, alongside profile and everything else.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS evidence_files JSONB DEFAULT '[]'::jsonb;

-- get_full_data() and replace_full_data() were also updated to read/write
-- this column under the "evidenceFiles" key — see 002_get_full_data.sql and
-- 003_replace_full_data.sql for the full current function bodies.
