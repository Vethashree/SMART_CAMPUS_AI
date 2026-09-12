import { beforeEach, describe, expect, it } from 'vitest';
import { applyFeedback } from './preferenceLearning';
import { loadPreferences } from '../context/preferenceStore';
import type { Recommendation } from '../types';

function baseRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'r1',
    title: 'Cafeteria break',
    category: 'wellness',
    priority: 'medium',
    score: 50,
    action: 'View',
    source: 'test',
    reasons: [{ factor: 'preference', text: 'test reason' }],
    confidence: 0.5,
    dismissible: true,
    feedbackSupported: true,
    ...overrides,
  };
}

describe('applyFeedback', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets avoidCrowdedPlaces when a recommendation is marked too crowded', () => {
    const updated = applyFeedback(baseRecommendation(), 'too-crowded');
    expect(updated.study.avoidCrowdedPlaces).toBe(true);
    expect(loadPreferences().study.avoidCrowdedPlaces).toBe(true);
  });

  it('turns on minimizeWalking and adds travel buffer when marked too far', () => {
    const updated = applyFeedback(baseRecommendation(), 'too-far');
    expect(updated.accessibility.minimizeWalking).toBe(true);
    expect(updated.accessibility.extraTravelBufferMinutes).toBeGreaterThanOrEqual(5);
  });

  it('adds the category to dismissedRecommendationTypes on "dont-recommend-again"', () => {
    const updated = applyFeedback(baseRecommendation({ category: 'wellness' }), 'dont-recommend-again');
    expect(updated.dismissedRecommendationTypes).toContain('wellness');
  });

  it('does not duplicate a dismissed category on repeated feedback', () => {
    applyFeedback(baseRecommendation({ category: 'wellness' }), 'not-relevant');
    const updated = applyFeedback(baseRecommendation({ category: 'wellness' }), 'not-relevant');
    expect(updated.dismissedRecommendationTypes.filter((c) => c === 'wellness')).toHaveLength(1);
  });
});
