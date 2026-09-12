import type { TimetableSlot } from './types';

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function formatMinutes(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

export interface FreeGap {
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  followingSlot: TimetableSlot | null;
  precedingSlot: TimetableSlot | null;
}

const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 18 * 60;

/**
 * Finds free windows in a day's timetable between DAY_START and DAY_END,
 * anchored to "today" regardless of the slot's nominal weekday — the demo
 * timetable represents a single day's schedule (Phase 36 seed).
 */
export function findFreeGaps(timetable: TimetableSlot[]): FreeGap[] {
  const sorted = [...timetable].sort((a, b) => a.startMinutes - b.startMinutes);
  const gaps: FreeGap[] = [];

  let cursor = DAY_START_MINUTES;
  let preceding: TimetableSlot | null = null;

  for (const slot of sorted) {
    if (slot.startMinutes > cursor) {
      gaps.push({
        startMinutes: cursor,
        endMinutes: slot.startMinutes,
        durationMinutes: slot.startMinutes - cursor,
        followingSlot: slot,
        precedingSlot: preceding,
      });
    }
    cursor = Math.max(cursor, slot.endMinutes);
    preceding = slot;
  }

  if (cursor < DAY_END_MINUTES) {
    gaps.push({
      startMinutes: cursor,
      endMinutes: DAY_END_MINUTES,
      durationMinutes: DAY_END_MINUTES - cursor,
      followingSlot: null,
      precedingSlot: preceding,
    });
  }

  return gaps.filter((gap) => gap.durationMinutes > 0);
}

export function nextUpcomingSlot(timetable: TimetableSlot[], nowMinutes: number): TimetableSlot | null {
  const upcoming = timetable
    .filter((slot) => slot.startMinutes >= nowMinutes)
    .sort((a, b) => a.startMinutes - b.startMinutes);
  return upcoming[0] ?? null;
}

export function currentSlot(timetable: TimetableSlot[], nowMinutes: number): TimetableSlot | null {
  return (
    timetable.find((slot) => slot.startMinutes <= nowMinutes && nowMinutes < slot.endMinutes) ?? null
  );
}
