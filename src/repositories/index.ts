import type { TicketRepository } from './TicketRepository';
import { LocalTicketRepository } from './LocalTicketRepository';
import { AwsTicketRepository } from './AwsTicketRepository';
import { API_BASE_URL } from '../lib/api';

export type { TicketRepository };
export { LocalTicketRepository, AwsTicketRepository };

export const ticketRepository: TicketRepository = API_BASE_URL
  ? new AwsTicketRepository()
  : new LocalTicketRepository();
