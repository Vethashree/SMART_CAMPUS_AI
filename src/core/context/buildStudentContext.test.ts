import { describe, expect, it } from 'vitest';
import { buildStudentContext } from './buildStudentContext';

describe('buildStudentContext', () => {
  it('assembles a complete context with a profile, timetable, goals, notices, library and preferences', () => {
    const context = buildStudentContext();
    expect(context.profile.id).toBeTruthy();
    expect(context.timetable.length).toBeGreaterThan(0);
    expect(context.studyGoals.length).toBeGreaterThan(0);
    expect(context.notices.length).toBeGreaterThan(0);
    expect(context.library.length).toBeGreaterThan(0);
    expect(context.preferences).toBeDefined();
    expect(context.now).toBeInstanceOf(Date);
  });

  it('applies profile overrides (e.g. the logged-in user name) without losing the rest of the seed context', () => {
    const context = buildStudentContext({ name: 'Asha' });
    expect(context.profile.name).toBe('Asha');
    expect(context.timetable.length).toBeGreaterThan(0);
  });
});
