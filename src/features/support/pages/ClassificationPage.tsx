import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useSupportRequest } from '../SupportRequestContext';
import type { TranslationKey } from '../../../i18n/en';

export default function ClassificationPage() {
  const { t } = usePreferences();
  const { classification, requestText } = useSupportRequest();
  const navigate = useNavigate();

  useEffect(() => {
    if (!classification || !requestText) navigate('/support/request', { replace: true });
  }, [classification, requestText, navigate]);

  if (!classification) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <span className="status-badge">{t('classification.heading')}</span>
      <h1 className="text-2xl font-bold mt-3">{t('classification.heading')}</h1>
      <p className="mt-1 text-text-muted text-sm">{t('classification.subheading')}</p>

      <dl className="card p-5 mt-6 divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <Row label={t('classification.category')} value={t(`category.${classification.category}` as TranslationKey)} />
        <Row label={t('classification.department')} value={classification.department} />
        <Row label={t('classification.priority')} value={t(`priority.${classification.priority}` as TranslationKey)} />
        <Row
          label={t('classification.requiredInformation')}
          value={classification.requiredInformation
            .map((field) => t(`requiredInfo.${field}` as TranslationKey))
            .join(', ')}
        />
        <Row label={t('classification.estimatedResponseTime')} value={classification.estimatedResponseTime} />
      </dl>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/support/routing')}>
          {t('routing.continue')}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1 first:pt-0 last:pb-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
