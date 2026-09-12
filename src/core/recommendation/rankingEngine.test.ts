import { describe, expect, it } from 'vitest';
import { rankCandidates, scoreFactors, DEFAULT_WEIGHTS } from './rankingEngine';
import type { RecommendationCandidate } from './types';

function candidate(overrides: Partial<RecommendationCandidate>): RecommendationCandidate {
  return {
    id: 'c1',
    title: 'Test',
    category: 'study',
    action: 'Go',
    source: 'test',
    reasons: [{ factor: 'goal', text: 'because reasons' }],
    dismissible: true,
    feedbackSupported: true,
    factors: {
      relevance: 0.5,
      urgency: 0.5,
      preferenceMatch: 0.5,
      timeFit: 0.5,
      accessibilityFit: 0.5,
      availability: 0.5,
      academicGoal: 0.5,
    },
    ...overrides,
  };
}

describe('scoreFactors', () => {
  it('weights sum to a score between 0 and 1 for mid-range factors', () => {
    const score = scoreFactors(candidate({}).factors);
    expect(score).toBeCloseTo(0.5, 5);
  });

  it('a maxed-out factor set scores at the sum of the weights', () => {
    const allOnes = { relevance: 1, urgency: 1, preferenceMatch: 1, timeFit: 1, accessibilityFit: 1, availability: 1, academicGoal: 1 };
    const totalWeight = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(scoreFactors(allOnes)).toBeCloseTo(totalWeight, 5);
  });
});

describe('rankCandidates', () => {
  it('sorts higher-scoring candidates first', () => {
    const low = candidate({ id: 'low', factors: { relevance: 0.1, urgency: 0.1, preferenceMatch: 0.1, timeFit: 0.1, accessibilityFit: 0.1, availability: 0.1, academicGoal: 0.1 } });
    const high = candidate({ id: 'high', factors: { relevance: 0.9, urgency: 0.9, preferenceMatch: 0.9, timeFit: 0.9, accessibilityFit: 0.9, availability: 0.9, academicGoal: 0.9 } });

    const ranked = rankCandidates([low, high]);
    expect(ranked[0].id).toBe('high');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('filters out candidates whose category has been dismissed', () => {
    const cafeteria = candidate({ id: 'cafeteria', category: 'wellness' });
    const ranked = rankCandidates([cafeteria], ['wellness']);
    expect(ranked).toHaveLength(0);
  });

  it('never produces a recommendation with zero reasons', () => {
    const ranked = rankCandidates([candidate({})]);
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
  });
});
