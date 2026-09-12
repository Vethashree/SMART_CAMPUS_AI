import type { StudentContext } from '../types';
import { allocateStudyTime } from '../study/studyAllocationEngine';
import { findFreeGaps } from '../time';
import type { ScheduleBlock } from './types';

const TRAVEL_MINUTES = 10;
const BREAK_MINUTES = 10;

let blockCounter = 0;
function nextId(prefix: string): string {
  blockCounter += 1;
  return `${prefix}-${blockCounter}`;
}

/**
 * "Optimize My Day" (Phase 10). Classes are hard constraints and are never
 * moved. Every free gap is filled with study blocks proportional to the
 * study-allocation engine's scoring, split with breaks once a block would
 * exceed the student's wellbeing preference for consecutive study time, and
 * capped by a travel buffer before the next class when locations differ.
 */
export function optimizeDay(context: StudentContext): ScheduleBlock[] {
  blockCounter = 0;
  const classBlocks: ScheduleBlock[] = context.timetable.map((slot) => ({
    id: `class-${slot.id}`,
    type: 'class',
    title: slot.subject,
    startMinutes: slot.startMinutes,
    endMinutes: slot.endMinutes,
    location: slot.location,
    subject: slot.subject,
  }));

  const gaps = findFreeGaps(context.timetable);
  const studyBlocks: ScheduleBlock[] = [];

  for (const gap of gaps) {
    const nextClass = gap.followingSlot;
    const needsTravel = nextClass && gap.precedingSlot && nextClass.location !== gap.precedingSlot.location;
    const travelReserve = needsTravel ? TRAVEL_MINUTES : 0;
    const usableMinutes = gap.durationMinutes - travelReserve;
    if (usableMinutes < 15) continue;

    // Reserve room for a break every time consecutive study would exceed the
    // wellbeing cap, so the loop below can never overrun the gap boundary
    // (which would otherwise collide with the travel/class block that follows).
    const maxConsecutive = context.preferences.wellbeing.maxConsecutiveStudyMinutes;
    const estimatedBreaks = Math.max(0, Math.floor(usableMinutes / maxConsecutive) - 1);
    const studyBudget = Math.max(0, usableMinutes - estimatedBreaks * BREAK_MINUTES);
    const gapEnd = gap.startMinutes + usableMinutes;

    const allocations = allocateStudyTime(context.studyGoals, studyBudget);
    let cursor = gap.startMinutes;
    let sinceLastBreak = 0;

    outer: for (const allocation of allocations) {
      let remaining = allocation.minutes;
      while (remaining > 0) {
        if (cursor >= gapEnd) break outer;

        const chunk = Math.min(
          remaining,
          maxConsecutive - sinceLastBreak,
          gapEnd - cursor
        );
        if (chunk <= 0) {
          const breakLength = Math.min(BREAK_MINUTES, gapEnd - cursor);
          if (breakLength <= 0) break outer;
          studyBlocks.push({
            id: nextId('break'),
            type: 'break',
            title: 'Break',
            startMinutes: cursor,
            endMinutes: cursor + breakLength,
          });
          cursor += breakLength;
          sinceLastBreak = 0;
          continue;
        }
        studyBlocks.push({
          id: nextId('study'),
          type: 'study',
          title: `Study: ${allocation.subject}`,
          startMinutes: cursor,
          endMinutes: cursor + chunk,
          subject: allocation.subject,
          reason: allocation.reason,
        });
        cursor += chunk;
        sinceLastBreak += chunk;
        remaining -= chunk;
      }
    }

    if (needsTravel && nextClass) {
      studyBlocks.push({
        id: nextId('travel'),
        type: 'travel',
        title: `Walk to ${nextClass.location}`,
        startMinutes: nextClass.startMinutes - TRAVEL_MINUTES,
        endMinutes: nextClass.startMinutes,
        location: nextClass.location,
      });
    }
  }

  return [...classBlocks, ...studyBlocks].sort((a, b) => a.startMinutes - b.startMinutes);
}
