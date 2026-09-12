import type { TranslationKey } from '../../i18n/en';

export type AccessMode = 'VOICE_AUDIO' | 'TEXT_VISUAL' | 'VOICE_TEXT_VISUAL' | 'ASSISTED';

export type Language = 'en' | 'ta';

export interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  voiceInput: boolean;
  captions: boolean;
  visualAlerts: boolean;
  largeTouchTargets: boolean;
  simpleLanguage: boolean;
  lowBandwidthMode: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  voiceInput: false,
  captions: false,
  visualAlerts: false,
  largeTouchTargets: false,
  simpleLanguage: false,
  lowBandwidthMode: false,
};

export const ACCESS_MODES: { value: AccessMode; titleKey: TranslationKey; descriptionKey: TranslationKey }[] = [
  { value: 'VOICE_AUDIO', titleKey: 'accessMode.voiceAudio.title', descriptionKey: 'accessMode.voiceAudio.description' },
  { value: 'TEXT_VISUAL', titleKey: 'accessMode.textVisual.title', descriptionKey: 'accessMode.textVisual.description' },
  { value: 'VOICE_TEXT_VISUAL', titleKey: 'accessMode.voiceTextVisual.title', descriptionKey: 'accessMode.voiceTextVisual.description' },
  { value: 'ASSISTED', titleKey: 'accessMode.assisted.title', descriptionKey: 'accessMode.assisted.description' },
];
