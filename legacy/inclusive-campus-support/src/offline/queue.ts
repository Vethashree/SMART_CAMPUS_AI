import type { CreateTicketInput } from '../domain/tickets/Ticket';
import type { OfflineQueueItem } from '../domain/offline/OfflineQueueItem';
import { putQueueItem, getAllQueueItems, deleteQueueItem, clearQueue } from './db';

export async function enqueueRequest(payload: CreateTicketInput): Promise<OfflineQueueItem> {
  const item: OfflineQueueItem = {
    clientRequestId: payload.idempotencyKey,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'QUEUED',
  };
  await putQueueItem(item);
  return item;
}

export function listQueuedRequests(): Promise<OfflineQueueItem[]> {
  return getAllQueueItems();
}

export function removeFromQueue(clientRequestId: string): Promise<void> {
  return deleteQueueItem(clientRequestId);
}

export function clearOfflineQueue(): Promise<void> {
  return clearQueue();
}
