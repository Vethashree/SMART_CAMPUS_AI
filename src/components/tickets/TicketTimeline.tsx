import type { TicketTimelineEvent } from '../../domain/tickets/Ticket';
import { usePreferences } from '../../app/providers/PreferencesProvider';
import type { TranslationKey } from '../../i18n/en';

export default function TicketTimeline({ events }: { events: TicketTimelineEvent[] }) {
  const { t, language } = usePreferences();

  return (
    <ol className="mt-3 space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: 'var(--color-accent)' }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-text-muted">
              {new Date(event.createdAt).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <p className="font-medium">{t(event.labelKey as TranslationKey, event.labelParams)}</p>
            {event.actor && <p className="text-sm text-text-muted">{event.actor}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
