# SERA — Student Experience & Resource Assistant

An adaptive campus concierge that turns a student's profile, timetable, accessibility preferences, and
live campus notices into a short, prioritized, **explainable** list of next actions — plus everything
from Smart Campus AI (attendance, timetable, CGPA, career prediction, security) and Persona Health
(gamified wellness assessment, institute dashboard) underneath one visual system.

> This repository is the result of merging two prior prototypes — `kirishipathi/SMART_CAMPUS_AI` (the
> visual/UX source of truth) and `kirishipathi/PERSONA_HEALTH` (wellness assessment + institute tooling)
> — into one product, plus a net-new recommendation/scheduling/study intelligence layer that neither
> prototype had. See `docs/MERGE_AUDIT.md` and `docs/FEATURE_PRESERVATION_MATRIX.md` for exactly what
> came from where.

## Problem statement

> Build a campus concierge that turns a student profile, timetable, accessibility preferences, and live
> campus notices into a short, prioritized list of relevant services and next actions. The experience
> should explain why each recommendation is shown and let students correct preferences instead of
> behaving like an opaque chatbot.

## What's actually in here

- **Smart Campus Core** — AI Assistant, Smart Attendance, AI Timetable, Test Marks, Smart Security,
  Career Prediction, CGPA Calculator. Unchanged behavior from the original prototype (routes added, logic
  untouched except for lint cleanup — see the preservation matrix).
- **Persona Health** — gamified chess-quiz mental wellness assessment (21 DASS-21-style questions),
  Supabase auth (email/OAuth/registration-number), score history, institute dashboard with
  search/filter/export/real-time updates, and its own severity-aware "SERA" wellness chatbot. Namespaced
  under `/persona`, restyled to match Smart Campus's dark visual system.
- **The concierge itself** (net-new, `src/core/`) — a student context engine, a deterministic
  recommendation/ranking/explanation engine, preference correction, an "Optimize My Day" scheduler with
  schedule repair ("Plan Impact"), a study-time allocation engine, notice prioritization, and library
  recommendations. See `docs/ARCHITECTURE.md` for the full breakdown.

## Explainable by construction

Every recommendation carries structured reasons from the moment it's generated — there is no step where
an LLM is asked "what should this student do?" and no vague "recommended by AI" language anywhere. Click
"Why am I seeing this?" on any recommendation to see exactly which factors (timetable, preference, goal,
campus, accessibility, availability) produced it. See `docs/RECOMMENDATION_ENGINE.md`.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

**Works with zero configuration**: the dashboard, Smart Campus Core, and the entire concierge
(recommendations, "Optimize My Day", study tracker, library, notices, preference correction) run against
a demo student scenario (`src/data/seraDemoData.ts`) with no backend required. Log in with any of the
demo credentials in `src/components/LoginModal.tsx` (e.g. `student1` / `pass123`).

Persona Health (`/persona`) needs a Supabase project — see below. Without one, its pages render with a
visible "not connected" notice instead of crashing.

## Environment setup

Copy `.env.example` to `.env.local`. Nothing in it is required for Smart Campus Core or the concierge.
For Persona Health:

1. Create a Supabase project, set `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` /
   `VITE_SUPABASE_PROJECT_ID`.
2. Apply the migrations in `supabase/migrations/` to that project (creates `profiles`, `student_scores`,
   `user_login_logs`, `user_roles`, with RLS policies).
3. Deploy `supabase/functions/sera-chat` and set its `LOVABLE_API_KEY` secret (`supabase secrets set
   LOVABLE_API_KEY=...`) if you want the wellness chatbot's real AI responses — see
   `docs/AI_ARCHITECTURE.md` for the contract if you want to repoint it at a different provider.
4. Set `VITE_SERA_ADMIN_BOOTSTRAP_EMAIL`/`PASSWORD`, visit `/persona/admin-setup` once to create the
   first institute admin, then rotate the password.

## Scripts

```bash
npm run dev       # Vite dev server
npm run build     # production build (vite build)
npm run lint      # eslint .
npm run test      # vitest run — 32 tests across src/core
npm run test:watch
npm run preview   # preview a production build locally
```

## Documentation

- `docs/MERGE_AUDIT.md` — what was found in both source repos before anything changed
- `docs/FEATURE_PRESERVATION_MATRIX.md` — every feature from both repos, and its fate
- `docs/ARCHITECTURE.md` — layer-by-layer structure and why
- `docs/AI_ARCHITECTURE.md` — where AI is (and isn't) used, and the two "SERA" assistants
- `docs/RECOMMENDATION_ENGINE.md`, `docs/SCHEDULER.md`, `docs/STUDY_ENGINE.md` — the concierge engines
- `docs/TEST_PLAN.md` — automated coverage + what was verified manually
- `docs/SECURITY.md` — what changed from the original Persona Health, and why

## Known limitations

- Persona Health's Supabase-backed flows (auth, score persistence, institute dashboard, wellness chat)
  are code-complete and typechecked but have never run against a live database in this environment —
  there's no Supabase project configured here. See `docs/SECURITY.md`.
- `mastery`/`recentStudyMinutes` feeding the study allocation engine are demo seed values, not derived
  from real Test Marks/attendance data yet.
- No component-level rendering tests yet (`@testing-library/react` is installed but unused) — UI
  correctness was verified with a manual browser walkthrough this session, not an automated one.
- The production bundle is ~670KB (mostly `@supabase/supabase-js`, `react-router-dom`, `recharts`,
  `@tanstack/react-query`); code-splitting Persona Health behind a dynamic `import()` would reduce the
  initial load for users who never visit it.
- Persona Health's `/auth-debug` developer page was dropped (no end-user function) — recoverable from
  the original `kirishipathi/PERSONA_HEALTH` repo if needed.

## License

See [LICENSE](LICENSE).
