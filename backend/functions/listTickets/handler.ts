import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, handleError } from '../../shared/http';
import { listTickets } from '../../shared/dynamoTicketStore';

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const studentId = event.queryStringParameters?.studentId;
    const department = event.queryStringParameters?.department;
    const tickets = await listTickets({ studentId, department });
    return json(200, tickets);
  } catch (error) {
    return handleError(error);
  }
}
