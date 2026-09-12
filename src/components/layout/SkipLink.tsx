import { usePreferences } from '../../app/providers/PreferencesProvider';

export default function SkipLink() {
  const { t } = usePreferences();
  return (
    <a href="#main-content" className="skip-link">
      {t('nav.skipToContent')}
    </a>
  );
}
