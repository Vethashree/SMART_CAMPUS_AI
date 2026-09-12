# Security Notes

## What changed from the original Persona Health

**Hardcoded admin credentials removed.** `src/pages/AdminSetup.tsx` in the original Persona Health
repository hardcoded a real-looking admin email and password (`kingstontest@gmail.com` /
`kingstontest`) directly in frontend source, which ships to every visitor's browser bundle. The ported
version (`src/persona/pages/AdminSetup.tsx`) reads `VITE_SERA_ADMIN_BOOTSTRAP_EMAIL` /
`VITE_SERA_ADMIN_BOOTSTRAP_PASSWORD` from the environment instead, and the page tells the operator to set
them rather than silently using a fallback. **Rotate the password after first use** regardless — this
bootstrap flow only exists to create the very first institute admin account.

**No hard `throw` on missing config.** The original `src/integrations/supabase/client.ts` threw at import
time if `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` were missing, which would crash the entire
app before it could render anything. `src/lib/supabaseClient.ts` instead exports a nullable client and an
`isSupabaseConfigured` flag; every Persona Health service and page checks it and degrades to a visible
"not connected" notice. This is what makes Phase 24 ("must still work when AI/backend fails") true for
the whole Persona Health surface, not just the wellness chat.

## What stayed the same (already correct in the original)

- **Row Level Security** on `profiles`, `student_scores`, `user_login_logs`, `user_roles` — defined in the
  copied `supabase/migrations/*.sql`, not re-implemented client-side. Apply these migrations before
  pointing a real Supabase project at this app.
- **Role-gated institute access** — `InstituteLogin`/`InstituteDashboard` verify `user_roles.role =
  'admin'` server-side via a Supabase query, then sign the user back out immediately if the check fails.
  Kept exactly as-is.
- **Registration-number auth never stores a real email** — it maps to a synthetic
  `<sanitized-register-number>@persona.app` address, so no real student email is required or guessable
  from the register number alone (beyond what the sanitization itself reveals).
- **No service-role key in frontend code.** Only `VITE_SUPABASE_PUBLISHABLE_KEY` (the anon/public key,
  meant for browser use) appears in frontend code or `.env.example`. `LOVABLE_API_KEY` (the AI gateway
  secret) is a Supabase Edge Function secret, set via `supabase secrets set`, never a `VITE_` variable —
  `.env.example` calls this out explicitly and leaves the line commented.

## Data sensitivity

Persona Health's `student_scores` table holds mental-health assessment data (stress/anxiety/depression
scores). The institute dashboard that reads it is role-gated, but there is no additional field-level
encryption or audit logging beyond `user_login_logs`. If this goes to production with real students,
review the RLS policies in `supabase/migrations/` against your institution's data-handling requirements
before launch — this review was out of scope for this merge (no live database exists to test policies
against).

## Things this merge did not change

- Smart Campus Core's mock login (`LoginModal.tsx`) still accepts any of a fixed demo credential list and
  persists nothing — this was already the case upstream and is fine for a prototype, but it is not real
  authentication and should not gate anything sensitive.
