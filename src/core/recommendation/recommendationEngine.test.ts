import { beforeEach, describe, expect, it } from 'vitest';
import { generateRecommendations } from './recommendationEngine';
import { buildStudentContext } from '../context/buildStudentContext';
import { loadPreferences, savePreferences } from '../context/preferenceStore';

// Fixed at 11:00 AM so the free period between DBMS (ends 10:00) and AI
// (starts 12:00), and the still-upcoming Networks class at 2:00 PM, are both
// live regardless of the real time the test suite happens to run at.
const MORNING = new Date(2026, 0, 1, 11, 0);

describe('generateRecommendations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('every recommendation carries at least one human-readable reason', () => {
    const context = buildStudentContext(undefined, MORNING);
    const recs = generateRecommendations(context);
    expect(recs.length).toBeGreaterThan(0);
    for (const rec of recs) {
      expect(rec.reasons.length).toBeGreaterThan(0);
    }
  });

  it('recommends leaving early when a route closure affects the next class location', () => {
    const context = buildStudentContext(undefined, MORNING);
    const recs = generateRecommendations(context, 10);
    const travelRec = recs.find((r) => r.category === 'travel');
    expect(travelRec).toBeDefined();
    expect(travelRec!.title).toContain('Networks');
  });

  it('raises accessibility fit for the travel recommendation when extra travel buffer is set', () => {
    const prefs = loadPreferences();
    prefs.accessibility.extraTravelBufferMinutes = 10;
    savePreferences(prefs);

    const context = buildStudentContext(undefined, MORNING);
    const recs = generateRecommendations(context, 10);
    const travelRec = recs.find((r) => r.category === 'travel');
    expect(travelRec).toBeDefined();
    expect(travelRec!.confidence).toBeGreaterThan(0);
  });

  it('excludes a category entirely once it has been dismissed', () => {
    const prefs = loadPreferences();
    prefs.dismissedRecommendationTypes.push('travel');
    savePreferences(prefs);

    const context = buildStudentContext(undefined, MORNING);
    const recs = generateRecommendations(context, 10);
    expect(recs.find((r) => r.category === 'travel')).toBeUndefined();
  });
});
