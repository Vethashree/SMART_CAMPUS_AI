import type { StudyGoal } from '../types';

export interface StudyAllocation {
  goalId: string;
  subject: string;
  priorityScore: number; // 0-1, transparent weighted score
  minutes: number;
  reason: string;
}

const PRIORITY_WEIGHT: Record<StudyGoal['priority'], number> = {
  high: 1,
  medium: 0.6,
  low: 0.3,
};

const WEIGHTS = {
  urgency: 0.35,
  masteryGap: 0.3,
  priority: 0.2,
  recency: 0.15,
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function scoreGoal(goal: StudyGoal): number {
  const urgency = goal.examInDays === null ? 0.3 : clamp01(1 - goal.examInDays / 21);
  const masteryGap = clamp01((100 - goal.masteryPercent) / 100);
  const priority = PRIORITY_WEIGHT[goal.priority];
  const recency = clamp01(1 - goal.recentStudyMinutes / 180);

  return (
    urgency * WEIGHTS.urgency +
    masteryGap * WEIGHTS.masteryGap +
    priority * WEIGHTS.priority +
    recency * WEIGHTS.recency
  );
}

function buildReason(goal: StudyGoal, minutes: number, isTopAllocation: boolean): string {
  const parts: string[] = [];
  if (goal.examInDays !== null && goal.examInDays <= 7) {
    parts.push(`the exam is ${goal.examInDays} day${goal.examInDays === 1 ? '' : 's'} away`);
  }
  if (goal.masteryPercent < 60) {
    parts.push('recent performance indicates weaker mastery');
  }
  if (goal.priority === 'high' && parts.length === 0) {
    parts.push(`${goal.subject} is one of your active high-priority goals`);
  }
  if (parts.length === 0) {
    parts.push('it fits your remaining study capacity today');
  }
  const lead = isTopAllocation ? `${minutes} minutes assigned to ${goal.subject}` : `${minutes} minutes for ${goal.subject}`;
  return `${lead} because ${parts.join(' and ')}.`;
}

/**
 * Distributes a pool of available study minutes across active goals,
 * proportional to a transparent priority score (exam proximity, mastery gap,
 * stated goal priority, and how recently the subject was studied). No ML
 * claims — this is a weighted allocation, and the weights are visible above.
 */
export function allocateStudyTime(goals: StudyGoal[], availableMinutes: number): StudyAllocation[] {
  if (goals.length === 0 || availableMinutes <= 0) return [];

  const scored = goals
    .map((goal) => ({ goal, score: scoreGoal(goal) }))
    .sort((a, b) => b.score - a.score);

  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  if (totalScore === 0) return [];

  let remaining = availableMinutes;
  const allocations: StudyAllocation[] = scored.map(({ goal, score }, idx) => {
    const isLast = idx === scored.length - 1;
    const rawMinutes = isLast ? remaining : Math.round(((score / totalScore) * availableMinutes) / 5) * 5;
    const minutes = Math.max(0, Math.min(rawMinutes, remaining));
    remaining -= minutes;
    return {
      goalId: goal.id,
      subject: goal.subject,
      priorityScore: Math.round(score * 100) / 100,
      minutes,
      reason: buildReason(goal, minutes, idx === 0),
    };
  });

  return allocations.filter((a) => a.minutes > 0);
}
