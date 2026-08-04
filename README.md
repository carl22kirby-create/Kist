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

## KIST Knowledge Base (v5.1.0)

The concept library from v5.0 has been split into four independently
editable layers per concept, rather than one flat object:

- **Business Concept** — name, purpose, category, tags. Essentially never
  changes.
- **Assessment Method** — the question, evidence required, observation
  points, metrics, review frequency. How we currently assess it.
- **Scoring Framework** — six bands (0-5), each with a maturity label
  (Foundation -> Foundation -> Intermediate -> Advanced -> Best Practice ->
  Industry Leading) and a description specific to that concept. How we
  currently score it.
- **Improvement Library** — a recommendation for each of the six scores.
  What we currently suggest.

The maturity label *structure* (six bands, five named tiers) is shared
across every concept — if the scale itself ever changes, that's one change
to the shape in `assessmentEngine.js`, not an edit to each concept's
content. The band *descriptions* and *recommendations* stay specific to
each concept, since "no stock control" only means something for Stock
Accuracy.

See `src/data/knowledgeBase.js` for the concept content itself, and
`src/utils/assessmentEngine.js` for how it's flattened into the shape the
rest of the app (scoring, reports, the assessment UI) already understands
— that flattening is deliberate: the four-layer separation is how the
Knowledge Base is authored and maintained, not necessarily how every
downstream feature needs to consume it.

I verified the migration preserved every existing test from the previous
version — flat tag reuse across industries, hard-veto dependency exclusion,
and no loss of already-scored client answers — before treating this as
done.

## Assessment Workflow (v5.2.0)

Every assessment item now supports the full lifecycle rather than a single
score and note field:

- **Discussion questions**: each Knowledge Base concept can carry
  supporting questions and follow-up questions alongside its primary
  question, shown together in the assessment UI as prompts for a real
  conversation, not a rigid script.
- **Observation notes**: positives, concerns and risks recorded separately,
  plus interactive checklists for the concept's evidence-to-request and
  preparation/observation points (these reuse `evidenceRequired` and
  `observationPoints` from the Knowledge Base — no new content structure
  needed for that part).
- **Consultant Assessment**: strengths, weaknesses, risks, opportunities
  and an overall note, recorded independently of the client-facing
  discussion notes.
- **Mandatory justification**: a score with no justification text is
  flagged incomplete.
- **Improvement Plan**: automatically required for any score of 1-3 (a
  score of 4-5 needs no plan). All 12 fields from the spec — required,
  expected outcome, recommended actions, priority, business impact, owner,
  target date, review date, success measure, target score, progress
  status, consultant recommendation.
- **Automatic Action creation**: a completed Improvement Plan writes
  directly into the client's Actions list — verified with an automated
  test: title, owner, priority and due date all flow through correctly,
  and re-saving updates rather than duplicating the action.
- **Assessment Rounds**: a "Save Assessment Round" button snapshots the
  current answers. Revisiting a question that has a saved round shows that
  previous score and justification inline, so a reassessment has real
  before/after context. This required a genuine new database table
  (`assessment_rounds`), added and tested directly against the live
  Supabase project before any app code was written.

**What this deliberately isn't**: a full separate "review mode" workflow
with its own navigation, or historical trend charts across many rounds.
Rounds are a snapshot-and-compare mechanism, not yet a full audit trail —
extending it to show a trend across three or more rounds, or to browse
rounds other than the most recent one, is a reasonable next step once
there's real round history to look at.

**Completion is a soft gate, on purpose**: an incomplete item shows a
badge and counts toward a warning in the assessment sidebar, but nothing
blocks moving between questions. It only becomes a hard requirement if you
later decide a "finalise assessment" action should check it — that button
doesn't exist yet, since forcing every one of potentially 265 items to be
fully justified before allowing any kind of save didn't seem like the
right default for how a real visit actually flows.

## Consultant Guidance (v5.3.0)

A fifth Knowledge Base layer per concept, alongside Business Concept,
Assessment Method, Scoring Framework and Improvement Library. Unlike the
other four, this one is never client-facing — it exists purely to sharpen
a consultant's judgement in the moment, and is shown as a collapsible
"Show Consultant Guidance" panel during the assessment, hidden by default.

