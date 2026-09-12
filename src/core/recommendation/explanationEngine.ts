import type { Recommendation } from '../types';

const FACTOR_LABEL: Record<Recommendation['reasons'][number]['factor'], string> = {
  profile: 'Profile',
  timetable: 'Timetable',
  preference: 'Preference',
  campus: 'Campus',
  availability: 'Availability',
  goal: 'Goal',
  accessibility: 'Accessibility',
};

/**
 * Turns a recommendation's structured reasons into one plain-English sentence
 * for a "Why am I seeing this?" affordance (Phase 8). Never falls back to
 * vague language like "recommended for you by AI" — if there are no reasons,
 * that is a bug in the recommendation engine, not something to paper over.
 */
export function explainWhy(recommendation: Recommendation): string {
  const clauses = recommendation.reasons.map((r) => r.text);
  if (clauses.length === 0) return 'No explanation is available for this recommendation.';
  if (clauses.length === 1) return `Recommended because ${clauses[0]}.`;
  const last = clauses[clauses.length - 1];
  const rest = clauses.slice(0, -1);
  return `Recommended because ${rest.join(', ')}, and ${last}.`;
}

export function factorBreakdown(recommendation: Recommendation) {
  return recommendation.reasons.map((reason) => ({
    label: FACTOR_LABEL[reason.factor],
    text: reason.text,
  }));
}
