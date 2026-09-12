import type { TicketRepository } from '../repositories/TicketRepository';
import { putQueueItem, getAllQueueItems, deleteQueueItem } from './db';

export interface SyncResult {
  synced: number;
  failed: number;
}

/**
 * Drains the offline queue against the given repository. Each item's
 * clientRequestId doubles as the createTicket idempotencyKey, so a retried
 * sync (e.g. after a dropped connection mid-request) can never create two
 * tickets for the same queued item.
 */
export async function syncOfflineQueue(repository: TicketRepository): Promise<SyncResult> {
  const items = await getAllQueueItems();
  const pending = items.filter((item) => item.status === 'QUEUED' || item.status === 'FAILED');

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    await putQueueItem({ ...item, status: 'SYNCING' });
    try {
      await repository.createTicket(item.payload);
      await deleteQueueItem(item.clientRequestId);
      synced += 1;
    } catch (error) {
      await putQueueItem({
        ...item,
        status: 'FAILED',
        retryCount: item.retryCount + 1,
        lastError: error instanceof Error ? error.message : 'Unknown sync error',
      });
      failed += 1;
    }
  }

  return { synced, failed };
}
