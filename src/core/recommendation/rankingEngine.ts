import type { Recommendation } from '../types';
import type { CandidateFactors, RecommendationCandidate } from './types';

// Configurable, transparent scoring weights (Phase 7). Every factor is 0-1;
// the weighted sum becomes the recommendation's 0-100 score. Nothing here is
// an LLM call — ranking is deterministic so it stays correct even if the AI
// layer (chat/explanations) is unavailable.
export const DEFAULT_WEIGHTS: CandidateFactors = {
  relevance: 0.2,
  urgency: 0.2,
  preferenceMatch: 0.15,
  timeFit: 0.15,
  accessibilityFit: 0.1,
  availability: 0.1,
  academicGoal: 0.1,
};

export function scoreFactors(factors: CandidateFactors, weights: CandidateFactors = DEFAULT_WEIGHTS): number {
  return (
    factors.relevance * weights.relevance +
    factors.urgency * weights.urgency +
    factors.preferenceMatch * weights.preferenceMatch +
    factors.timeFit * weights.timeFit +
    factors.accessibilityFit * weights.accessibilityFit +
    factors.availability * weights.availability +
    factors.academicGoal * weights.academicGoal
  );
}

function priorityFromScore(score: number): Recommendation['priority'] {
  if (score >= 0.65) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function rankCandidates(
  candidates: RecommendationCandidate[],
  dismissedCategories: string[] = [],
  weights: CandidateFactors = DEFAULT_WEIGHTS
): Recommendation[] {
  return candidates
    .filter((c) => !dismissedCategories.includes(c.category))
    .map((c) => {
      const score = scoreFactors(c.factors, weights);
      const recommendation: Recommendation = {
        id: c.id,
        title: c.title,
        category: c.category,
        priority: priorityFromScore(score),
        score: Math.round(score * 100),
        action: c.action,
        timeWindow: c.timeWindow,
        source: c.source,
        reasons: c.reasons,
        confidence: Math.round(score * 100) / 100,
        dismissible: c.dismissible,
        feedbackSupported: c.feedbackSupported,
      };
      return recommendation;
    })
    .sort((a, b) => b.score - a.score);
}
