import {
  DEMO_EVENTS,
  DEMO_LIBRARY,
  DEMO_NOTICES,
  DEMO_PROFILE,
  DEMO_STUDY_GOALS,
  DEMO_TIMETABLE,
} from '../../data/seraDemoData';
import type { StudentContext, StudentProfile } from '../types';
import { loadPreferences } from './preferenceStore';

/**
 * Assembles the unified StudentContext (Phase 6 of the SERA build) that every
 * downstream engine (recommendation, scheduling, study allocation, notices,
 * library) reads from. Timetable/notices/library/events are demo seed data
 * (Phase 36) — swapping this for campusService/timetableService/etc. backed by
 * a real API is the only change needed once one exists; nothing downstream
 * depends on the data being static.
 */
export function buildStudentContext(overrides?: Partial<StudentProfile>, now: Date = new Date()): StudentContext {
  const profile: StudentProfile = { ...DEMO_PROFILE, ...overrides };

  return {
    profile,
    timetable: DEMO_TIMETABLE,
    studyGoals: DEMO_STUDY_GOALS,
    notices: DEMO_NOTICES,
    events: DEMO_EVENTS,
    library: DEMO_LIBRARY,
    preferences: loadPreferences(),
    now,
  };
}
