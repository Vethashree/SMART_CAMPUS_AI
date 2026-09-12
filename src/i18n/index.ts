import en, { type TranslationKey } from './en';
import ta from './ta';
import type { Language } from '../domain/accessibility/AccessibilityPreferences';

export type { TranslationKey };

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, ta };

export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const dict = dictionaries[language] ?? dictionaries.en;
  let value = dict[key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }
  }
  return value;
}

export const SUPPORTED_LANGUAGES: { value: Language; labelKey: TranslationKey }[] = [
  { value: 'en', labelKey: 'language.english' },
  { value: 'ta', labelKey: 'language.tamil' },
];
