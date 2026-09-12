# Test Plan

## Automated tests

Run with `npm run test` (or `npm run test:watch`). Vitest + jsdom, 9 files, 32 tests, all pure-function —
no component rendering tests yet (see Known Limitations).

| Area (Phase 25 requirement) | File | What's actually asserted |
|---|---|---|
| 1. Recommendation ranking | `recommendation/rankingEngine.test.ts` | Higher-scoring candidates sort first; dismissed categories are filtered; every ranked recommendation has ≥1 reason |
| 1. Recommendation ranking | `recommendation/recommendationEngine.test.ts` | Every generated recommendation has reasons; the travel candidate correctly flags a disrupted future class (not just the next one); dismissal excludes a whole category |
| 2. Preference changes | `recommendation/preferenceLearning.test.ts` | Each of the 4 automatic feedback reasons produces its documented preference change; repeated dismissal doesn't duplicate |
| 3. Timetable conflicts | `scheduling/schedulerEngine.test.ts` | Classes are never moved or dropped; no two generated blocks overlap; a genuine free gap gets a study block |
| 4. Study allocation | `study/studyAllocationEngine.test.ts` | Urgent/low-mastery/high-priority goals outscore relaxed ones; allocations never exceed the available pool; empty input handled; every allocation has a reason |
| 5. Schedule repair | `scheduling/scheduleRepairEngine.test.ts` | Before/after minute-level shift matches the brief's worked example; class blocks are immovable; an unrelated event produces no repair; a subject-less block (e.g. a break) is never falsely flagged as affected; explanation text names the cause |
| 6. Notice prioritization | `notices/noticeRankingEngine.test.ts` | A subject-matched notice outranks a general one; a facility notice with no subject/department match still ranks as important when its *location* matches a class on today's timetable |
| 7. Accessibility-aware recommendations | `recommendation/recommendationEngine.test.ts` | Setting `extraTravelBufferMinutes` raises the travel recommendation's confidence |
| 8. Fallback behavior | `ai/aiGateway.test.ts` | With no Supabase configured, `getSeraReply` returns a non-empty, explainable, source `'fallback'` response that references Next Best Actions |
| 9. SERA context creation | `context/buildStudentContext.test.ts` | Assembles a complete context (profile, timetable, goals, notices, library, preferences, `now`); profile overrides apply without dropping the rest of the seed |

## Manual verification performed this session

Automated tests only cover `src/core`. The actual UI was driven end-to-end in a real (headless Chromium)
browser against the Vite dev server, because typecheck/lint/build cannot catch runtime wiring bugs. This
caught two real bugs no automated check found:

1. `main.tsx` never wrapped `<App>` in `<BrowserRouter>`/`<SessionProvider>` — the app crashed on load
   (`useRoutes() may be used only in the context of a <Router>`).
2. `CampusShell`'s login handler discarded the user object from `LoginModal` and never called the
   session's `login()` — logging in silently did nothing.

Walkthrough performed: login → dashboard (Next Best Actions with live, explainable recommendations) →
every new page (Study Tracker, Smart Library, Campus Notices, Preferences, Optimize My Day) → the Plan
Impact → Repair My Plan flow end to end → the AI Assistant's new concierge-query branch → Persona Health's
landing page and its graceful "not configured" auth screen. Console/page errors were checked at each step
(final run: zero errors, aside from a sandboxed-network font fetch and Vite HMR websocket block that are
artifacts of the headless test environment, not the app).

## Known gaps

- No component/rendering tests (React Testing Library is installed as a devDependency but unused so far)
  — the manual browser walkthrough above substitutes for this pass, but it isn't repeatable in CI.
- Persona Health's Supabase-backed flows (real sign-in, score persistence, institute dashboard data) are
  code-complete and typechecked but have never run against a live database — there is no Supabase project
  configured in this environment. See `docs/SECURITY.md` and the root `README.md` for what's needed to
  verify that path.
- The `sera-chat` edge function was not test-deployed or invoked live.
