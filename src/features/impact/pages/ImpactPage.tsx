import { useEffect, useState } from 'react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { ticketRepository } from '../../../repositories';
import type { Ticket } from '../../../domain/tickets/Ticket';

function averageResolutionHours(tickets: Ticket[]): string {
  const resolved = tickets.filter((t) => t.status === 'RESOLVED');
  if (resolved.length === 0) return '—';
  const totalHours = resolved.reduce((sum, t) => {
    const created = new Date(t.createdAt).getTime();
    const updated = new Date(t.updatedAt).getTime();
    return sum + (updated - created) / 3_600_000;
  }, 0);
  return `${(totalHours / resolved.length).toFixed(1)}h`;
}

export default function ImpactPage() {
  const { t } = usePreferences();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    ticketRepository.listTickets().then(setTickets);
  }, []);

  const resolved = tickets.filter((tk) => tk.status === 'RESOLVED').length;
  const offline = tickets.filter((tk) => tk.source === 'SELF_SERVICE' && tk.accessibilityMode !== 'ASSISTED').length;
  const assisted = tickets.filter((tk) => tk.source === 'ASSISTED').length;

  const metrics = [
    { labelKey: 'impact.totalRequests', value: tickets.length },
    { labelKey: 'impact.resolved', value: resolved },
    { labelKey: 'impact.avgResponse', value: averageResolutionHours(tickets) },
    { labelKey: 'impact.assistedRequests', value: assisted },
    { labelKey: 'impact.offlineRequests', value: offline },
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('impact.heading')}</h1>
      <p className="mt-2 text-sm text-text-muted">{t('impact.disclaimer')}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.labelKey} className="card p-5">
            <p className="text-sm text-text-muted">{t(metric.labelKey)}</p>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
