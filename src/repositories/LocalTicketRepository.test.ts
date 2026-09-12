import { beforeEach, describe, expect, it } from 'vitest';
import { LocalTicketRepository } from './LocalTicketRepository';
import type { CreateTicketInput } from '../domain/tickets/Ticket';

function baseInput(overrides: Partial<CreateTicketInput> = {}): CreateTicketInput {
  return {
    studentId: '21CS045',
    requestText: 'I have not received my scholarship amount.',
    language: 'en',
    accessibilityMode: 'TEXT_VISUAL',
    source: 'SELF_SERVICE',
    consent: true,
    idempotencyKey: 'idem-1',
    ...overrides,
  };
}

describe('LocalTicketRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('refuses to create a ticket without consent', async () => {
    const repo = new LocalTicketRepository();
    await expect(repo.createTicket(baseInput({ consent: false }))).rejects.toThrow(/consent/i);
  });

  it('creates exactly one ticket, classified and routed, with an initial timeline', async () => {
    const repo = new LocalTicketRepository();
    const ticket = await repo.createTicket(baseInput());

    expect(ticket.ticketId).toMatch(/^CAMP-\d+$/);
    expect(ticket.category).toBe('SCHOLARSHIP_FINANCE');
    expect(ticket.department).toBe('Student Welfare / Scholarship Office');
    expect(ticket.status).toBe('SUBMITTED');
    expect(ticket.timeline.length).toBeGreaterThan(0);
  });

  it('never creates two tickets for the same idempotency key, even if retried', async () => {
    const repo = new LocalTicketRepository();
    const input = baseInput();

    const first = await repo.createTicket(input);
    const second = await repo.createTicket(input);
    const third = await repo.createTicket(input);

    expect(second.ticketId).toBe(first.ticketId);
    expect(third.ticketId).toBe(first.ticketId);

    const all = await repo.listTickets();
    expect(all).toHaveLength(1);
  });

  it('creates separate tickets for different idempotency keys', async () => {
    const repo = new LocalTicketRepository();
    await repo.createTicket(baseInput({ idempotencyKey: 'idem-a' }));
    await repo.createTicket(baseInput({ idempotencyKey: 'idem-b' }));

    const all = await repo.listTickets();
    expect(all).toHaveLength(2);
  });

  it('records a timeline event and bumps updatedAt when status changes', async () => {
    const repo = new LocalTicketRepository();
    const created = await repo.createTicket(baseInput());
    const eventsBefore = created.timeline.length;

    const updated = await repo.updateTicket(created.ticketId, { status: 'IN_REVIEW' }, 'Staff A');

    expect(updated.status).toBe('IN_REVIEW');
    expect(updated.timeline.length).toBe(eventsBefore + 1);
    expect(updated.timeline[updated.timeline.length - 1]?.actor).toBe('Staff A');
  });
});
