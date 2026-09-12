import type { CreateTicketInput, Ticket, TicketStatus, TicketTimelineEvent } from '../domain/tickets/Ticket';
import type { FeedbackInput } from '../domain/feedback/Feedback';

export interface UpdateTicketInput {
  status?: TicketStatus;
  assignedStaff?: string;
}

export interface TicketRepository {
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket | null>;
  listTickets(filter?: { studentId?: string; department?: string }): Promise<Ticket[]>;
  updateTicket(ticketId: string, input: UpdateTicketInput, actor?: string): Promise<Ticket>;
  addTimelineEvent(ticketId: string, event: Omit<TicketTimelineEvent, 'id' | 'createdAt'>): Promise<Ticket>;
  submitFeedback(input: FeedbackInput): Promise<Ticket>;
}
