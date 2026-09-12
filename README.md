# Inclusive Campus Support

**Different abilities. Different access methods. One equal service.**

Access campus support through voice, text, Tamil, low-bandwidth or assisted human support — and track the same request from submission to resolution.

Inclusive Campus Support is a single, accessibility-first request service for rural and underserved students. Instead of guessing which office handles a scholarship, hostel, transport, exam, or welfare issue, a student describes the problem once — by voice or text, in English or Tamil — and the service classifies it, explains in plain language where it's going and why, asks for explicit consent before sharing anything, and gives back one trackable ticket (`CAMP-XXXX`). If a device, connection, or interface fails, the same request can always be completed by a person at a help desk instead.

Built for HackQuest 2026.

## Why this exists

Today a student with an issue has to figure out which office to contact, get there, and hope the request was understood — repeating all of that if accessibility, language, or connectivity gets in the way. This service collapses that into one flow: **Access → Understand → Request → Classify → Explain → Consent → Route → Track → Action → Resolve → Feedback**. See [`src/domain/classification/classify.ts`](src/domain/classification/classify.ts) for the routing logic and [`src/features/support`](src/features/support) for the flow itself.

## What's real vs. what's a prototype stand-in

Being upfront about this matters more than sounding impressive:

- **Classification is deterministic, not AI.** [`classifyRequest`](src/domain/classification/classify.ts) is transparent keyword matching, labeled "Local Request Classification" in the UI on purpose. The `RequestRepository`/`isLocalClassification` boundary exists so a real ML/LLM classifier can be swapped in later without touching the UI.
- **Accessibility is engineered, not just labeled.** Toggling large text, high contrast, or reduced motion in [`AccessibilityPreferencesPage`](src/features/support/pages/AccessibilityPreferencesPage.tsx) changes real CSS custom properties (see [`src/index.css`](src/index.css)) immediately — there are no fake switches.
- **We don't claim WCAG certification.** The app is engineered against WCAG 2.2 AA success criteria (semantic HTML first, visible focus, skip link, 44px+ touch targets, no color-only status, consistent help) but that's "AA-aligned engineering," not an audited certification.
- **We don't claim to support every disability.** Voice input gracefully degrades to text; anything the interface can't handle falls back to **Assisted Support** — a real person, not a dead end.
- **Impact metrics are prototype metrics**, computed from whatever tickets exist in this environment's data store — not measured real-world outcomes. Labeled as such in [`ImpactPage`](src/features/impact/pages/ImpactPage.tsx).
- **The AWS backend is real infrastructure-as-code** (see below) but this repo runs and demos fully without ever deploying it, via a local repository fallback.

## Running it locally (no AWS required)

```bash
npm install
npm run dev
```

That's it — with `VITE_API_BASE_URL` unset, [`src/repositories/index.ts`](src/repositories/index.ts) uses `LocalTicketRepository`, which persists tickets in the browser via `localStorage` and the offline queue via IndexedDB. The whole student → staff flow works end to end, including the staff dashboard reading the same tickets a student just submitted (same-origin, same browser — see "One source of truth" below).

```bash
npm run build      # production build
npm test           # vitest: classification, consent, idempotency, offline sync
npm run lint
```

## One source of truth

Student and staff UIs never keep separate fake state — both call the same `TicketRepository` interface ([`src/repositories/TicketRepository.ts`](src/repositories/TicketRepository.ts)), implemented by either:

- **`LocalTicketRepository`** — dev/demo fallback, `localStorage`-backed, works with zero setup.
- **`AwsTicketRepository`** — talks to the deployed API Gateway → Lambda → DynamoDB stack.

Swapping between them is one env var (`VITE_API_BASE_URL`); no UI code changes.

## Idempotency (one request = one ticket, always)

Every ticket creation — online, offline-queued, or via Assisted Support — carries a `idempotencyKey` (a client-generated UUID). Retrying the same submission (a flaky connection, a duplicate offline-sync) never creates a second `CAMP-XXXX`:

- **Local repo:** an idempotency-key → ticketId map in `localStorage` short-circuits retries ([`LocalTicketRepository.ts`](src/repositories/LocalTicketRepository.ts)).
- **AWS backend:** a DynamoDB `TransactWriteItems` call atomically writes the ticket *and* an idempotency marker item, guarded by `attribute_not_exists` — so even two concurrent retries can't race past it ([`backend/shared/dynamoTicketStore.ts`](backend/shared/dynamoTicketStore.ts)).

Tested in [`src/repositories/LocalTicketRepository.test.ts`](src/repositories/LocalTicketRepository.test.ts) and [`src/offline/sync.test.ts`](src/offline/sync.test.ts).

## Offline-first

Offline is a supported state, not an error. [`OfflineQueueProvider`](src/app/providers/OfflineQueueProvider.tsx) tries the network first; on failure (or if already offline), the request is queued in IndexedDB ([`src/offline/db.ts`](src/offline/db.ts)) and synced automatically once connectivity returns ([`src/offline/sync.ts`](src/offline/sync.ts)). A **Low-bandwidth mode** toggle in accessibility preferences signals reduced motion/imagery.

## Frontend structure

```
src/
├── app/providers/        # PreferencesProvider (language + accessibility + a11y CSS),
│                          # OfflineQueueProvider (connectivity + IndexedDB sync)
├── domain/                # Framework-free types & logic: tickets, classification,
│                          # accessibility, privacy, offline, feedback, users
├── repositories/          # TicketRepository interface + Local/Aws implementations
├── i18n/                  # en.ts / ta.ts dictionaries + translate()
├── offline/               # IndexedDB queue + sync
├── components/            # layout, accessibility, tickets, status (shared UI)
└── features/
    ├── support/            # the access-mode → language → accessibility → request →
    │                        # classification → routing → privacy → confirmation wizard
    ├── tickets/            # tracking / ticket detail / feedback
    ├── staff/              # staff dashboard
    ├── assisted/           # human-assisted request intake
    └── impact/             # prototype metrics
```

