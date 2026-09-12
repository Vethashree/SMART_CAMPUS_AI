# Inclusive Campus Support (parked prototype)

This folder holds a prior rebuild of this repository: an offline-first, ticket-based
accessibility support system (request classification/routing, staff dashboard,
English/Tamil i18n, AWS Cognito + API Gateway + DynamoDB backend via CDK).

It predates the SERA / Adaptive Campus Concierge direction and is unrelated to it.
It has been moved here — not deleted — so no work is silently lost. It is not
imported by the current app (`src/App.tsx` no longer references any of it).

If this prototype is ever revived, treat it as a separate product: it has its own
data model (tickets, consent records, offline queue), its own backend (`backend/`,
`infra/`), and its own env vars (`.env.example` in this folder — Cognito/API
Gateway, not Supabase). Do not mix its `node_modules` or lockfiles with the root
project.

Full history is preserved in git (see commit `946f46e` and the repository's
`docs/MERGE_AUDIT.md` for how this was identified and parked).
