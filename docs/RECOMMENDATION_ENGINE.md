# Recommendation Engine

Files: `src/core/recommendation/{recommendationEngine,rankingEngine,explanationEngine,preferenceLearning}.ts`

## Pipeline

1. **Candidate generation** (`recommendationEngine.ts`) — four independent generators, each looking at one
   slice of `StudentContext`:
   - `buildStudyCandidate` — finds the next free gap ≥ 25 minutes, picks the highest-scoring study goal
     (via the study allocation engine's `scoreGoal`), pairs it with a library zone recommendation.
   - `buildTravelCandidate` — scans every remaining class today (not just the next one) for a route
     closure affecting its location; computes a leave-by time including accessibility travel buffers.
   - `buildReviewCandidate` — picks the next-best study goal (excluding the one already used for the study
     session) with an exam within 14 days and mastery under 80%, schedules an evening review block.
   - `buildNoticeCandidate` — takes the top-ranked campus notice (via the notice engine) if it's relevant
     enough and not already surfaced by the travel candidate.

   Every candidate carries `reasons: {factor, text}[]` from the moment it's created — reasons are never
   bolted on after the fact.

2. **Ranking** (`rankingEngine.ts`) — each candidate has 7 factors (0–1): relevance, urgency,
   preferenceMatch, timeFit, accessibilityFit, availability, academicGoal. The weighted sum (weights in
   `DEFAULT_WEIGHTS`, all adding to 1.0) becomes a 0–100 score; ≥65 is "high" priority, ≥40 "medium".
   Candidates whose category is in `preferences.dismissedRecommendationTypes` are filtered out before
   scoring.

3. **Explanation** (`explanationEngine.ts`) — `explainWhy()` joins a recommendation's `reasons[]` into one
   sentence ("Recommended because X, Y, and Z."). `factorBreakdown()` labels each reason by which of the
   6 factor categories (profile/timetable/preference/campus/availability/goal/accessibility) it came from,
   for a "Why am I seeing this?" UI that shows the factors explicitly rather than saying "AI decided."

4. **Feedback** (`preferenceLearning.ts`) — `applyFeedback(recommendation, reason)` maps each of the 6
   correction reasons to one explicit preference change:

   | Feedback reason | Effect |
   |---|---|
   | `too-crowded` | `study.avoidCrowdedPlaces = true` |
   | `too-far` | `accessibility.minimizeWalking = true`, `extraTravelBufferMinutes` bumped to ≥5 |
   | `wrong-type` / `not-relevant` / `dont-recommend-again` | category added to `dismissedRecommendationTypes` |
   | `wrong-timing` | reserved — no automatic weight change yet (see Known Limitations in the README) |

   This is a transparent, rule-based weight update — explicitly not a machine-learning claim (Phase 9).

## Configurable weights

`DEFAULT_WEIGHTS` in `rankingEngine.ts` is a plain object; passing a different weights object to
`rankCandidates`/`generateRecommendations` changes ranking behavior without touching candidate generation.

## Tests

`recommendationEngine.test.ts`, `rankingEngine.test.ts`, `preferenceLearning.test.ts` — see
`docs/TEST_PLAN.md`.
