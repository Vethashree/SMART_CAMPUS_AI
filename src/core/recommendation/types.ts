import type { Recommendation, RecommendationReason } from '../types';

export interface CandidateFactors {
  relevance: number; // 0-1: how directly this matches what the student is doing right now
  urgency: number; // 0-1: time pressure (exam proximity, disruption, deadline)
  preferenceMatch: number; // 0-1: fit with stated study/quiet/crowd preferences
  timeFit: number; // 0-1: how well the time window fits available time
  accessibilityFit: number; // 0-1: fit with accessibility preferences
  availability: number; // 0-1: real-world availability (seats, room, resource)
  academicGoal: number; // 0-1: alignment with active study goals
}

export interface RecommendationCandidate {
  id: string;
  title: string;
  category: Recommendation['category'];
  action: string;
  timeWindow?: string;
  source: string;
  factors: CandidateFactors;
  reasons: RecommendationReason[];
  dismissible: boolean;
  feedbackSupported: boolean;
}
