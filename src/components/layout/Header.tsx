import { Link } from 'react-router-dom';
import { usePreferences } from '../../app/providers/PreferencesProvider';
import { SUPPORTED_LANGUAGES } from '../../i18n';

export default function Header() {
  const { t, language, setLanguage } = usePreferences();

  return (
    <header className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          to="/"
          className="font-bold text-base sm:text-lg tracking-tight no-underline min-w-0"
          style={{ color: 'var(--color-text)' }}
        >
          {t('app.name')}
        </Link>

        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4" aria-label="Primary">
          <Link to="/track" className="text-sm font-medium no-underline" style={{ color: 'var(--color-text)' }}>
            {t('nav.trackRequest')}
          </Link>
          <Link to="/staff" className="text-sm font-medium no-underline" style={{ color: 'var(--color-text)' }}>
            {t('nav.staffPortal')}
          </Link>

          <label className="visually-hidden" htmlFor="language-switch">
            Language
          </label>
          <select
            id="language-switch"
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="text-sm rounded border px-2 py-1.5 min-h-touch"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {t(lang.labelKey)}
              </option>
            ))}
          </select>

          <Link to="/support/access-mode" className="btn btn-primary text-sm">
            {t('nav.getSupport')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
