import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, handleError, HttpError } from '../../shared/http';
import { getTicket } from '../../shared/dynamoTicketStore';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new HttpError(400, 'ticketId path parameter is required.');

    const ticket = await getTicket(ticketId);
    if (!ticket) throw new HttpError(404, `Ticket ${ticketId} not found.`);

    return json(200, ticket);
  } catch (error) {
    return handleError(error);
  }
}
