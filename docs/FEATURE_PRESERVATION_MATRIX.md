# Feature Preservation Matrix

Every meaningful feature from both source repositories, and whether it survived the merge into SERA.

## Smart Campus AI (`kirishipathi/SMART_CAMPUS_AI`)

| Feature | Existing Route | Existing Component | Preserved? | Modified? | Reason | Verification |
|---|---|---|---|---|---|---|
| AI Assistant (rule-based FAQ bot) | `ai-assistant` module | `AIChat.tsx` | Yes | Yes | Added one new branch that answers concierge-style questions ("what should I do next") via the real recommendation engine; all existing keyword branches untouched | Manual browser walkthrough; existing quick-questions still work |
| Smart Attendance | `attendance` module | `SmartAttendance.tsx` | Yes | Lint-only | Removed unused imports/vars, fixed a `today` scoping bug introduced while cleaning unused vars | `npm run build`, manual click-through |
| AI Timetable generator | `timetable` module | `AITimetable.tsx` | Yes | Lint-only | Removed unused `currentUser` destructure (prop kept for interface compatibility) | `npm run build` |
| Test Marks | `test-marks` module | `TestMarks.tsx` | Yes | Lint-only | Removed unused import | `npm run build` |
| Smart Security | `security` module | `SmartSecurity.tsx` | Yes | Lint-only | Removed unused imports/vars, typed one `any` | `npm run build` |
| Career Prediction | `career-prediction` module | `CareerPrediction.tsx` | Yes | Lint-only | Removed unused imports/vars, typed `any`s | `npm run build` |
| CGPA Calculator | `cgpa-calculator` module | `CGPACalculator.tsx` | Yes | Lint-only | Removed unused imports, typed one `any` | `npm run build` |
| Predictive Analytics dashboard | `analytics` module | inline in `App.tsx` | Yes | Extracted | Moved into `src/pages/AnalyticsPage.tsx` verbatim so it could get a real route | Manual walkthrough |
| Mock login (student/staff/institute) | header modal | `LoginModal.tsx` | Yes | Typed | Added an explicit type to the credentials map (was an implicit-any indexing bug); demo credentials unchanged | Logged in with `student1`/`pass123` in browser |
| Notifications panel | header | inline in `App.tsx` | Yes | Extracted | Moved into `CampusShell.tsx` verbatim | Manual walkthrough |
| Quick-actions sidebar | left rail | inline in `App.tsx` | Yes | Extracted | Moved into `CampusShell.tsx`; Library icon now links to the new `/library` page instead of nowhere | Manual walkthrough |
| Dashboard feature-tile grid | `/` | inline in `App.tsx` | Yes | Extended | Same tile pattern, 5 new tiles added for Persona Health / Study Tracker / Smart Library / Campus Notices / Preferences | Manual walkthrough |
| Single-page "module" navigation | in-memory state | `App.tsx` | Superseded | Yes | Replaced with `react-router-dom` routes carrying the exact same visual nav — deep-linkable now, not a regression (Phase 30 explicitly allows this) | Manual walkthrough of every route |

## Persona Health (`kirishipathi/PERSONA_HEALTH`)

