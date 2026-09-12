import { DEFAULT_PREFERENCES } from '../../data/seraDemoData';
import type { StudentPreferences } from '../types';

const STORAGE_KEY = 'sera.preferences.v1';

function clonePreferences(prefs: StudentPreferences): StudentPreferences {
  return {
    accessibility: { ...prefs.accessibility },
    study: { ...prefs.study },
    wellbeing: { ...prefs.wellbeing },
    dismissedRecommendationTypes: [...prefs.dismissedRecommendationTypes],
  };
}

export function loadPreferences(): StudentPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clonePreferences(DEFAULT_PREFERENCES);
    const parsed = JSON.parse(raw);
    return {
      accessibility: { ...DEFAULT_PREFERENCES.accessibility, ...parsed.accessibility },
      study: { ...DEFAULT_PREFERENCES.study, ...parsed.study },
      wellbeing: { ...DEFAULT_PREFERENCES.wellbeing, ...parsed.wellbeing },
      dismissedRecommendationTypes: Array.isArray(parsed.dismissedRecommendationTypes)
        ? parsed.dismissedRecommendationTypes
        : [],
    };
  } catch {
    return clonePreferences(DEFAULT_PREFERENCES);
  }
}

export function savePreferences(prefs: StudentPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable (private browsing, etc.) — preferences just won't persist across reloads.
  }
}

export function resetPreferences(): StudentPreferences {
  const defaults = clonePreferences(DEFAULT_PREFERENCES);
  savePreferences(defaults);
  return defaults;
}
