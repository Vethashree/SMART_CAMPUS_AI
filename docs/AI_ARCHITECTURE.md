# AI Architecture

## Where AI is used, and where it deliberately isn't

Per the build brief's Phase 23: deterministic logic for anything that has a correct answer, AI only for
language.

| Concern | Approach | Why |
|---|---|---|
| Which recommendation to show, and its priority/score | Deterministic weighted scoring (`src/core/recommendation/rankingEngine.ts`) | There's a correct-ish answer computable from data; an LLM would be slower, less consistent, and unauditable |
| Timetable conflicts, free-gap finding | Deterministic (`src/core/time.ts`) | Pure arithmetic |
| Schedule repair after a campus disruption | Deterministic (`src/core/scheduling/scheduleRepairEngine.ts`) | Must be exactly reproducible and testable — see `docs/TEST_PLAN.md` |
| Study time allocation | Deterministic, transparent weights (`src/core/study/studyAllocationEngine.ts`) | Same reason; also avoids making unsupported "AI guarantees better grades" claims |
| "Why am I seeing this?" explanation text | Deterministic sentence assembly from structured reasons (`explanationEngine.ts`) | Phase 8 explicitly forbids vague AI language like "recommended for you by AI" — every reason is traceable to a concrete factor |
| General campus Q&A ("what's my next class", "show my attendance") | Deterministic keyword matching against real student data (`src/components/AIChat.tsx`, unchanged from the original Smart Campus AI) | Already correct and fast; no reason to route through an LLM |
| Concierge questions ("what should I do next") | Same `AIChat.tsx`, one new branch that calls the recommendation engine directly | Still deterministic — the "AI" framing is the chat UI, not an LLM call |
| Persona Health's wellness chatbot ("SERA") | Real LLM call, streamed, via `supabase/functions/sera-chat` | This is genuinely open-ended supportive conversation — the one place in the product where natural-language generation is the actual job |

## Two things are both called "SERA," on purpose

1. **SERA the product** — the whole adaptive concierge (recommendations, scheduling, notices, etc).
2. **SERA the wellness chatbot** inside Persona Health — this name predates this merge (it already
   existed in Persona Health's own codebase, see `src/persona/components/SeraChatbot.tsx`). Renaming the
   whole product to SERA and keeping this component's existing name is consistent, not a collision.

The general campus `AIChat.tsx` assistant is *not* renamed to "SERA" in its UI — it's still labeled "AI
Assistant" in the header — because unifying the branding of two different assistants with different
capabilities (one keyword-matched, one LLM-backed) would overstate what the keyword bot does. If a future
pass wants one consistently-branded assistant, `src/core/ai/aiGateway.ts` is the integration point.

## The wellness chatbot's contract (unchanged from Persona Health)

`POST {VITE_SUPABASE_URL}/functions/v1/sera-chat` with:

```json
{ "messages": [{ "role": "user", "content": "..." }], "stressScore": 0-42, "anxietyScore": 0-42, "depressionScore": 0-42 }
```

Streams back an SSE, OpenAI-style `choices[0].delta.content` chunked response. The edge function
(`supabase/functions/sera-chat/index.ts`, copied verbatim) builds a severity-aware system prompt —
CBT/mindfulness/ACT framing, explicitly non-diagnostic, with crisis referral resources (NIMHANS, iCall,
Vandrevala, AASRA) surfaced automatically at "extremely severe" — and forwards to `LOVABLE_API_KEY`'s
gateway (`google/gemini-2.5-flash`).

## The concierge's AI gateway (`src/core/ai/aiGateway.ts`)

A second, separate integration point for *general* SERA chat (Phase 17), built but not wired into a
highly visible surface yet since `AIChat.tsx` already handles general queries deterministically:

```ts
getSeraReply(messages, context) →
  if Supabase configured: call supabase.functions.invoke('sera-chat', ...)  // real AI
  else or on failure:      fallbackReply(context)                          // deterministic, uses the
                                                                            // same recommendation engine
                                                                            // the dashboard uses
```

This is the concrete implementation of Phase 24 ("the application must still work when AI fails") for
the concierge assistant — `src/core/ai/aiGateway.test.ts` asserts the fallback path directly.

## Which AI provider

Decided as "swappable, decide later": the edge function currently targets Lovable's AI gateway
(`ai.gateway.lovable.dev`) because that's what Persona Health shipped with. Repointing it at a direct
provider (e.g. Anthropic) means editing `supabase/functions/sera-chat/index.ts`'s `fetch` call and target
model — the frontend contract (`messages` + 3 scores in, streamed text out) does not need to change.
