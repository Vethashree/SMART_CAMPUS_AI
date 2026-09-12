import { CircleDot, Search, Hammer, CheckCircle2 } from 'lucide-react';
import type { TicketStatus } from '../../domain/tickets/Ticket';
import { usePreferences } from '../../app/providers/PreferencesProvider';
import type { TranslationKey } from '../../i18n/en';

const ICONS: Record<TicketStatus, typeof CircleDot> = {
  SUBMITTED: CircleDot,
  IN_REVIEW: Search,
  ACTION_TAKEN: Hammer,
  RESOLVED: CheckCircle2,
};

export default function StatusPill({ status }: { status: TicketStatus }) {
  const { t } = usePreferences();
  const Icon = ICONS[status];
  return (
    <span className="status-badge">
      <Icon className="w-4 h-4" aria-hidden="true" />
      {t(`ticket.status.${status}` as TranslationKey)}
    </span>
  );
}
