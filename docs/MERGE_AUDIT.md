# Merge Audit — SMART_CAMPUS_AI + PERSONA_HEALTH → SERA

Date: 2026-09-13
Status: **Phase 0 audit complete. Implementation has NOT started.**

This document records the actual, verified state of both source repositories and
this local working tree, gathered by cloning both repos fresh and inspecting the
local git history/status directly. Several things here differ materially from
what a merge plan would normally assume, so read this before any code changes
are made.

---

## 1. What this local working tree actually is

`origin` = `https://github.com/Vethashree/SMART_CAMPUS_AI_FINAL.git` (a personal
fork/copy, not `kirishipathi/SMART_CAMPUS_AI` directly).

Commit history:

```
6dc512f Initial commit
e5376bf Baseline: import existing Smart Campus AI prototype before Inclusive Campus Support rebuild
946f46e feat: finalize inclusive campus support prototype
753f51b Merge initial GitHub repo README with Inclusive Campus Support prototype   <- current HEAD
```

**This repo already went through one full rebuild**, away from Smart Campus AI
and into a *different, unrelated product* called "Inclusive Campus Support" — a
ticket-based accessibility support system (not a campus concierge). That code
is still committed and present on disk today, but it is currently **orphaned**:
`src/App.tsx` no longer imports or renders any of it.

The working tree right now (uncommitted) is in the middle of **reverting that
rebuild** and restoring the original Smart Campus AI dashboard: `App.tsx`,
`LoginModal`, `AIChat`, `SmartAttendance`, `AITimetable`, `TestMarks`,
`SmartSecurity`, `CareerPrediction`, `CGPACalculator`, `data/studentData.ts`,
`types/Student.ts` are all present as **untracked new files**, and `App.tsx`,
`package.json`, `index.css`, `main.tsx`, `tailwind.config.js`, `README.md`,
`.gitignore`, `index.html` are all **modified but uncommitted**.

I diffed this restored code against a fresh clone of the real upstream
(`kirishipathi/SMART_CAMPUS_AI`, which is actually named
`smart-campus-ai-management` in its own `package.json`) — **they match
structurally file-for-file**. So the working tree's uncommitted state is a
faithful restoration of the true upstream master, not a divergent variant.

### Orphaned "Inclusive Campus Support" code (still committed, not wired up)

```
src/domain/{classification,users,privacy,offline,feedback,tickets}/
src/features/{support,tickets,staff,impact,assisted}/
src/offline/{db,queue,sync}.ts (+ sync.test.ts)
src/i18n/{index,en,ta}.ts
src/app/providers/{PreferencesProvider,OfflineQueueProvider}.tsx
src/repositories/{TicketRepository,LocalTicketRepository,AwsTicketRepository,index}.ts (+ test)
src/components/layout/{AppShell,Header,Footer,SkipLink}.tsx
src/components/status/ConnectivityBanner.tsx
src/components/tickets/{StatusPill,TicketTimeline}.tsx
.env.example (AWS Cognito / API Gateway vars — belongs to this prototype, not Persona Health)
```

This is a complete second product: offline-first PWA ticket routing/classification
for accessibility support requests, with English/Tamil i18n, a staff dashboard,
consent tracking, and an AWS Cognito/API-Gateway backend design. It has its own
`.test.ts` files but the current `package.json` has **no test runner installed**,
so these tests cannot currently run. It is unrelated to the SERA/concierge
problem statement and is not referenced anywhere in it.

**This needs a decision — see open questions below.** Nothing has been deleted.

### Other untracked stray files found

- `eye-tracking-quiz.html` — standalone static HTML, not wired into the React app.
- `.github/workflows/static.yml` — a static-site deploy workflow (GitHub Pages style).
- `infra/cdk.out/` — AWS CDK **synth build output** (generated artifact), currently untracked; this should not be committed to source control regardless of what else happens.

---

## 2. SMART_CAMPUS_AI (verified master, upstream = `kirishipathi/smart-campus-ai-management`)

