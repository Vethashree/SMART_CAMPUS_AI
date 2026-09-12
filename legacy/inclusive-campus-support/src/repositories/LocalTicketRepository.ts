import type { TicketRepository, UpdateTicketInput } from './TicketRepository';
import type { CreateTicketInput, Ticket, TicketTimelineEvent } from '../domain/tickets/Ticket';
import { formatTicketId } from '../domain/tickets/Ticket';
import type { FeedbackInput } from '../domain/feedback/Feedback';
import { classifyRequest } from '../domain/classification/classify';

const TICKETS_KEY = 'ics.tickets.v1';
const SEQUENCE_KEY = 'ics.ticketSequence.v1';
const IDEMPOTENCY_KEY = 'ics.idempotency.v1';

interface Store {
  tickets: Record<string, Ticket>;
  idempotency: Record<string, string>;
}

function loadStore(): Store {
  try {
    const tickets = JSON.parse(localStorage.getItem(TICKETS_KEY) ?? '{}');
    const idempotency = JSON.parse(localStorage.getItem(IDEMPOTENCY_KEY) ?? '{}');
    return { tickets, idempotency };
  } catch {
    return { tickets: {}, idempotency: {} };
  }
}

function saveTickets(tickets: Record<string, Ticket>) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function saveIdempotency(idempotency: Record<string, string>) {
  localStorage.setItem(IDEMPOTENCY_KEY, JSON.stringify(idempotency));
}

function nextSequence(): number {
  const current = Number(localStorage.getItem(SEQUENCE_KEY) ?? '4800');
  const next = current + 1;
  localStorage.setItem(SEQUENCE_KEY, String(next));
  return next;
}

function makeEvent(
  status: Ticket['status'],
  labelKey: string,
  labelParams?: Record<string, string>,
  actor?: string,
): TicketTimelineEvent {
  return {
    id: crypto.randomUUID(),
    status,
    labelKey,
    labelParams,
    actor,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Demo/dev-fallback persistence backed by localStorage. Implements the same
 * TicketRepository contract as AwsTicketRepository so the UI never depends on
 * which persistence mechanism is active.
 */
export class LocalTicketRepository implements TicketRepository {
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    if (!input.consent) {
      throw new Error('Consent is required before a ticket can be created.');
    }

    const store = loadStore();

    const existingTicketId = store.idempotency[input.idempotencyKey];
    if (existingTicketId && store.tickets[existingTicketId]) {
      return store.tickets[existingTicketId];
    }

    const classification = classifyRequest(input.requestText);
    const ticketId = formatTicketId(nextSequence());
    const now = new Date().toISOString();

    const ticket: Ticket = {
      ticketId,
      studentId: input.studentId,
      requestText: input.requestText,
      language: input.language,
      category: classification.category,
      department: classification.department,
      priority: classification.priority,
      status: 'SUBMITTED',
      source: input.source,
      accessibilityMode: input.accessibilityMode,
      consent: input.consent,
      requiredInformation: classification.requiredInformation,
      estimatedResponseTime: classification.estimatedResponseTime,
      reason: classification.reason,
      timeline: [
        makeEvent('SUBMITTED', 'timeline.submitted'),
        makeEvent('SUBMITTED', 'timeline.departmentReceived', { department: classification.department }),
      ],
      createdAt: now,
      updatedAt: now,
      idempotencyKey: input.idempotencyKey,
      assignedStaff: input.assistedByStaff,
    };

    store.tickets[ticketId] = ticket;
    store.idempotency[input.idempotencyKey] = ticketId;
    saveTickets(store.tickets);
    saveIdempotency(store.idempotency);

    return ticket;
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    const store = loadStore();
    return store.tickets[ticketId] ?? null;
  }

  async listTickets(filter?: { studentId?: string; department?: string }): Promise<Ticket[]> {
    const store = loadStore();
    let tickets = Object.values(store.tickets);
    if (filter?.studentId) tickets = tickets.filter((t) => t.studentId === filter.studentId);
    if (filter?.department) tickets = tickets.filter((t) => t.department === filter.department);
    return tickets.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async updateTicket(ticketId: string, input: UpdateTicketInput, actor?: string): Promise<Ticket> {
    const store = loadStore();
    const ticket = store.tickets[ticketId];
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    if (input.status && input.status !== ticket.status) {
      ticket.status = input.status;
      const labelKey =
        input.status === 'IN_REVIEW'
          ? 'timeline.inReview'
          : input.status === 'ACTION_TAKEN'
            ? 'timeline.actionTaken'
            : input.status === 'RESOLVED'
              ? 'timeline.resolved'
              : 'timeline.submitted';
      ticket.timeline.push(makeEvent(input.status, labelKey, undefined, actor));
    }

    if (input.assignedStaff && input.assignedStaff !== ticket.assignedStaff) {
      ticket.assignedStaff = input.assignedStaff;
      ticket.timeline.push(makeEvent(ticket.status, 'timeline.assigned', { staff: input.assignedStaff }, actor));
    }

    ticket.updatedAt = new Date().toISOString();
    store.tickets[ticketId] = ticket;
    saveTickets(store.tickets);
    return ticket;
  }

  async addTimelineEvent(
    ticketId: string,
    event: Omit<TicketTimelineEvent, 'id' | 'createdAt'>,
  ): Promise<Ticket> {
    const store = loadStore();
    const ticket = store.tickets[ticketId];
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    ticket.timeline.push({ ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    ticket.updatedAt = new Date().toISOString();
    store.tickets[ticketId] = ticket;
    saveTickets(store.tickets);
    return ticket;
  }

  async submitFeedback(input: FeedbackInput): Promise<Ticket> {
    const store = loadStore();
    const ticket = store.tickets[input.ticketId];
    if (!ticket) throw new Error(`Ticket ${input.ticketId} not found`);

    ticket.feedback = {
      rating: input.rating,
      comment: input.comment,
      firstContactResolution: input.firstContactResolution,
      submittedAt: new Date().toISOString(),
    };
    ticket.updatedAt = new Date().toISOString();
    store.tickets[input.ticketId] = ticket;
    saveTickets(store.tickets);
    return ticket;
  }
}
