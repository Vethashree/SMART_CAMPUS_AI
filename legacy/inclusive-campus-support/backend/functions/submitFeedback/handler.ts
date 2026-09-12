import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, parseBody, handleError, HttpError } from '../../shared/http';
import { submitFeedback } from '../../shared/dynamoTicketStore';
import type { FeedbackInput } from '../../../src/domain/feedback/Feedback';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new HttpError(400, 'ticketId path parameter is required.');

    const body = parseBody<Omit<FeedbackInput, 'ticketId'>>(event.body);
    const ticket = await submitFeedback({ ...body, ticketId });
    return json(200, ticket);
  } catch (error) {
    return handleError(error);
  }
}
