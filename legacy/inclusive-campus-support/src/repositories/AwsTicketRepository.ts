import type { TicketRepository, UpdateTicketInput } from './TicketRepository';
import type { CreateTicketInput, Ticket, TicketTimelineEvent } from '../domain/tickets/Ticket';
import type { FeedbackInput } from '../domain/feedback/Feedback';
import { apiRequest } from '../lib/api';

/**
 * Production persistence path: API Gateway -> Lambda -> DynamoDB (see infra/ and backend/).
 * Mirrors LocalTicketRepository's contract exactly so the UI is indifferent to which is active.
 */
export class AwsTicketRepository implements TicketRepository {
  createTicket(input: CreateTicketInput): Promise<Ticket> {
    return apiRequest<Ticket>('/tickets', {
      method: 'POST',
      headers: { 'Idempotency-Key': input.idempotencyKey },
      body: JSON.stringify(input),
    });
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    try {
      return await apiRequest<Ticket>(`/tickets/${encodeURIComponent(ticketId)}`);
    } catch (error) {
      if ((error as { status?: number }).status === 404) return null;
      throw error;
    }
  }

  listTickets(filter?: { studentId?: string; department?: string }): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filter?.studentId) params.set('studentId', filter.studentId);
    if (filter?.department) params.set('department', filter.department);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Ticket[]>(`/tickets${query}`);
  }

  updateTicket(ticketId: string, input: UpdateTicketInput, actor?: string): Promise<Ticket> {
    return apiRequest<Ticket>(`/tickets/${encodeURIComponent(ticketId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...input, actor }),
    });
  }

  addTimelineEvent(
    ticketId: string,
    event: Omit<TicketTimelineEvent, 'id' | 'createdAt'>,
  ): Promise<Ticket> {
    return apiRequest<Ticket>(`/tickets/${encodeURIComponent(ticketId)}/timeline`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  submitFeedback(input: FeedbackInput): Promise<Ticket> {
    return apiRequest<Ticket>(`/tickets/${encodeURIComponent(input.ticketId)}/feedback`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}