Each concept's guidance covers seven things:

- **If the client says...** — common canned answers and what they usually
  mean, so a confident-sounding response doesn't get taken at face value.
- **Look for** — what to physically check, beyond just listening.
- **Warning signs** — patterns that suggest a weaker answer than it sounds.
- **Typical evidence** — what genuine evidence actually looks like, not
  just what's claimed.
- **Common excuses** — and a specific probe to see past each one.
- **Industry best practice** — what strong performance genuinely looks
  like for this concept.
- **Questions to probe deeper** — for when the first answer feels thin.

This is what lets a junior consultant assess with something closer to a
senior consultant's instinct, per the brief — the tacit knowledge that
normally only comes from experience is captured once, per concept, and
available to anyone using the tool.

All 15 concepts have real guidance content written for them — see
`src/data/knowledgeBase.js`. Universal questions don't yet have this layer
authored (the panel will say so rather than showing nothing silently),
consistent with the same honest scoping used for scoring and improvement
content in earlier versions.

## Consultant Layer and BPI Rename (v5.4.0)

Assessment Items are now called **Business Performance Indicators (BPIs)**
throughout the user-facing app, matching the KIST Business Performance
Index / Score branding — you're measuring named indicators, not answering
a random list of questions.

Nine of the ten requested features are built and tested:

1. **Assessment Status** — inferred automatically from what's actually been
   recorded (observation notes, evidence, discussion notes, score,
   improvement plan), not a manual toggle the consultant has to remember.
2. **Traffic Light** — pure function of score: 🟢 Strong, 🟡 Opportunity,
   🟠 Weak, 🔴 Critical, ⚫ Not Assessed.
3. **Professional Judgement** — mandatory once a BPI is scored (Better /
   About as expected / Worse than expected), separate from the score
   itself.
