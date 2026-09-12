import { describe, expect, it } from 'vitest';
import { optimizeDay } from './schedulerEngine';
import { buildStudentContext } from '../context/buildStudentContext';

describe('optimizeDay', () => {
  it('never moves or drops a class — classes are a hard constraint', () => {
    const context = buildStudentContext();
    const schedule = optimizeDay(context);

    for (const slot of context.timetable) {
      const block = schedule.find((b) => b.id === `class-${slot.id}`);
      expect(block).toBeDefined();
      expect(block!.startMinutes).toBe(slot.startMinutes);
      expect(block!.endMinutes).toBe(slot.endMinutes);
    }
  });

  it('produces no overlapping blocks', () => {
    const context = buildStudentContext();
    const schedule = optimizeDay(context).sort((a, b) => a.startMinutes - b.startMinutes);

    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].startMinutes).toBeGreaterThanOrEqual(schedule[i - 1].endMinutes);
    }
  });

  it('fills the free period between DBMS and AI with at least one study block', () => {
    const context = buildStudentContext();
    const schedule = optimizeDay(context);
    const studyBetween = schedule.filter(
      (b) => b.type === 'study' && b.startMinutes >= 10 * 60 && b.endMinutes <= 12 * 60
    );
    expect(studyBetween.length).toBeGreaterThan(0);
  });
});
