import { Link } from 'react-router-dom';
import { Mic, Languages, WifiOff, Accessibility, Users } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';

export default function LandingPage() {
  const { t } = usePreferences();

  const features = [
    { icon: Mic, titleKey: 'landing.feature.voice.title', descKey: 'landing.feature.voice.description' },
    { icon: Languages, titleKey: 'landing.feature.language.title', descKey: 'landing.feature.language.description' },
    { icon: WifiOff, titleKey: 'landing.feature.connectivity.title', descKey: 'landing.feature.connectivity.description' },
    { icon: Accessibility, titleKey: 'landing.feature.accessibility.title', descKey: 'landing.feature.accessibility.description' },
    { icon: Users, titleKey: 'landing.feature.human.title', descKey: 'landing.feature.human.description' },
  ] as const;

  return (
    <div>
      <section className="text-center py-8 sm:py-14">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{t('landing.hero.title')}</h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">{t('landing.hero.subtitle')}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/support/access-mode" className="btn btn-primary text-base px-8">
            {t('landing.hero.primaryCta')}
          </Link>
          <Link to="/track" className="btn btn-secondary text-base px-8">
            {t('landing.hero.secondaryCta')}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {features.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="card p-5">
            <Icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <h2 className="mt-3 font-semibold">{t(titleKey)}</h2>
            <p className="mt-1 text-sm text-text-muted">{t(descKey)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
