import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, parseBody, handleError, HttpError } from '../../shared/http';
import { addTimelineEvent } from '../../shared/dynamoTicketStore';
import type { TicketTimelineEvent } from '../../../src/domain/tickets/Ticket';

type TimelineEventInput = Omit<TicketTimelineEvent, 'id' | 'createdAt'>;

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new HttpError(400, 'ticketId path parameter is required.');

    const body = parseBody<TimelineEventInput>(event.body);
    const ticket = await addTimelineEvent(ticketId, body);
    return json(200, ticket);
  } catch (error) {
    return handleError(error);
  }
}
