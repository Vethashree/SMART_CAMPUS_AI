import type { LibraryZone, StudentPreferences } from '../types';

export interface LibrarySlotRecommendation {
  zone: LibraryZone;
  score: number;
  reasons: string[];
}

/**
 * Ranks library zones for a study session (Phase 14). Quiet-preference match
 * and seat availability dominate; a zone with zero seats available is never
 * recommended even if otherwise a good fit.
 */
export function recommendLibraryZone(
  zones: LibraryZone[],
  preferences: StudentPreferences
): LibrarySlotRecommendation | null {
  const candidates = zones
    .filter((zone) => zone.seatsAvailable > 0)
    .map((zone) => {
      let score = 0;
      const reasons: string[] = [];

      if (preferences.study.preferQuiet && zone.quiet) {
        score += 0.5;
        reasons.push('matches your quiet-study preference');
      } else if (!preferences.study.preferQuiet && !zone.quiet) {
        score += 0.2;
      }

      const availabilityRatio = zone.seatsAvailable / zone.seatsTotal;
      score += availabilityRatio * 0.4;
      if (availabilityRatio >= 0.3) {
        reasons.push(`${zone.seatsAvailable} of ${zone.seatsTotal} seats are free`);
      } else {
        reasons.push(`only ${zone.seatsAvailable} seats left, but currently the best fit`);
      }

      if (preferences.study.avoidCrowdedPlaces && availabilityRatio < 0.2) {
        score -= 0.3;
      }

      return { zone, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return candidates[0] ?? null;
}
