import { describe, expect, it } from 'vitest';
import { allocateStudyTime, scoreGoal } from './studyAllocationEngine';
import type { StudyGoal } from '../types';

const urgent: StudyGoal = {
  id: 'dsa',
  subject: 'DSA',
  priority: 'high',
  examInDays: 4,
  masteryPercent: 45,
  recentStudyMinutes: 90,
};

const relaxed: StudyGoal = {
  id: 'networks',
  subject: 'Networks',
  priority: 'low',
  examInDays: 21,
  masteryPercent: 70,
  recentStudyMinutes: 20,
};

describe('scoreGoal', () => {
  it('scores a soon-exam, low-mastery, high-priority goal higher than a relaxed one', () => {
    expect(scoreGoal(urgent)).toBeGreaterThan(scoreGoal(relaxed));
  });
});

describe('allocateStudyTime', () => {
  it('allocates more time to the more urgent goal', () => {
    const allocations = allocateStudyTime([urgent, relaxed], 120);
    const dsa = allocations.find((a) => a.goalId === 'dsa');
    const networks = allocations.find((a) => a.goalId === 'networks');
    expect(dsa).toBeDefined();
    expect(dsa!.minutes).toBeGreaterThan(networks?.minutes ?? 0);
  });

  it('never allocates more than the available minutes in total', () => {
    const allocations = allocateStudyTime([urgent, relaxed], 90);
    const total = allocations.reduce((sum, a) => sum + a.minutes, 0);
    expect(total).toBeLessThanOrEqual(90);
  });

  it('returns an empty allocation when there is no time available', () => {
    expect(allocateStudyTime([urgent, relaxed], 0)).toHaveLength(0);
  });

  it('every allocation carries a human-readable reason', () => {
    const allocations = allocateStudyTime([urgent], 60);
    expect(allocations[0].reason.length).toBeGreaterThan(0);
  });
});
