# Scheduler & Schedule Repair

Files: `src/core/scheduling/{schedulerEngine,scheduleRepairEngine,types}.ts`. Page: `src/pages/OptimizeSchedulePage.tsx` (`/timetable/optimize`).

## "Optimize My Day" (`schedulerEngine.ts`)

Hard constraints (never moved): class blocks, taken straight from the timetable.

Soft constraints (filled in around the hard ones):
- Every free gap is filled with study blocks, allocated across active goals via the study allocation
  engine (`allocateStudyTime`), proportional to each goal's transparent priority score.
- A block is split with a 10-minute break once continuous study would exceed
  `preferences.wellbeing.maxConsecutiveStudyMinutes` (default 90).
- A 10-minute travel block is inserted before a class if the previous activity was at a different
  location.

**The one subtlety that had a real bug during development:** break time must be budgeted out of the
gap's total *before* allocating study minutes, or the schedule can overflow past the gap boundary into
the next class/travel block. `schedulerEngine.ts` pre-estimates how many breaks a gap will need
(`estimatedBreaks = floor(usableMinutes / maxConsecutive) - 1`) and reserves that time up front; the fill
loop additionally hard-stops at the gap's actual end as a second guarantee. `schedulerEngine.test.ts`
asserts no two blocks in a generated day overlap.

## Schedule Repair / "Plan Impact" (`scheduleRepairEngine.ts`)

Given a full day's blocks and a `route-closure` campus event:

1. `findAffectedBlocks` — flags every block whose location matches the disrupted location (or whose
   subject matches `event.affectedSubject`, only when that field is actually set — comparing two
   `undefined`s used to silently flag every subject-less block, e.g. every break; fixed and covered by a
   regression test).
2. `repairSchedule` — for each affected **travel** block, shifts its start earlier by a fixed detour
   penalty (5 minutes) and relabels it "Leave via alternate route"; if the immediately preceding block
   ended exactly where the travel block began, it's trimmed to match. Class blocks are never moved —
   they're a hard constraint.

This reproduces the brief's own worked example exactly: `3:30 Library / 4:30 Walk to Block B / 5:00
Networks` under a Block B closure becomes `3:30 Library (trimmed) / 4:25 Leave via alternate route / 5:00
Networks`, with `explanation` stating why.

The UI (`OptimizeSchedulePage.tsx`) shows this as: campus update banner → "N of your planned activities
may be affected — View Plan Impact" → affected list → "Repair My Plan" → updated schedule with the
changed blocks ring-highlighted.

## Tests

`schedulerEngine.test.ts` (hard-constraint preservation, no overlaps, gap-filling), `scheduleRepairEngine.test.ts`
(before/after shift math, class immovability, unrelated-block exclusion, explanation text).