4. **Escalation Flags** — Immediate Risk, Legal Concern, Financial Concern,
   Safeguarding, Health and Safety, Fraud Concern, Reputational Risk.
   Flagging one surfaces it on the Dashboard (across every client, not
   just the one you're currently viewing) and in a dedicated section near
   the top of the printable client report.
5. **Cross References** — a quiet suggestion, never automatic. Each
   Knowledge Base concept carries `relatedConcepts`; scoring one 2 or below
   surfaces "you may also wish to review..." for the related concepts that
   actually exist in this client's assembled assessment (one excluded by a
   dependency simply won't be suggested).
6. **Assessment Timeline** — started, last edited, completed, reviewed by,
   and a history log. The log only records genuine milestones (scored,
   plan completed, marked complete) — I tested this specifically: four
   simulated keystrokes produced zero history entries, while a score
   change produced exactly one.
9. **Evidence Strength** — a star rating from 1 to 5. Stated plainly: this
   measures whether evidence was *captured* (checklist coverage, note
   length), not whether the evidence is actually *good* — that judgement
   still belongs to the consultant.
10. **Assessment Quality Score** — separate from the Business Performance
   Score entirely. Shows percent complete plus exactly what's outstanding
   (observations missing, evidence outstanding, incomplete plans), in the
   assessment sidebar at all times.

Two features got a scoped, honestly-labelled version rather than the full
vision:

7. **Business Story Builder** — implemented as a deterministic keyword
   matcher (`suggestStoryTags` in `scoring.js`), not language
   understanding. It suggests draft theme tags under a note as you type,
   which the consultant clicks to confirm or ignore. It will miss nuance
   and mistag figurative language — it's a starting draft, never an
   authoritative tag, and is presented as such in the UI.

**8. Contradictions — deliberately not built.** This is the one feature I
want to be direct about. Detecting "client says X, but observation and
evidence suggest otherwise" requires actually understanding what free text
*means* across three separate fields, well enough to flag a genuine
disagreement without drowning the consultant in false positives on
sensitive topics like safeguarding or health and safety. A keyword-based
heuristic can't do this responsibly — it would either miss real
contradictions or flag confident nonsense with the same tone of authority
as a real finding, which is worse than not having the feature at all. This
needs genuine language understanding (an LLM reading the observation,
evidence, and discussion notes together) rather than pattern matching in
JavaScript. It's a natural fit for a future AI Consultant integration —
the placeholder page already exists — but I didn't want to ship something
that looks clever and produces unreliable judgement calls that could
undermine trust in the whole assessment.

## Outcome-Led Release (v5.5.0)

This is a philosophy change, not just a feature: KIST no longer starts by
deciding what to assess. It starts by asking the client what they're
actually trying to achieve, and that answer decides what gets prioritised.

- **Business Objectives** — a fixed list (increase revenue, reduce costs,
  prepare for growth, and so on) plus a free-text field for the literal
  question "if we could only solve three problems during this engagement,
  what would success look like?" This is now the *first* step in Client
  Onboarding, before company details.
- **Objectives prioritise, they never exclude.** A doctor focused on growth
  still gets Leadership assessed — tags and dependencies alone decide what's
  in the assessment. Objectives only change what leads the report and what
  gets flagged as priority during the visit. This was a deliberate design
  choice to keep this additive to everything already built, not a
  replacement for it.
- **Commercial Impact** — a new layer per Knowledge Base concept explaining
  why it matters in business terms (lost revenue, cash flow, risk,
  reputation, and so on), separate from how well it's currently done.
- **Opportunity, not just Improvement** — the old improvement text per
  score band now also carries a `benefitType` (Revenue Opportunity, Cost
  Saving, Efficiency Improvement, Risk Reduction, Customer Experience
  Improvement, Growth Opportunity) and `estimationGuidance` — a method for
  a consultant to size a real benefit for a real client, never a
  fabricated number.
- **The client report now leads with a "What [Client] Is Trying to
  Achieve" section**, pulling the specific findings tied to their stated
  objectives, before the Business Performance Score — which is now
  explicitly labelled as supporting evidence, not the headline.

**A real gap found through testing, not guessed at:** I ran your two
examples (a manufacturer wanting to cut costs; a doctor wanting more
enquiries) before considering this done. The manufacturer case worked
immediately. The doctor case came back with zero findings — because
Website Credibility and Sales Conversion are gated behind a "Sales Team"
capability tag that a clinic would never think to tick, even though a
growth objective obviously makes them relevant. I added a small, curated
fix (`OBJECTIVE_TAG_HINTS` in `assessmentEngine.js`) so specific objectives
pull in a handful of genuinely relevant tags directly, then re-ran both
examples and confirmed they now produce exactly the pattern described in
the brief. This is exactly why I test rather than just ship — I would not
have caught this by inspection alone.

## Consultancy Engagement Release (v5.6.0)

The last piece of the outcome-led shift: a real consultancy engagement
doesn't just gather evidence uniformly, it starts with a working theory
and tests it. This adds the **Consultancy Hypothesis**.

- Formed after understanding the client's objectives, before evidence
  gathering begins — a free-text statement of what's actually limiting
  performance, plus which specific BPIs the theory is about.
- Captured as a new Client Onboarding step (right after Business
  Objectives) and editable any time on the Client page.
- Shown as a persistent banner throughout the assessment screen, with a
  live status: **Not Yet Tested** (nothing scored yet), **Supported**
  (every target BPI scored 2 or below — the theory holds), **Not
  Supported** (every target BPI scored 4 or above — the theory doesn't
  hold, the real problem is elsewhere), or **Partially Supported** (a
  genuine mix).
- The client report narrates this outcome explicitly — "the evidence
  confirms this theory" or "the evidence does not support this theory,
  whatever's limiting performance sits elsewhere" — sitting between the
  objectives section and the Executive Summary, before the detailed
  findings.

**A real bug caught by testing, not just written and hoped**: my first
version classified status by averaging target BPI scores. A hypothesis
tested against one BPI scoring 5 and another scoring 2 averaged to 3.5,
which my thresholds classified as "Not Supported" — clearly wrong, since
one half of the theory was directly confirmed. I rewrote it to check each
target BPI individually (all low = Supported, all high = Not Supported,
mixed = Partially Supported) and re-ran all four states to confirm the
fix before treating this as done.

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
