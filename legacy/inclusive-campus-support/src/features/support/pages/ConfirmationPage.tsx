import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useSupportRequest } from '../SupportRequestContext';

export default function ConfirmationPage() {
  const { t } = usePreferences();
  const { createdTicket, queuedOffline, reset } = useSupportRequest();
  const navigate = useNavigate();

  useEffect(() => {
    if (!createdTicket && !queuedOffline) {
      navigate('/support/request', { replace: true });
      return;
    }
    if (createdTicket) {
      localStorage.setItem('ics.lastTicketId', createdTicket.ticketId);
    }
  }, [createdTicket, queuedOffline, navigate]);

  if (!createdTicket && !queuedOffline) return null;

  return (
    <div className="max-w-lg mx-auto text-center">
      {createdTicket ? (
        <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: 'var(--color-success)' }} aria-hidden="true" />
      ) : (
        <Clock className="w-14 h-14 mx-auto" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
      )}

      <h1 className="text-2xl font-bold mt-4">
        {createdTicket ? t('ticket.created.heading') : t('offline.banner')}
      </h1>

      {createdTicket ? (
        <>
          <p className="mt-4 text-sm text-text-muted">{t('ticket.created.idLabel')}</p>
          <p className="text-3xl font-extrabold tracking-wide mt-1">{createdTicket.ticketId}</p>
          <p className="mt-4 text-sm text-text-muted">{t('ticket.created.saveNote')}</p>
        </>
      ) : (
        <p className="mt-4 text-text-muted">{t('offline.bannerDetail')}</p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {createdTicket && (
          <Link
            to={`/track/${createdTicket.ticketId}`}
            className="btn btn-primary"
            onClick={() => reset()}
          >
            {t('ticket.viewTracking')}
          </Link>
        )}
        <Link to="/" className="btn btn-secondary" onClick={() => reset()}>
          {t('ticket.backToHome')}
        </Link>
      </div>
    </div>
  );
}
