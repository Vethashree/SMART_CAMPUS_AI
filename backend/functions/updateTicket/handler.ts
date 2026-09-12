import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, parseBody, handleError, HttpError } from '../../shared/http';
import { updateTicket } from '../../shared/dynamoTicketStore';
import type { TicketStatus } from '../../../src/domain/tickets/Ticket';

interface UpdateTicketBody {
  status?: TicketStatus;
  assignedStaff?: string;
  actor?: string;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new HttpError(400, 'ticketId path parameter is required.');

    const body = parseBody<UpdateTicketBody>(event.body);
    // Authorization for who may update a ticket (staff vs. the owning student)
    // belongs in Cognito-backed middleware — see infra/lib/auth-stack.ts and
    // README.md "Authentication" section for how that plugs into this handler.
    const ticket = await updateTicket(ticketId, { status: body.status, assignedStaff: body.assignedStaff }, body.actor);
    return json(200, ticket);
  } catch (error) {
    return handleError(error);
  }
}