- **Architecture**: single-page app, no router. One `App.tsx` (664 lines) holds
  all state (`activeModule`) and switches rendered content via a `switch`
  statement. "Routes" are conceptual module names (`dashboard`, `ai-assistant`,
  `attendance`, `timetable`, `test-marks`, `security`, `career-prediction`,
  `cgpa-calculator`, `analytics`), not URLs — there is no deep linking today.
- **Auth**: `LoginModal.tsx` is a **local mock** — any name/role/id typed in is
  accepted, held only in React state, nothing persisted, no backend call.
- **Visual system**: Tailwind utility classes only, `lucide-react` icons, dark
  slate background with blue→purple gradient accents, `bg-slate-800/50` cards
  with `border-slate-700`, glassmorphism blur, hover-lift transforms. This is
  the visual language Rule 1 requires as source of truth.
- **Dependencies**: `react`, `react-dom`, `lucide-react` only at runtime. No
  router, no state library, no backend SDK, no form library, no test runner.
- **Data**: `src/data/studentData.ts` + `src/types/Student.ts` — static demo
  data, no persistence.
- **Features** (all present, all client-side/demo-data today): AI Assistant
  (static UI, no real chat wired — `AIChat.tsx` panel exists but is a shell),
  Smart Attendance, AI Timetable, Test Marks, Smart Security, Career
  Prediction, CGPA Calculator, a notifications panel, a quick-actions sidebar,
  an analytics module inline in `App.tsx`.

## 3. PERSONA_HEALTH (verified, `kirishipathi/PERSONA_HEALTH`)

A real, production-shaped Supabase application — materially larger and more
complex than Smart Campus AI's current codebase.

- **Architecture**: React Router DOM (10 routes), TanStack Query provider,
  `shadcn/ui` component set on Radix primitives (**50 files** in
  `src/components/ui/`), `react-hook-form` + `zod`, `recharts`, `sonner` toasts.
- **Routes**: `/`, `/auth`, `/auth-debug`, `/register-number`, `/register`,
  `/game`, `/institute-login`, `/institute-dashboard`, `/admin-setup`, `*`.
- **Auth**: real Supabase Auth (email/password + GitHub/Google OAuth), plus a
  custom registration-number flow that maps a student's academic ID to a
  synthetic email (`<registration>@persona.app`). `useAuth`/`useAuthGuard`
  hooks, `authService.ts` / `profileService.ts` / `scoreService.ts`.
- **Core feature**: a chess-themed 100-box game board (`GameBoard.tsx`,
  `Dice.tsx`, `InstructionSlides.tsx`) that delivers 21 mental-wellness
  questions and produces stress/anxiety/depression scores, persisted to
  Supabase.
- **SERA chatbot** (`SeraChatbot.tsx`) — **the name "SERA" already exists in
  this codebase**, pre-dating this task's product-naming instruction. It talks
  to a Supabase Edge Function (`supabase/functions/sera-chat/index.ts`, 339
  lines) that streams a response from **the Lovable AI gateway**
  (`google/gemini-2.5-flash`), with a severity-aware, explicitly
  non-diagnostic, crisis-referral-oriented system prompt.
- **Institute/admin dashboard** (`InstituteDashboard.tsx`, 575 lines): live
  view of submitted scores, search/filter/export, Supabase real-time
  subscription, gated by a `user_roles` table (`admin` vs `student`).
- **Database** (Supabase Postgres, 9 migration files): `profiles`,
  `student_scores`, `user_login_logs`, `user_roles`, with RLS policies.
