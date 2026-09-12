import type { CreateTicketInput } from '../tickets/Ticket';

export type OfflineQueueStatus = 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface OfflineQueueItem {
  clientRequestId: string;
  payload: CreateTicketInput;
  createdAt: string;
  retryCount: number;
  status: OfflineQueueStatus;
  lastError?: string;
  syncedTicketId?: string;
}
