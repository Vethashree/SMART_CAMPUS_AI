import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { SUPPORTED_LANGUAGES } from '../../../i18n';

export default function LanguagePage() {
  const { t, language, setLanguage } = usePreferences();
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{t('language.heading')}</h1>

      <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label={t('language.heading')}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const selected = language === lang.value;
          return (
            <button
              key={lang.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setLanguage(lang.value)}
              className="card p-4 flex items-center justify-between min-h-touch"
              style={selected ? { borderColor: 'var(--color-accent)', borderWidth: 2 } : undefined}
            >
              <span className="font-semibold">{t(lang.labelKey)}</span>
              {selected && <Check className="w-5 h-5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/support/accessibility')}>
          {t('language.continue')}
        </button>
      </div>
    </div>
  );
}