- **Required env vars** (from its own README):
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_CLIENT_ID/SECRET`,
  `VITE_GITHUB_CLIENT_ID/SECRET`, `VITE_GOOGLE_CLIENT_ID/SECRET`.
- Built via Lovable (`lovable-tagger` devDependency); the edge function is
  wired specifically to Lovable's AI gateway, not a raw provider API key.

---

## 4. Conflicts and risks a straight merge will hit

| # | Issue | Detail |
|---|---|---|
| 1 | **Routing** | Smart Campus AI has no router at all; Persona Health needs 10 real routes. Introducing `react-router-dom` into the master is required and is a real architectural change (permitted by Rule 5's "unless required for functional integration"). |
| 2 | **Design system** | Persona Health is built on shadcn/ui + Radix (50 component files) with what its own README calls a "warm, gradient-based" look. Rules 3/8/9 forbid a second visual identity. Pulling in Radix wholesale would violate Rule 3. Recommendation: rebuild Persona Health's *screens* using Smart Campus AI's existing plain-Tailwind card/button/modal patterns, not its component library. |
| 3 | **Auth** | Smart Campus's `LoginModal` is a no-op mock; Persona Health's Supabase Auth is the only *real* auth in either codebase. The merged app should standardize on Persona Health's Supabase Auth, restyled to match Smart Campus's login modal visuals. |
| 4 | **No test runner exists in either repo today** | Neither `package.json` has vitest/jest configured, despite the orphaned Inclusive Campus Support code containing `.test.ts` files that reference one implicitly. Phase 25 requires adding one. |
| 5 | **AI gateway dependency** | `sera-chat` calls Lovable's AI gateway specifically. Whether that gateway is still reachable/keyed for this project is unknown — needs confirmation before Phase 23/24 work, or the edge function needs to be repointed at a direct provider. |
| 6 | **Backend credentials** | Real Supabase auth/DB/edge-function behavior cannot be verified or wired end-to-end without real `VITE_SUPABASE_*` values. None exist in this repo. Per Rule 15 ("no fake APIs, no pretend AI calls"), I will not fabricate placeholder credentials that look real. |
| 7 | **Orphaned third product** | The "Inclusive Campus Support" code (section 1) doesn't belong to either named repo and isn't part of the SERA problem statement. Needs an explicit decision, not a silent deletion. |
| 8 | **Non-project files** | `infra/cdk.out/` (build output) and `eye-tracking-quiz.html` (unwired static page) should probably not ship as-is regardless of the merge decision. |

---

## 5. Feature inventory (source for the Phase 33 preservation matrix)

**Smart Campus AI** — AI Assistant shell, Smart Attendance, AI Timetable, Test
Marks, Smart Security, Career Prediction, CGPA Calculator, notifications
panel, quick-actions sidebar, analytics view, mock login/logout.

**Persona Health** — Home/landing, Supabase email+OAuth auth, registration-
number auth, student profile completion, chess-board gamified assessment (21
questions → stress/anxiety/depression scores), score persistence & history,
SERA streamed chatbot with severity-aware crisis-referral prompting, institute
login + role-gated dashboard with search/filter/export/real-time updates,
admin-setup bootstrap, login-activity logging, RLS-secured schema.

**Net-new (neither repo has this today, this is what the SERA problem
statement actually asks for)** — student context engine, explainable
recommendation/ranking engine, preference correction & learning, timetable
optimizer, schedule repair, study allocation engine, library intelligence,
notice prioritization. All of Phases 5–17 are greenfield build, not migration.

---

## 6. Open questions before implementation can start

These were decisions that couldn't be made unilaterally. Resolved answers, applied during implementation:

1. **Orphaned Inclusive Campus Support code** → moved to `legacy/inclusive-campus-support/` (not deleted,
   not left in place). See that folder's README.
2. **Supabase credentials** → none exist in this environment. Built code-complete against a nullable
   Supabase client (`src/lib/supabaseClient.ts`); every Persona Health page/service degrades to a visible
   "not connected" notice instead of crashing or faking a response. See `docs/SECURITY.md`.
3. **AI gateway for the wellness chatbot** → kept pointed at Lovable's gateway (unchanged from the
   original `supabase/functions/sera-chat`), decided to leave swappable rather than migrate now. The
   *concierge* assistant's AI gateway (`src/core/ai/aiGateway.ts`, a separate integration point) ships
   with a working deterministic fallback either way.
4. **Delivery pacing** → pushed through all stages in one session, with runtime verification (browser
   walkthrough) rather than stopping at typecheck/build/lint — see `docs/TEST_PLAN.md` for two real bugs
   that only that step caught.

See `docs/FEATURE_PRESERVATION_MATRIX.md` for the full accounting of what was preserved, restyled, or
(in one case — the Persona Health `/auth-debug` developer page) dropped.