## Backend & infrastructure (AWS)

```
                    CloudFront (HTTPS, CDN)
                            │
                        S3 (React build)

              API Gateway (HTTP API, CORS)
                            │
        ┌────────────┬─────┴─────┬─────────────┐
   createTicket   getTicket  updateTicket*  addTimelineEvent*
   listTickets  submitFeedback  syncOfflineQueue  getImpactMetrics
                            │
                      DynamoDB (single table)
                  StudentIndex / DepartmentIndex GSIs
                            │
        syncOfflineQueue → SQS (FIFO + DLQ) → syncWorker Lambda

   Cognito (STAFF/ADMIN groups) ── JWT authorizer on * routes
   CloudWatch (dashboard + 5xx alarm)
```

- **`backend/functions/*`** — one Lambda per operation, each a thin handler over `backend/shared/dynamoTicketStore.ts`. Handlers import classification logic directly from `src/domain/classification/classify.ts` — **the exact same deterministic classifier runs client-side (instant preview) and server-side (source of truth)**, so what a student sees before consenting always matches what actually gets stored.
- **`backend/shared/dynamoTicketStore.ts`** — single-table DynamoDB design; see the comment at the top of [`infra/lib/data-stack.ts`](infra/lib/data-stack.ts) for the key schema.
- **`infra/`** — AWS CDK (TypeScript): `data-stack` (DynamoDB), `auth-stack` (Cognito), `api-stack` (HTTP API + Lambdas + SQS), `frontend-stack` (S3 + CloudFront), `observability-stack` (CloudWatch).
- **Authorization**: ticket creation/reading is open (students should never have to sign in to get help); `PATCH /tickets/{id}` and `POST /tickets/{id}/timeline` (staff-only status changes) require a Cognito JWT from a `STAFF`/`ADMIN` group member. Enforced server-side in `api-stack.ts`'s `HttpJwtAuthorizer` — never trust a frontend role check alone.
- **Resilience**: `POST /sync` (bulk offline-queue drain, e.g. a help-desk kiosk) hands items to a FIFO SQS queue with a dead-letter queue; a `syncWorker` Lambda processes them with partial-batch-failure reporting, so one bad item doesn't block or duplicate the rest.

### Deploying

```bash
cd backend && npm install
cd ../infra && npm install
npx cdk deploy InclusiveCampusSupport-Data InclusiveCampusSupport-Auth \
  InclusiveCampusSupport-Api InclusiveCampusSupport-Observability

# Frontend build needs the API's URL baked in, so it's built *after* Api deploys:
VITE_API_BASE_URL=<ApiUrl from the Api stack output> npm run build
npx cdk deploy InclusiveCampusSupport-Frontend
```

`.github/workflows/deploy.yml` automates exactly this two-phase sequence via GitHub OIDC (no long-lived AWS keys in CI) on push to `main`; `.github/workflows/ci.yml` runs typecheck/lint/test/build plus a `cdk synth` on every PR.

### Known gaps if you pick this up next

- Cognito sign-in isn't wired into the frontend yet (only the infra + JWT authorizer exist) — see `infra/lib/auth-stack.ts`.
- `getImpactMetrics`/staff "all departments" listing does a table `Scan`; fine at hackathon scale, would want a constant-partition GSI before real traffic.
- CORS on the HTTP API currently allows `*`; tighten to the CloudFront domain once it's known.

## Accessibility engine

Every toggle in `AccessibilityPreferencesPage` is backed by a real mechanism, not a label:

| Preference | Mechanism |
|---|---|
| Large text | `--font-scale` CSS variable scales root `font-size` |
| High contrast | Swaps the entire color token set to a black/white/yellow palette |
| Reduced motion | Zeroes `--motion-duration`; also respects `prefers-reduced-motion` |
| Large touch targets | `--touch-target-min` raised to 56px, applied via `min-h-touch`/`min-w-touch` |
| Voice input | Web Speech API, with an explicit edit-before-submit step and a documented fallback to Assisted Support when unsupported/denied/failed |
| Simple language / screen reader optimized / captions / visual alerts | Flags read by content and components where applicable |

Layout uses semantic HTML first (`<nav>`, `<fieldset>`/`<legend>`, `<dl>`, real `<button>`/`<label>` elements) with ARIA added only where semantics run out, a skip link, visible focus rings (strengthened further under high contrast), and no status communicated by color alone (every `StatusPill` pairs an icon with text).

## Localization

All user-facing strings live in [`src/i18n/en.ts`](src/i18n/en.ts) and [`src/i18n/ta.ts`](src/i18n/ta.ts) as flat translation-key dictionaries (`translate(language, key, params)` in `src/i18n/index.ts`). Ticket timeline events store a `labelKey` + params rather than baked-in text, so a ticket created in English renders correctly for a Tamil-reading staff member and vice versa.

## Privacy & data minimization

Before any submission, [`PrivacyConsentPage`](src/features/support/pages/PrivacyConsentPage.tsx) shows exactly what's shared (the request text, recipient department, purpose), what's required (student ID only), and an explicit list of what's **not** collected (password, payment card, biometric data, unrelated personal data). Submission is blocked client-side and server-side (`LocalTicketRepository`/`dynamoTicketStore` both throw without `consent: true`) until the checkbox is checked.

## License

MIT — see [LICENSE](LICENSE).
