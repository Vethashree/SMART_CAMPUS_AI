import { describe, expect, it } from 'vitest';
import { repairSchedule, findAffectedBlocks } from './scheduleRepairEngine';
import type { ScheduleBlock } from './types';
import type { CampusEvent } from '../types';

const schedule: ScheduleBlock[] = [
  { id: 'study-1', type: 'study', title: 'Study: DSA', startMinutes: 15 * 60 + 30, endMinutes: 16 * 60 + 30 },
  { id: 'travel-1', type: 'travel', title: 'Walk to Block B 204', startMinutes: 16 * 60 + 30, endMinutes: 16 * 60 + 40, location: 'Block B 204' },
  { id: 'class-networks', type: 'class', title: 'Networks', startMinutes: 17 * 60, endMinutes: 18 * 60, location: 'Block B 204', subject: 'Networks' },
];

const routeClosure: CampusEvent = {
  id: 'e1',
  title: 'Block B east entrance closed',
  type: 'route-closure',
  affectedLocation: 'Block B',
  description: 'the east entrance is currently unavailable',
};

describe('repairSchedule', () => {
  it('moves the travel block earlier and trims the preceding block to match', () => {
    const result = repairSchedule(schedule, routeClosure);
    expect(result).not.toBeNull();

    const repairedTravel = result!.repaired.find((b) => b.id === 'travel-1')!;
    expect(repairedTravel.startMinutes).toBe(16 * 60 + 25);
    expect(repairedTravel.title).toBe('Leave via alternate route');

    const repairedStudy = result!.repaired.find((b) => b.id === 'study-1')!;
    expect(repairedStudy.endMinutes).toBe(16 * 60 + 25);
  });

  it('never moves the class block itself — class times are a hard constraint', () => {
    const result = repairSchedule(schedule, routeClosure);
    const repairedClass = result!.repaired.find((b) => b.id === 'class-networks')!;
    const originalClass = schedule.find((b) => b.id === 'class-networks')!;
    expect(repairedClass.startMinutes).toBe(originalClass.startMinutes);
    expect(repairedClass.endMinutes).toBe(originalClass.endMinutes);
  });

  it('returns null when the event does not affect any block', () => {
    const unrelated: CampusEvent = { id: 'e2', title: 'Block Z closure', type: 'route-closure', affectedLocation: 'Block Z', description: 'irrelevant' };
    expect(repairSchedule(schedule, unrelated)).toBeNull();
  });

  it('explains what changed and why', () => {
    const result = repairSchedule(schedule, routeClosure);
    expect(result!.explanation).toContain('east entrance is currently unavailable');
  });
});

describe('findAffectedBlocks', () => {
  it('flags every block at the disrupted location, including the class itself', () => {
    const affected = findAffectedBlocks(schedule, routeClosure);
    const ids = affected.map((b) => b.id);
    expect(ids).toContain('travel-1');
    expect(ids).toContain('class-networks');
  });

  it('does not flag unrelated blocks that merely have no subject, like breaks', () => {
    const scheduleWithBreak: ScheduleBlock[] = [
      ...schedule,
      { id: 'break-1', type: 'break', title: 'Break', startMinutes: 16 * 60, endMinutes: 16 * 60 + 10 },
    ];
    const affected = findAffectedBlocks(scheduleWithBreak, routeClosure);
    expect(affected.map((b) => b.id)).not.toContain('break-1');
  });
});
