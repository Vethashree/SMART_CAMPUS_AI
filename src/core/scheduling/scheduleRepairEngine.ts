import type { CampusEvent } from '../types';
import type { ScheduleBlock } from './types';

export interface ScheduleRepairResult {
  affected: ScheduleBlock[];
  repaired: ScheduleBlock[];
  explanation: string;
}

const DETOUR_MINUTES = 5;

/**
 * Deterministic schedule repair (Phase 11 / the "Plan Impact" feature in
 * Phase 35). Given a full day's schedule and a campus disruption, finds
 * blocks at the affected location and adjusts them — it never invents a new
 * plan from scratch, it patches the existing one and reports exactly what
 * changed and why.
 */
export function repairSchedule(schedule: ScheduleBlock[], event: CampusEvent): ScheduleRepairResult | null {
  if (event.type !== 'route-closure' || !event.affectedLocation) return null;

  const sorted = [...schedule].sort((a, b) => a.startMinutes - b.startMinutes);
  const affected = sorted.filter(
    (block) => block.type === 'travel' && block.location?.includes(event.affectedLocation!)
  );
  if (affected.length === 0) return null;

  const repaired = sorted.map((block) => ({ ...block }));

  for (const travelBlock of affected) {
    const idx = repaired.findIndex((b) => b.id === travelBlock.id);
    if (idx === -1) continue;

    const newStart = repaired[idx].startMinutes - DETOUR_MINUTES;
    repaired[idx] = {
      ...repaired[idx],
      startMinutes: newStart,
      title: 'Leave via alternate route',
      reason: `Your route was adjusted because ${event.description}`,
    };

    const prev = repaired[idx - 1];
    if (prev && prev.endMinutes === travelBlock.startMinutes) {
      repaired[idx - 1] = { ...prev, endMinutes: newStart };
    }
  }

  const affectedDownstream = repaired.filter((block, idx) => {
    const original = sorted[idx];
    return original && (original.startMinutes !== block.startMinutes || original.endMinutes !== block.endMinutes);
  });

  return {
    affected: affectedDownstream,
    repaired,
    explanation: `${affectedDownstream.length} planned ${
      affectedDownstream.length === 1 ? 'activity is' : 'activities are'
    } affected by: ${event.description}`,
  };
}

/**
 * Finds which timetable-linked items a disruption touches, for the
 * "N of your planned activities may be affected" summary before the user
 * asks to repair anything.
 */
export function findAffectedBlocks(schedule: ScheduleBlock[], event: CampusEvent): ScheduleBlock[] {
  return schedule.filter((block) => {
    const locationMatch = Boolean(event.affectedLocation && block.location?.includes(event.affectedLocation));
    const subjectMatch = Boolean(event.affectedSubject && block.subject === event.affectedSubject);
    return locationMatch || subjectMatch;
  });
}
