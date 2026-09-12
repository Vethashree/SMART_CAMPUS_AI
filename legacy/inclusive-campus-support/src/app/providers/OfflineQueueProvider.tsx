import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { OfflineQueueItem } from '../../domain/offline/OfflineQueueItem';
import type { CreateTicketInput, Ticket } from '../../domain/tickets/Ticket';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import { ticketRepository } from '../../repositories';
import { enqueueRequest, listQueuedRequests, clearOfflineQueue } from '../../offline/queue';
import { syncOfflineQueue } from '../../offline/sync';

interface OfflineQueueContextValue {
  isOnline: boolean;
  pending: OfflineQueueItem[];
  refreshPending: () => Promise<void>;
  submitOrQueue: (input: CreateTicketInput) => Promise<{ ticket: Ticket | null; queued: boolean }>;
  clearPending: () => Promise<void>;
}

const OfflineQueueContext = createContext<OfflineQueueContextValue | undefined>(undefined);

export function OfflineQueueProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  const [pending, setPending] = useState<OfflineQueueItem[]>([]);

  const refreshPending = useCallback(async () => {
    try {
      const items = await listQueuedRequests();
      setPending(items);
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  useEffect(() => {
    if (!isOnline) return;
    (async () => {
      await syncOfflineQueue(ticketRepository);
      await refreshPending();
    })();
  }, [isOnline, refreshPending]);

  const submitOrQueue = useCallback(
    async (input: CreateTicketInput): Promise<{ ticket: Ticket | null; queued: boolean }> => {
      if (isOnline) {
        try {
          const ticket = await ticketRepository.createTicket(input);
          return { ticket, queued: false };
        } catch {
          await enqueueRequest(input);
          await refreshPending();
          return { ticket: null, queued: true };
        }
      }
      await enqueueRequest(input);
      await refreshPending();
      return { ticket: null, queued: true };
    },
    [isOnline, refreshPending],
  );

  const clearPending = useCallback(async () => {
    await clearOfflineQueue();
    await refreshPending();
  }, [refreshPending]);

  const value = useMemo(
    () => ({ isOnline, pending, refreshPending, submitOrQueue, clearPending }),
    [isOnline, pending, refreshPending, submitOrQueue, clearPending],
  );

  return <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>;
}

export function useOfflineQueue(): OfflineQueueContextValue {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error('useOfflineQueue must be used within an OfflineQueueProvider');
  return ctx;
}
