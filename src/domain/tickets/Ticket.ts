import type { RequestCategory } from '../classification/RequestClassification';
import type { AccessMode, Language } from '../accessibility/AccessibilityPreferences';

export type TicketStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ACTION_TAKEN'
  | 'RESOLVED';

export type TicketSource = 'SELF_SERVICE' | 'ASSISTED';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface TicketTimelineEvent {
  id: string;
  status: TicketStatus;
  /** Translation key (see src/i18n) rather than display text, so the timeline renders in the viewer's language. */
  labelKey: string;
  labelParams?: Record<string, string>;
  actor?: string;
  createdAt: string;
}

export interface TicketFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  firstContactResolution: boolean;
  submittedAt: string;
}

export interface Ticket {
  ticketId: string;
  studentId: string;
  requestText: string;
  language: Language;
  category: RequestCategory;
  department: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  accessibilityMode: AccessMode;
  consent: boolean;
  assignedStaff?: string;
  requiredInformation: string[];
  estimatedResponseTime: string;
  reason: string;
  timeline: TicketTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  feedback?: TicketFeedback;
  idempotencyKey: string;
}

export interface CreateTicketInput {
  studentId: string;
  requestText: string;
  language: Language;
  accessibilityMode: AccessMode;
  source: TicketSource;
  consent: boolean;
  idempotencyKey: string;
  assistedByStaff?: string;
}

export const TICKET_ID_PREFIX = 'CAMP-';

export function formatTicketId(sequence: number): string {
  return `${TICKET_ID_PREFIX}${sequence}`;
}
