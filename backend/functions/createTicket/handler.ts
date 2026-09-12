import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, parseBody, handleError, HttpError } from '../../shared/http';
import { createTicket } from '../../shared/dynamoTicketStore';
import type { CreateTicketInput } from '../../../src/domain/tickets/Ticket';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const input = parseBody<CreateTicketInput>(event.body);
    const idempotencyKey = event.headers?.['idempotency-key'] ?? input.idempotencyKey;
    if (!idempotencyKey) throw new HttpError(400, 'An Idempotency-Key is required.');

    const ticket = await createTicket({ ...input, idempotencyKey });
    return json(201, ticket);
  } catch (error) {
    return handleError(error);
  }
}
