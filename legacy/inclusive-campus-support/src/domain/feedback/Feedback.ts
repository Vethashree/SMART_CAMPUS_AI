export interface FeedbackInput {
  ticketId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  firstContactResolution: boolean;
}
