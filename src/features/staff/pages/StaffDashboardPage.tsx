import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { ticketRepository } from '../../../repositories';
import type { Ticket, TicketStatus } from '../../../domain/tickets/Ticket';
import StatusPill from '../../../components/tickets/StatusPill';
import type { TranslationKey } from '../../../i18n/en';

const STATUS_FLOW: TicketStatus[] = ['SUBMITTED', 'IN_REVIEW', 'ACTION_TAKEN', 'RESOLVED'];

function nextStatus(status: TicketStatus): TicketStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  return index >= 0 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null;
}

export default function StaffDashboardPage() {
  const { t } = usePreferences();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [staffName, setStaffName] = useState('Staff');

  const load = () => {
    ticketRepository.listTickets().then(setTickets);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  const departments = useMemo(() => Array.from(new Set(tickets.map((tk) => tk.department))), [tickets]);
  const visible = departmentFilter ? tickets.filter((tk) => tk.department === departmentFilter) : tickets;

  const advanceStatus = async (ticket: Ticket) => {
    const next = nextStatus(ticket.status);
    if (!next) return;
    await ticketRepository.updateTicket(ticket.ticketId, { status: next }, staffName);
    load();
  };

  const assignToMe = async (ticket: Ticket) => {
    await ticketRepository.updateTicket(ticket.ticketId, { assignedStaff: staffName }, staffName);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('staff.heading')}</h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0">
            <label htmlFor="staff-name-input" className="block text-xs text-text-muted mb-1">
              {t('assisted.staffNameLabel')}
            </label>
            <input
              id="staff-name-input"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full max-w-[10rem] rounded border px-2 py-1.5 min-h-touch"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="dept-filter" className="block text-xs text-text-muted mb-1">
              {t('staff.filterAll')}
            </label>
            <select
              id="dept-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full max-w-[12rem] rounded border px-2 py-1.5 min-h-touch"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            >
              <option value="">{t('staff.filterAll')}</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Th>{t('staff.column.ticket')}</Th>
              <Th>{t('staff.column.issue')}</Th>
              <Th>{t('staff.column.category')}</Th>
              <Th>{t('staff.column.department')}</Th>
              <Th>{t('staff.column.priority')}</Th>
              <Th>{t('staff.column.status')}</Th>
              <Th>{t('staff.column.assigned')}</Th>
              <Th> </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket) => (
              <tr key={ticket.ticketId} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <Td className="font-semibold">{ticket.ticketId}</Td>
                <Td className="max-w-[16rem] truncate" title={ticket.requestText}>
                  {ticket.requestText}
                </Td>
                <Td>{t(`category.${ticket.category}` as TranslationKey)}</Td>
                <Td>{ticket.department}</Td>
                <Td>{t(`priority.${ticket.priority}` as TranslationKey)}</Td>
                <Td>
                  <StatusPill status={ticket.status} />
                </Td>
                <Td>{ticket.assignedStaff ?? '—'}</Td>
                <Td>
                  <div className="flex gap-2">
                    {!ticket.assignedStaff && (
                      <button type="button" className="btn btn-secondary text-xs px-2 py-1 min-h-0" onClick={() => assignToMe(ticket)}>
                        {t('staff.action.assign')}
                      </button>
                    )}
                    {nextStatus(ticket.status) && (
                      <button type="button" className="btn btn-primary text-xs px-2 py-1 min-h-0" onClick={() => advanceStatus(ticket)}>
                        {ticket.status === 'ACTION_TAKEN' ? t('staff.action.resolve') : t('staff.action.updateStatus')}
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <Td colSpan={8} className="text-center text-text-muted py-8">
                  {t('errors.notFound')}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="py-2 pr-4 font-semibold">{children}</th>;
}

function Td({
  children,
  className = '',
  colSpan,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  title?: string;
}) {
  return (
    <td className={`py-2 pr-4 align-top ${className}`} colSpan={colSpan} title={title}>
      {children}
    </td>
  );
}
