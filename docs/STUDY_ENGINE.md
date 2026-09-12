# Study Intelligence

File: `src/core/study/studyAllocationEngine.ts`. Page: `src/pages/StudyTrackerPage.tsx` (`/study`).

## Scoring

`scoreGoal(goal)` combines four transparent, weighted signals into a 0–1 score:

```
urgency     = examInDays === null ? 0.3 : clamp01(1 - examInDays / 21)   weight 0.35
masteryGap  = clamp01((100 - masteryPercent) / 100)                       weight 0.30
priority    = { high: 1, medium: 0.6, low: 0.3 }[goal.priority]           weight 0.20
recency     = clamp01(1 - recentStudyMinutes / 180)                       weight 0.15
```

No machine learning claim here — these are fixed weights, visible in the source, and the reason string
for each allocation names exactly which of these drove the number (`"because the exam is 4 days away and
recent performance indicates weaker mastery"`).

## Allocation

`allocateStudyTime(goals, availableMinutes)` sorts goals by score, then distributes `availableMinutes`
proportionally to each goal's share of the total score, rounded to the nearest 5 minutes, with the lowest-
scoring goal absorbing any leftover so the total exactly equals `availableMinutes`. Every allocation
carries a human-readable `reason`.

## Where it's used

- **Dashboard "Review" recommendation** — one goal, sized to `preferredSessionMinutes`.
- **Study Tracker page** — every free minute in the day (sum of all gaps from `findFreeGaps`), across all
  active goals, shown as a prioritized list with progress bars.
- **"Optimize My Day" scheduler** — re-run per free gap, so allocation adapts to how much time is actually
  available in each specific window rather than the day as a whole.

## Known limitation

Mastery percentage and "recent study minutes" are demo/seed values (`src/data/seraDemoData.ts`), not
derived from real quiz/attendance data yet. Wiring `masteryPercent` to actual Test Marks performance and
`recentStudyMinutes` to logged study sessions is the natural next step once a study-session log exists.

## Tests

`studyAllocationEngine.test.ts` — urgency ordering, total-minutes conservation, empty-input handling,
reason presence.
