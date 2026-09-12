import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { json, handleError } from '../../shared/http';
import { listTickets } from '../../shared/dynamoTicketStore';

export async function handler(_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const tickets = await listTickets({});
    const resolved = tickets.filter((t) => t.status === 'RESOLVED');
    const avgResolutionHours = resolved.length
      ? resolved.reduce((sum, t) => sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 3_600_000, 0) /
        resolved.length
      : null;

    return json(200, {
      isPrototypeMetric: true,
      totalRequests: tickets.length,
      resolved: resolved.length,
      averageResponseHours: avgResolutionHours,
      offlineRequests: tickets.filter((t) => t.source === 'SELF_SERVICE' && t.accessibilityMode !== 'ASSISTED').length,
      assistedRequests: tickets.filter((t) => t.source === 'ASSISTED').length,
    });
  } catch (error) {
    return handleError(error);
  }
}
