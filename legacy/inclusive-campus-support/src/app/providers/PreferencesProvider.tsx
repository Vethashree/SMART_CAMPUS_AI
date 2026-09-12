import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferences,
  type AccessMode,
  type Language,
} from '../../domain/accessibility/AccessibilityPreferences';
import { translate, type TranslationKey } from '../../i18n';

const STORAGE_KEY = 'ics.preferences.v1';

interface StoredPreferences {
  language: Language;
  accessMode: AccessMode | null;
  accessibility: AccessibilityPreferences;
}

const DEFAULT_STATE: StoredPreferences = {
  language: 'en',
  accessMode: null,
  accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES,
};

function loadStored(): StoredPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      language: parsed.language ?? DEFAULT_STATE.language,
      accessMode: parsed.accessMode ?? null,
      accessibility: { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...(parsed.accessibility ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

interface PreferencesContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  accessMode: AccessMode | null;
  setAccessMode: (mode: AccessMode) => void;
  accessibility: AccessibilityPreferences;
  setAccessibilityPreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredPreferences>(() => loadStored());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = state.language;
    root.dataset.largeText = String(state.accessibility.largeText);
    root.dataset.highContrast = String(state.accessibility.highContrast);
    root.dataset.reducedMotion = String(state.accessibility.reducedMotion);
    root.dataset.largeTouchTargets = String(state.accessibility.largeTouchTargets);
    root.dataset.screenReaderOptimized = String(state.accessibility.screenReaderOptimized);
    root.dataset.lowBandwidth = String(state.accessibility.lowBandwidthMode);
  }, [state.language, state.accessibility]);

  const setLanguage = useCallback((language: Language) => {
    setState((prev) => ({ ...prev, language }));
  }, []);

  const setAccessMode = useCallback((accessMode: AccessMode) => {
    setState((prev) => ({ ...prev, accessMode }));
  }, []);

  const setAccessibilityPreference = useCallback(
    <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
      setState((prev) => ({ ...prev, accessibility: { ...prev.accessibility, [key]: value } }));
    },
    [],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(state.language, key, params),
    [state.language],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language: state.language,
      setLanguage,
      accessMode: state.accessMode,
      setAccessMode,
      accessibility: state.accessibility,
      setAccessibilityPreference,
      t,
    }),
    [state, setLanguage, setAccessMode, setAccessibilityPreference, t],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
}
