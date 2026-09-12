# SERA Architecture

## Layers

```
src/
  App.tsx                  Route table (react-router-dom)
  main.tsx                 BrowserRouter + SessionProvider + App
  context/SessionContext   Mock Smart Campus session (name/role/id) — unchanged auth model
  layouts/CampusShell      Header, nav, quick actions, notifications, AI chat, login modal, footer
  pages/                   One file per route; each pulls what it needs from src/core
  components/              Existing Smart Campus modules (untouched except lint fixes) +
                            src/components/sera/ (NextBestActions, new SERA-specific UI)
  core/                    The actual "intelligence layer" — pure, deterministic, framework-free
    types.ts               StudentContext and friends
    time.ts                Free-gap finding, minute formatting
    context/                buildStudentContext (assembles StudentContext), preferenceStore (localStorage)
    recommendation/         recommendationEngine, rankingEngine, explanationEngine, preferenceLearning
    scheduling/              schedulerEngine (Optimize My Day), scheduleRepairEngine (Plan Impact)
    study/                  studyAllocationEngine
    notices/                noticeRankingEngine
    library/                libraryRecommendation
    ai/                     aiGateway (swappable AI call + deterministic fallback)
  persona/                  Persona Health, namespaced and restyled (see below)
  data/                     studentData.ts (original Smart Campus demo data), seraDemoData.ts (SERA demo scenario)
  lib/supabaseClient.ts     Nullable Supabase client — every caller handles "not configured"
```

## Why `src/core` has no React in it

Every engine in `src/core` is plain TypeScript: given a `StudentContext`, return data. No hooks, no
components, no I/O beyond reading `localStorage` for preferences. That is what makes it:

- **Testable** without a DOM (see `docs/TEST_PLAN.md`) — 32 unit tests, all pure-function.
- **Reusable** from three different call sites without duplication: the dashboard's Next Best Actions
  panel, the AI chat's concierge-query branch, and the Study/Library/Notices/Optimize pages all call the
  same engine functions.
- **Independent of AI availability** — none of the ranking/scheduling/allocation logic calls an LLM.
  See `docs/AI_ARCHITECTURE.md` for where AI actually is used.

## Two session/auth systems, on purpose

Smart Campus Core keeps its original mock login (`SessionContext` + `LoginModal`) exactly as it was —
any username/password from the demo credential list works, nothing persists. Persona Health uses real
Supabase Auth. These are **not** unified into one login, because:

1. The mock login was never real auth to begin with — merging it with Supabase would mean either making
   the whole dashboard require a real backend (breaking "works with zero configuration") or making
   Persona Health's auth fake (breaking Persona's actual security model).
2. Rule 12 in the build brief ("consolidate only after verifying behavior is preserved") — verifying that
   behavior requires a live Supabase project, which doesn't exist in this environment yet.

`/persona/*` routes sit outside `CampusShell` (their own `PersonaShell` layout) for exactly this reason —
they have a different auth boundary, not just a different look.

## Routing

Smart Campus Core's original single-state-switch "app.tsx does everything" was replaced with real
`react-router-dom` routes so every module is deep-linkable — the *content* of every route is either
unchanged (existing components) or additive (new SERA pages). See
`docs/FEATURE_PRESERVATION_MATRIX.md` for the full route table and what moved where.

## Data flow for one recommendation

```
buildStudentContext()          — assembles StudentContext (demo data + localStorage preferences + now)
  → generateRecommendations()  — builds candidates (study/travel/review/notice) with numeric factors
    → rankCandidates()         — weighted sum of factors → score, priority, confidence
      → explainWhy()           — turns reasons[] into one sentence for "Why am I seeing this?"
```

Feedback closes the loop: `applyFeedback()` mutates stored preferences (e.g. "too crowded" →
`avoidCrowdedPlaces = true`), and the next call to `generateRecommendations()` picks that up immediately
— no page reload, no server round-trip.
