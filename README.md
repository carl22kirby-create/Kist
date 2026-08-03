# KIST One — v4.0.0 (Vercel + Supabase)

Password-protected app, running entirely on Vercel (frontend + serverless
API) and Supabase (Postgres database).

## What's already done for you

- A dedicated Supabase project called **kist-one** (separate from your other
  Supabase projects, on the free tier — £0/month) is live with the full
  schema and seed data already in it. I tested every database function
  directly against it before writing any app code — inserts, reads,
  sessions, all confirmed working.
- All the app code — serverless functions in `api/`, shared helpers in
  `lib/`, unchanged frontend in `src/`.

## What you still need to do

### 1. Get your Supabase service role key
In the Supabase dashboard: open the **kist-one** project → **Project
Settings → API** → copy the **service_role** key (not the anon/public one).
This is secret — it grants full database access, bypassing all row-level
security. Never put it in frontend code or commit it to git.

### 2. Generate your login password hash
Locally, in this project folder:
```
npm install
npm run hash-password -- "choose-a-real-password"
```
Copy the long string it prints. That's your `PASSWORD_HASH` value — the
plain password itself doesn't go anywhere except your own head.

### 3. Deploy to Vercel
1. Push this project to your GitHub repo (the same `Kist` repo you already
   have set up).
2. In Vercel, **Add New → Project → Import** your GitHub repo.
3. Vercel will detect the Vite framework automatically (via `vercel.json`).
4. Before deploying, add these **Environment Variables** in the project
   settings:
   - `SUPABASE_URL` = `https://gigitazwycombckueiwt.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = *(the key from step 1)*
   - `PASSWORD_HASH` = *(the hash from step 2)*
   - `SESSION_TTL_HOURS` = `168` (or whatever you'd prefer — this is how
     many hours a login lasts)
   - `NODE_ENV` = `production`
5. Deploy. Vercel gives you a URL like `kist-one.vercel.app` — that's your
   live site. Add a custom domain later under Project → Settings → Domains.

## Running locally

```
cp .env.example .env
# edit .env: paste in your real SUPABASE_SERVICE_ROLE_KEY and PASSWORD_HASH

npm install
npm run dev
```
`npm run dev` runs `vercel dev`, which serves the frontend and the `/api`
serverless functions together on one local URL (it'll tell you which port,
usually http://localhost:3000). You don't need a separate frontend/backend
terminal like the old Railway version — that's specific to how Vercel's
CLI emulates the deployed environment locally.

## First-time smoke test

Same checklist as before, worth actually running through once deployed:
1. Visit the live URL — should show the login screen, not the app.
2. Log in with your password — should land on the Dashboard, and you
   should see the 3 real demo clients (Demo Company Ltd, ABC Engineering,
   Stafford Logistics) already there from the seed data.
3. Add a test client, refresh — it should still be there.
4. Settings → Reset to Seed Data — should go back to the 3 demo clients.
5. Open the site in a private/incognito window — should ask you to log in
   again separately.

## Business Knowledge Engine (v5.0.0)

This replaces the fixed industry/capability/regulatory module arrays from
v4.3 with a single flat, tagged concept library. There's no such thing as
"the Logistics module" as a block of content anymore — a module is just a
saved combination of tags, and any concept can carry tags across as many
industries, capabilities and regulations as genuinely apply to it. One
concept (Stock Accuracy, say) is authored once and appears everywhere it's
tagged, rather than being duplicated per industry.

Every item in the library is now an **Assessment Item**:
`concept`, `question`, `category` (still rolls into the 11 KIST DNA
dimensions), `tags`, `evidenceRequired`, `observationPoints`,
`scoringGuidance`, `recommendations`. See `src/data/moduleLibrary.js` for
the concept library itself.

**Dependencies** are the new piece: a Business Profile now also captures a
small set of yes/no business characteristics (does this business have a
warehouse, operate its own transport, manufacture, sell online). Answering
"No" to one of these **hard-excludes** every item carrying the related tag
— even if another tag on that same item would otherwise include it. This is
what makes the assessment genuinely shrink as more is learned about a
business, rather than only ever growing from manual tag selection. See
`dependencyQuestions` in `moduleLibrary.js` and `activeExclusionsForProfile`
in `assessmentEngine.js`.

I verified this behaviour directly before shipping it: with a client tagged
both Retail and Warehouse, answering "No warehouse" removes Stock Accuracy
entirely, even though the Retail tag alone would still match it — confirmed
with an automated test, not just visual inspection.

**Content scope, deliberately**: this pass starts with 15 concepts, not
thousands. The engine and schema are what took the real work; growing the
library is now a pure content exercise — add an object to
`conceptLibrary` with the right tags and it's live everywhere those tags
apply, no other code changes needed.

## Architecture

- **Frontend**: unchanged from the Railway version — same pages, same
  `src/api.js` calls. It doesn't know or care that the backend changed.
- **API**: `api/*.js` — one file per route, each a Vercel serverless
  function (`export default function handler(req, res)`). No framework;
  plain Node request/response objects, same pattern Vercel expects.
- **Auth**: `lib/auth.js` (password hashing, unchanged from before — scrypt
  via Node's built-in `crypto`), `lib/cookies.js` (cookie parsing + the
  `requireAuth` check every data route uses).
- **Database**: `lib/supabase.js` creates one Supabase client using the
  service role key. All actual data logic lives in Postgres itself as two
  functions — `get_full_data()` and `replace_full_data(payload)` — called
  via `supabase.rpc(...)`. This matters for serverless specifically: rather
  than a function opening a database connection, running a dozen queries in
  a client-side transaction, and closing it (expensive and fragile when
  every request is a fresh, short-lived process), the whole read or write
  happens as one round trip, with Postgres itself guaranteeing the write is
  atomic.
- **Migrations**: `supabase/migrations/*.sql` — the exact SQL already
  applied to the live project, kept in the repo so the schema history is
  version-controlled and reproducible if you ever need a fresh project.

## Known limitations, still worth knowing about

- **Single shared password**, not per-user accounts — same as before.
- **Full-blob sync**: `PUT /api/data` still replaces the whole dataset each
  save via `replace_full_data`. Fine for one person; two people saving at
  the same moment will still silently overwrite each other.
- **No rate limiting on `/api/login`.** Low risk with an unlisted URL and a
  decent password, but worth hardening later if you want to be thorough.
- **Cold starts.** Serverless functions can take a moment to "wake up" on
  the first request after a period of no traffic. Not usually noticeable
  for a single-user internal tool, but worth knowing if a request feels
  slow the first time each day.
- **No automatic backups configured yet.** Supabase's dashboard has backup
  options — worth turning on once real client data is in here, same
  guidance as before, just a different dashboard now.
