import type { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from 'aws-lambda';
import { createTicket } from '../../shared/dynamoTicketStore';
import type { CreateTicketInput } from '../../../src/domain/tickets/Ticket';

/**
 * Drains backend/functions/syncOfflineQueue's SQS queue. Uses partial-batch
 * failure reporting so one bad item (malformed payload, a transient
 * DynamoDB throttle) doesn't force SQS to redeliver the whole batch —
 * only the failed message goes back on the queue (and eventually to the
 * dead-letter queue after the configured retry count).
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      const input = JSON.parse(record.body) as CreateTicketInput;
      await createTicket(input);
    } catch (error) {
      console.error('Failed to sync offline-queued ticket', { messageId: record.messageId, error });
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
