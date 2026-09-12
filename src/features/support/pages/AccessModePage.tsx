import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { ACCESS_MODES } from '../../../domain/accessibility/AccessibilityPreferences';

export default function AccessModePage() {
  const { t, accessMode, setAccessMode } = usePreferences();
  const navigate = useNavigate();

  const choose = (mode: (typeof ACCESS_MODES)[number]['value']) => {
    setAccessMode(mode);
    if (mode === 'ASSISTED') {
      navigate('/assisted');
      return;
    }
    navigate('/support/language');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('accessMode.heading')}</h1>
      <p className="mt-2 text-text-muted">{t('accessMode.subheading')}</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label={t('accessMode.heading')}>
        {ACCESS_MODES.map((mode) => {
          const selected = accessMode === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(mode.value)}
              className="card p-5 text-left min-h-touch"
              style={selected ? { borderColor: 'var(--color-accent)', borderWidth: 2 } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t(mode.titleKey)}</span>
                {selected && <Check className="w-5 h-5" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />}
              </div>
              <p className="mt-1 text-sm text-text-muted">{t(mode.descriptionKey)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
