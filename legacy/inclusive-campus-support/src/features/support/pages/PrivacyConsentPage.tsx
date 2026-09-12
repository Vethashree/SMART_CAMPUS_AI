import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useOfflineQueue } from '../../../app/providers/OfflineQueueProvider';
import { useSupportRequest } from '../SupportRequestContext';
import { STANDARD_NOT_COLLECTED } from '../../../domain/privacy/ConsentRecord';
import type { TranslationKey } from '../../../i18n/en';

export default function PrivacyConsentPage() {
  const { t, language, accessMode } = usePreferences();
  const { submitOrQueue } = useOfflineQueue();
  const { requestText, studentId, classification, consent, setConsent, setCreatedTicket } = useSupportRequest();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!classification || !requestText) navigate('/support/request', { replace: true });
  }, [classification, requestText, navigate]);

  if (!classification) return null;

  const handleSubmit = async () => {
    if (!consent) {
      setError(t('privacy.consentRequired'));
      return;
    }
    setError(null);
    setSubmitting(true);

    const idempotencyKey =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    const { ticket, queued } = await submitOrQueue({
      studentId: studentId.trim(),
      requestText: requestText.trim(),
      language,
      accessibilityMode: accessMode ?? 'TEXT_VISUAL',
      source: 'SELF_SERVICE',
      consent: true,
      idempotencyKey,
    });

    setCreatedTicket(ticket, queued);
    setSubmitting(false);
    navigate('/support/confirmation');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('privacy.heading')}</h1>

      <div className="card p-5 mt-6 space-y-4">
        <div>
          <p className="text-sm text-text-muted">{t('privacy.informationShared')}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('privacy.request')}</p>
          <p className="font-medium mt-0.5">{requestText}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('privacy.recipient')}</p>
          <p className="font-medium mt-0.5">{classification.department}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('privacy.purpose')}</p>
          <p className="mt-0.5">{t('privacy.purposeText')}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('privacy.requiredIdentifier')}</p>
          <p className="font-medium mt-0.5">{studentId || '—'}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{t('privacy.notCollected')}</p>
          <ul className="mt-1 list-disc list-inside text-sm">
            {STANDARD_NOT_COLLECTED.map((key) => (
              <li key={key}>{t(key as TranslationKey)}</li>
            ))}
          </ul>
        </div>
      </div>

      <label className="card p-4 mt-4 flex items-center gap-3 cursor-pointer min-h-touch">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-5 h-5 shrink-0" />
        <span className="font-medium">{t('privacy.consentCheckbox')}</span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium mt-2" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? t('common.loading') : t('privacy.consentSubmit')}
        </button>
      </div>
    </div>
  );
}
