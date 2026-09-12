import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { ticketRepository } from '../../../repositories';
import type { Ticket } from '../../../domain/tickets/Ticket';
import StatusPill from '../../../components/tickets/StatusPill';
import TicketTimeline from '../../../components/tickets/TicketTimeline';
import FeedbackForm from '../components/FeedbackForm';

export default function TicketDetailPage() {
  const { ticketId = '' } = useParams();
  const { t, language } = usePreferences();
  const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setTicket(undefined);
    ticketRepository.getTicket(ticketId).then((result) => {
      if (!cancelled) setTicket(result);
    });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  if (ticket === undefined) {
    return <p className="text-center text-text-muted py-12">{t('common.loading')}</p>;
  }

  if (ticket === null) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <p role="alert">{t('tracking.notFound')}</p>
        <Link to="/track" className="btn btn-secondary mt-4">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{ticket.ticketId}</h1>
        <StatusPill status={ticket.status} />
      </div>
      <p className="mt-2 text-text-muted">{ticket.requestText}</p>

      <dl className="card p-5 mt-6 divide-y" style={{ borderColor: 'var(--color-border)' }}>
        <Row label={t('tracking.department')} value={ticket.department} />
        <Row label={t('tracking.expectedResponse')} value={ticket.estimatedResponseTime} />
        <Row
          label={t('tracking.lastUpdated')}
          value={new Date(ticket.updatedAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        />
        <Row label={t('tracking.language')} value={ticket.language === 'ta' ? t('language.tamil') : t('language.english')} />
      </dl>

      <h2 className="font-semibold mt-8">{t('tracking.timeline')}</h2>
      <TicketTimeline events={ticket.timeline} />

      {ticket.status === 'RESOLVED' && (
        <div className="mt-8">
          <h2 className="font-semibold">{t('tracking.feedbackHeading')}</h2>
          <FeedbackForm ticket={ticket} onSubmitted={setTicket} />
        </div>
      )}
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
