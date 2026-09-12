import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { json, parseBody, handleError, HttpError } from '../../shared/http';
import type { CreateTicketInput } from '../../../src/domain/tickets/Ticket';

const sqs = new SQSClient({});
const QUEUE_URL = process.env.SYNC_QUEUE_URL as string;

interface SyncRequestBody {
  items: CreateTicketInput[];
}

/**
 * Bulk drain path for a device that accumulated many offline requests (e.g. a
 * kiosk at a help desk). Each item is handed to SQS and this returns
 * immediately — the syncWorker Lambda (backend/functions/syncWorker) does the
 * actual createTicket calls, with SQS's retry + dead-letter queue giving this
 * real resilience against transient DynamoDB throttling instead of leaving a
 * whole batch stuck behind one slow item. A single device syncing its own
 * queue can just retry POST /tickets per item (see src/offline/sync.ts) —
 * this endpoint is for syncing many requests from one place at once.
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body = parseBody<SyncRequestBody>(event.body);
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new HttpError(400, 'items must be a non-empty array.');
    }

    await Promise.all(
      body.items.map((item) =>
        sqs.send(
          new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(item),
            MessageDeduplicationId: item.idempotencyKey,
            MessageGroupId: 'offline-sync',
          }),
        ),
      ),
    );

    return json(202, { accepted: body.items.length });
  } catch (error) {
    return handleError(error);
  }
}
