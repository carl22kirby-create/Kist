# KIST One — Operational Build (v2.2.0)

## Run it locally

```
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build a production bundle:
```
npm run build
npm run preview
```

## What changed from the repair build

- **Assessment answers now persist per client.** Previously, opening Assessments or
  the Visit Workflow reset all 250 answers every time (each page held its own
  fresh copy). Answers are now stored in `data.assessments[clientId]` and saved
  to localStorage, so progress survives navigating away and coming back.
- **Calendar → "Open Visit"** now actually navigates to the Visit Workflow for
  the selected appointment's client, instead of doing nothing.
- **Reports → "Open"** now navigates to that client's workspace.
- **Analytics** now averages real category scores from any clients that have
  been assessed, falling back to demo figures only when nothing has been
  scored yet.
- **Restructured into a proper multi-file Vite project** (`src/pages`,
  `src/components`, `src/data`, `src/utils`) instead of one 414-line file, so
  it's maintainable going forward.
- Added a `vite.config.js` (was referenced by scripts but missing) and pinned
  dependency versions instead of `"latest"`.

## Data & persistence

Everything (clients, calendar, actions, reports, assessments, dashboard widget
layout) is stored in the browser's `localStorage`. There is no backend/server —
this is a client-only prototype. Data is per-browser: it won't sync across
devices or survive clearing site data. Settings → Reset Local Data clears it
back to the seed dataset.

If you need multi-user access or persistence beyond one browser, that requires
adding a real backend (e.g. a small API + database) — happy to help scope that
next if it's a priority.

## Known limitations to be aware of

- No authentication/login — anyone with the URL and browser can see all data.
- No server-side validation — all business logic runs in the browser.
- Assessment scoring, report content, and AI alerts are static/demo logic, not
  wired to a real AI service yet.
