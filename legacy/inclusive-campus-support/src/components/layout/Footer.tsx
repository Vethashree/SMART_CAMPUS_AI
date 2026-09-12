import { usePreferences } from '../../app/providers/PreferencesProvider';

export default function Footer() {
  const { t } = usePreferences();
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-text-muted">
        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
          {t('app.name')}
        </p>
        <p className="mt-1">{t('app.tagline')}</p>
      </div>
    </footer>
  );
}
