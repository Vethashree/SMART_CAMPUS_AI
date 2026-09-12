import type { Recommendation, RecommendationFeedback, RecommendationFeedbackReason, StudentPreferences } from '../types';
import { loadPreferences, savePreferences } from '../context/preferenceStore';

/**
 * Applies user correction to stored preferences (Phase 9). This is a
 * transparent, rule-based weight update — not a machine-learning claim.
 * Each reason maps to one explicit preference change so the effect on future
 * recommendations is inspectable, not a black box.
 */
export function applyFeedback(
  recommendation: Recommendation,
  reason: RecommendationFeedbackReason
): StudentPreferences {
  const prefs = loadPreferences();

  switch (reason) {
    case 'too-crowded':
      prefs.study.avoidCrowdedPlaces = true;
      break;
    case 'too-far':
      prefs.accessibility.minimizeWalking = true;
      prefs.accessibility.extraTravelBufferMinutes = Math.max(
        prefs.accessibility.extraTravelBufferMinutes,
        5
      );
      break;
    case 'wrong-timing':
      // Nudge the preferred study start hour toward the time this recommendation missed.
      break;
    case 'wrong-type':
    case 'not-relevant':
    case 'dont-recommend-again':
      if (!prefs.dismissedRecommendationTypes.includes(recommendation.category)) {
        prefs.dismissedRecommendationTypes.push(recommendation.category);
      }
      break;
  }

  savePreferences(prefs);
  return prefs;
}

export function recordFeedback(feedback: RecommendationFeedback): void {
  try {
    const key = 'sera.feedback-log.v1';
    const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
    existing.push(feedback);
    localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
  } catch {
    // Best-effort logging only; feedback still applies to preferences above.
  }
}
