import { Link, useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import type { AccessibilityPreferences } from '../../../domain/accessibility/AccessibilityPreferences';
import type { TranslationKey } from '../../../i18n/en';

const TOGGLES: { key: keyof AccessibilityPreferences; labelKey: TranslationKey }[] = [
  { key: 'largeText', labelKey: 'accessibilityPrefs.largeText' },
  { key: 'highContrast', labelKey: 'accessibilityPrefs.highContrast' },
  { key: 'reducedMotion', labelKey: 'accessibilityPrefs.reducedMotion' },
  { key: 'screenReaderOptimized', labelKey: 'accessibilityPrefs.screenReaderOptimized' },
  { key: 'voiceInput', labelKey: 'accessibilityPrefs.voiceInput' },
  { key: 'captions', labelKey: 'accessibilityPrefs.captions' },
  { key: 'visualAlerts', labelKey: 'accessibilityPrefs.visualAlerts' },
  { key: 'largeTouchTargets', labelKey: 'accessibilityPrefs.largeTouchTargets' },
  { key: 'simpleLanguage', labelKey: 'accessibilityPrefs.simpleLanguage' },
  { key: 'lowBandwidthMode', labelKey: 'accessibilityPrefs.lowBandwidthMode' },
];

export default function AccessibilityPreferencesPage() {
  const { t, accessibility, setAccessibilityPreference } = usePreferences();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('accessibilityPrefs.heading')}</h1>
      <p className="mt-2 text-text-muted">{t('accessibilityPrefs.subheading')}</p>

      <fieldset className="mt-6 border-0 p-0 m-0">
        <legend className="visually-hidden">{t('accessibilityPrefs.heading')}</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOGGLES.map(({ key, labelKey }) => (
            <label key={key} className="card p-4 flex items-center gap-3 cursor-pointer min-h-touch">
              <input
                type="checkbox"
                checked={accessibility[key]}
                onChange={(e) => setAccessibilityPreference(key, e.target.checked)}
                className="w-5 h-5 shrink-0"
              />
              <span className="font-medium">{t(labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="card p-4 mt-6" style={{ background: 'var(--color-surface-muted)' }}>
        <p className="text-sm">{t('accessibilityPrefs.assistiveNote')}</p>
        <Link to="/assisted" className="text-sm font-semibold no-underline inline-block mt-2" style={{ color: 'var(--color-accent)' }}>
          {t('accessibilityPrefs.assistiveNoteLink')}
        </Link>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/support/request')}>
          {t('accessibilityPrefs.continue')}
        </button>
      </div>
    </div>
  );
}
