import { beforeEach, describe, expect, it } from 'vitest';
import { syncOfflineQueue } from './sync';
import { enqueueRequest, listQueuedRequests } from './queue';
import { LocalTicketRepository } from '../repositories/LocalTicketRepository';
import type { CreateTicketInput } from '../domain/tickets/Ticket';

const payload: CreateTicketInput = {
  studentId: '21CS045',
  requestText: 'I have not received my scholarship amount.',
  language: 'en',
  accessibilityMode: 'TEXT_VISUAL',
  source: 'SELF_SERVICE',
  consent: true,
  idempotencyKey: 'offline-idem-1',
};

describe('offline queue -> sync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('drains a queued request into exactly one ticket', async () => {
    const repo = new LocalTicketRepository();
    await enqueueRequest(payload);

    const result = await syncOfflineQueue(repo);

    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);

    const remaining = await listQueuedRequests();
    expect(remaining).toHaveLength(0);

    const tickets = await repo.listTickets();
    expect(tickets).toHaveLength(1);
  });

  it('never creates a second ticket if a sync retries after a partial failure', async () => {
    const repo = new LocalTicketRepository();

    // Simulates a sync that created the ticket but crashed before removing the
    // queue item, so a retry replays createTicket with the same idempotencyKey.
    const first = await repo.createTicket(payload);
    const second = await repo.createTicket(payload);

    expect(second.ticketId).toBe(first.ticketId);
    expect(await repo.listTickets()).toHaveLength(1);
  });
});