| Feature | Existing Route | Existing Component | Preserved? | Modified? | Reason | Verification |
|---|---|---|---|---|---|---|
| Home / landing | `/` | `Home.tsx` | Yes | Restyled | Dropped the orange "warm gradient" theme and Indian-rangoli decorative CSS art for Smart Campus's dark slate/gradient system (Rules 3/8/9); kept the three-pillar copy and journey framing | Manual walkthrough at `/persona` |
| Supabase email/password + OAuth auth | `/auth` | `Auth.tsx` (`SignInPage` block) | Yes | Rebuilt | The original used a third-party "sign-in" template with fabricated testimonials and stock photos pulled from Unsplash — dropped as non-genuine content and a second visual identity; real Supabase auth + GitHub/Google OAuth calls preserved | Renders correctly with a "Supabase not configured" notice when no backend is set; code path verified against `authService.ts` |
| Registration-number auth (synthetic email mapping) | `/register-number` | `RegisterNumberAuth.tsx` | Yes | Restyled only | Sanitization + `@persona.app` synthetic email logic copied verbatim | Logic diffed against original |
| Student profile completion | `/register` | `StudentRegistration.tsx` | Yes | Restyled only | Same fields, same upsert shape | Logic diffed against original |
| Chess-quiz gamified assessment (100-box board, 21 DASS-21-style questions, piece movement) | `/game` | `GameBoard.tsx`, `Dice.tsx` | Yes | Restyled only | All 21 questions, scoring formulas, severity thresholds, board/piece movement algorithms (diagonal, knight L-shape, rook, queen choice) copied verbatim; shadcn Dialog/AlertDialog replaced with the shared `Modal.tsx` | Manual walkthrough confirms board renders, dice rolls, modals open |
| Instruction slides / onboarding | modal | `InstructionSlides.tsx` | Yes | Restyled | Same 4-step content | Manual walkthrough |
| SERA wellness chatbot (severity-aware, streamed) | in-game modal | `SeraChatbot.tsx` | Yes | Restyled only | Same streaming SSE parser, same request contract (`messages` + 3 scores) against the same edge function | Code preserved; shows "not connected" notice without Supabase, matching Phase 24 |
| Institute login (admin-role gated) | `/institute-login` | `InstituteLogin.tsx` | Yes | Restyled only | Same role-check query | Manual walkthrough (shows "not configured" notice) |
| Institute dashboard (search/filter/export/real-time) | `/institute-dashboard` | `InstituteDashboard.tsx` | Yes | Restyled only | shadcn Table/Select/Badge replaced with plain HTML equivalents; search, 3 filters, CSV export, and the Supabase realtime subscription all preserved | Code preserved; logic diffed against original |
| Admin bootstrap | `/admin-setup` | `AdminSetup.tsx` | Yes | **Security fix** | Original hardcoded a real-looking admin email+password in the frontend bundle; replaced with `VITE_SERA_ADMIN_BOOTSTRAP_EMAIL/PASSWORD` env vars (see `docs/SECURITY.md`) | Manual walkthrough |
| Supabase schema (`profiles`, `student_scores`, `user_login_logs`, `user_roles`, RLS) | — | `supabase/migrations/*.sql` | Yes | None | Copied verbatim into this repo's `supabase/migrations/` | File diff |
| `sera-chat` edge function (severity-aware, crisis-referral prompt) | — | `supabase/functions/sera-chat/index.ts` | Yes | None | Copied verbatim — this is backend code, not part of the visual merge | File diff |
| Auth debug page | `/auth-debug` | `AuthDebug.tsx` | **Dropped** | — | Developer-only debug page with no end-user function; not part of the product surface. Recoverable from the original repo if needed | N/A |

## Net-new (neither repo had this — the actual SERA problem statement)

| Feature | Route | Files | Status |
|---|---|---|---|
| Unified student context engine | — | `src/core/context/*` | Built, tested |
| Recommendation / ranking / explanation engine | dashboard, AI chat | `src/core/recommendation/*` | Built, tested |
| Preference correction + learning | `/preferences`, dashboard | `src/core/recommendation/preferenceLearning.ts` | Built, tested |
| "Optimize My Day" scheduler | `/timetable/optimize` | `src/core/scheduling/schedulerEngine.ts` | Built, tested |
| Schedule repair / "Plan Impact" | `/timetable/optimize` | `src/core/scheduling/scheduleRepairEngine.ts` | Built, tested |
| Study allocation engine | `/study` | `src/core/study/studyAllocationEngine.ts` | Built, tested |
| Notice prioritization | `/notices` | `src/core/notices/noticeRankingEngine.ts` | Built, tested |
| Library recommendation | `/library` | `src/core/library/libraryRecommendation.ts` | Built, tested |
| AI gateway with deterministic fallback | dashboard, AI chat | `src/core/ai/aiGateway.ts` | Built, tested |

## Parked, not deleted

The "Inclusive Campus Support" prototype (a prior, unrelated rebuild of this repo — ticket-based accessibility support system) was moved to `legacy/inclusive-campus-support/` rather than deleted. See that folder's own README. Full history is also in git at commit `946f46e`.
