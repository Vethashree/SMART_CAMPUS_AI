import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useSupportRequest } from '../SupportRequestContext';

export default function RoutingExplanationPage() {
  const { t } = usePreferences();
  const { classification, requestText } = useSupportRequest();
  const navigate = useNavigate();

  useEffect(() => {
    if (!classification || !requestText) navigate('/support/request', { replace: true });
  }, [classification, requestText, navigate]);

  if (!classification) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('routing.heading')}</h1>

      <div className="card p-5 mt-6 space-y-4">
        <div>
          <p className="text-sm text-text-muted">{t('routing.detectedIssue')}</p>
          <p className="font-medium mt-0.5">{requestText}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('routing.destination')}</p>
          <p className="font-medium mt-0.5">{classification.department}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('routing.reason')}</p>
          <p className="mt-0.5">{classification.reason}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/support/privacy')}>
          {t('routing.continue')}
        </button>
      </div>
    </div>
  );
}
