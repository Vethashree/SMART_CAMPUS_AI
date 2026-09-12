import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useOfflineQueue } from '../../../app/providers/OfflineQueueProvider';
import { classifyRequest } from '../../../domain/classification/classify';
import type { RequestClassification } from '../../../domain/classification/RequestClassification';
import type { Ticket } from '../../../domain/tickets/Ticket';
import type { TranslationKey } from '../../../i18n/en';

export default function AssistedSupportPage() {
  const { t, language } = usePreferences();
  const { submitOrQueue } = useOfflineQueue();

  const [staffName, setStaffName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [requestText, setRequestText] = useState('');
  const [classification, setClassification] = useState<RequestClassification | null>(null);
  const [consent, setConsent] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [queued, setQueued] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const classify = () => {
    if (requestText.trim().length < 4) return;
    setClassification(classifyRequest(requestText.trim()));
  };

  const submit = async () => {
    if (!classification || !consent || !studentId.trim()) return;
    setSubmitting(true);
    const idempotencyKey = crypto.randomUUID();
    const result = await submitOrQueue({
      studentId: studentId.trim(),
      requestText: requestText.trim(),
      language,
      accessibilityMode: 'ASSISTED',
      source: 'ASSISTED',
      consent: true,
      idempotencyKey,
      assistedByStaff: staffName.trim() || undefined,
    });
    setTicket(result.ticket);
    setQueued(result.queued);
    setSubmitting(false);
  };

  if (ticket || queued) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: 'var(--color-success)' }} aria-hidden="true" />
        <h1 className="text-2xl font-bold mt-4">{t('ticket.created.heading')}</h1>
        {ticket ? (
          <p className="text-3xl font-extrabold tracking-wide mt-3">{ticket.ticketId}</p>
        ) : (
          <p className="mt-3 text-text-muted">{t('offline.bannerDetail')}</p>
        )}
        <Link to="/staff" className="btn btn-primary mt-6">
          {t('nav.staffPortal')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('assisted.heading')}</h1>
      <p className="mt-2 text-text-muted">{t('assisted.description')}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="staff-name" className="block font-medium mb-1">
            {t('assisted.staffNameLabel')}
          </label>
          <input
            id="staff-name"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="w-full sm:w-80 rounded border px-3 py-2 min-h-touch"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
        </div>

        <div>
          <label htmlFor="assisted-student-id" className="block font-medium mb-1">
            {t('request.studentIdLabel')}
          </label>
          <input
            id="assisted-student-id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full sm:w-64 rounded border px-3 py-2 min-h-touch"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
        </div>

        <div>
          <label htmlFor="assisted-request" className="block font-medium mb-1">
            {t('request.heading')}
          </label>
          <textarea
            id="assisted-request"
            value={requestText}
            onChange={(e) => {
              setRequestText(e.target.value);
              setClassification(null);
            }}
            onBlur={classify}
            rows={4}
            className="w-full rounded border px-3 py-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
        </div>

        {!classification && requestText.trim().length >= 4 && (
          <button type="button" className="btn btn-secondary" onClick={classify}>
            {t('classification.heading')}
          </button>
        )}

        {classification && (
          <div className="card p-4 space-y-2">
            <p>
              <span className="text-text-muted text-sm mr-2">{t('classification.department')}</span>
              <span className="font-medium">{classification.department}</span>
            </p>
            <p>
              <span className="text-text-muted text-sm mr-2">{t('classification.category')}</span>
              <span className="font-medium">{t(`category.${classification.category}` as TranslationKey)}</span>
            </p>
            <p className="text-sm">{classification.reason}</p>
          </div>
        )}

        {classification && (
          <label className="card p-4 flex items-center gap-3 cursor-pointer min-h-touch">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-5 h-5 shrink-0" />
            <span className="font-medium">{t('privacy.consentCheckbox')}</span>
          </label>
        )}

        {classification && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!consent || !studentId.trim() || submitting}
            onClick={submit}
          >
            {submitting ? t('common.loading') : t('assisted.startRequest')}
          </button>
        )}
      </div>
    </div>
  );
}
