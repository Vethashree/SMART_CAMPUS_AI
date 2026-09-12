import { DynamoDBClient, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  TransactWriteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
  CreateTicketInput,
  Ticket,
  TicketTimelineEvent,
} from '../../src/domain/tickets/Ticket';
import { formatTicketId } from '../../src/domain/tickets/Ticket';
import { classifyRequest } from '../../src/domain/classification/classify';
import type { FeedbackInput } from '../../src/domain/feedback/Feedback';
import { HttpError } from './http';

const TABLE_NAME = process.env.TICKETS_TABLE_NAME as string;

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

function ticketKey(ticketId: string) {
  return { PK: `TICKET#${ticketId}` };
}

function idempotencyKey(key: string) {
  return { PK: `IDEMP#${key}` };
}

function toItem(ticket: Ticket) {
  return {
    ...ticketKey(ticket.ticketId),
    entityType: 'TICKET',
    GSI1PK: `STUDENT#${ticket.studentId}`,
    GSI1SK: `CREATED#${ticket.createdAt}`,
    GSI2PK: `DEPARTMENT#${ticket.department}`,
    GSI2SK: `STATUS#${ticket.status}#${ticket.createdAt}`,
    ...ticket,
  };
}

function fromItem(item: Record<string, unknown>): Ticket {
  const {
    PK: _PK,
    entityType: _entityType,
    GSI1PK: _GSI1PK,
    GSI1SK: _GSI1SK,
    GSI2PK: _GSI2PK,
    GSI2SK: _GSI2SK,
    ...ticket
  } = item;
  return ticket as unknown as Ticket;
}

async function nextTicketSequence(): Promise<number> {
  const result = await client.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: 'COUNTER#TICKET' },
      UpdateExpression: 'ADD seq :one',
      ExpressionAttributeValues: { ':one': 1 },
      ReturnValues: 'UPDATED_NEW',
    }),
  );
  return Number(result.Attributes?.seq ?? 1);
}

function makeEvent(status: Ticket['status'], labelKey: string, labelParams?: Record<string, string>, actor?: string): TicketTimelineEvent {
  return {
    id: crypto.randomUUID(),
    status,
    labelKey,
    labelParams,
    actor,
    createdAt: new Date().toISOString(),
  };
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  if (!input.consent) {
    throw new HttpError(422, 'Consent is required before a ticket can be created.');
  }
  if (!input.studentId?.trim() || !input.requestText?.trim()) {
    throw new HttpError(400, 'studentId and requestText are required.');
  }

  const classification = classifyRequest(input.requestText);
  const sequence = await nextTicketSequence();
  const ticketId = formatTicketId(sequence);
  const now = new Date().toISOString();

  const ticket: Ticket = {
    ticketId,
    studentId: input.studentId,
    requestText: input.requestText,
    language: input.language,
    category: classification.category,
    department: classification.department,
    priority: classification.priority,
    status: 'SUBMITTED',
    source: input.source,
    accessibilityMode: input.accessibilityMode,
    consent: input.consent,
    requiredInformation: classification.requiredInformation,
    estimatedResponseTime: classification.estimatedResponseTime,
    reason: classification.reason,
    timeline: [
      makeEvent('SUBMITTED', 'timeline.submitted'),
      makeEvent('SUBMITTED', 'timeline.departmentReceived', { department: classification.department }),
    ],
    createdAt: now,
    updatedAt: now,
    idempotencyKey: input.idempotencyKey,
    assignedStaff: input.assistedByStaff,
  };

  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              Item: { ...idempotencyKey(input.idempotencyKey), entityType: 'IDEMPOTENCY', ticketId },
              ConditionExpression: 'attribute_not_exists(PK)',
            },
          },
          {
            Put: {
              TableName: TABLE_NAME,
              Item: toItem(ticket),
              ConditionExpression: 'attribute_not_exists(PK)',
            },
          },
        ],
      }),
    );
    return ticket;
  } catch (error) {
    if (error instanceof TransactionCanceledException) {
      // Someone already used this idempotency key — this is a retried request
      // (offline sync, a dropped connection, a double click), not a new ticket.
      const existing = await client.send(new GetCommand({ TableName: TABLE_NAME, Key: idempotencyKey(input.idempotencyKey) }));
      const existingTicketId = existing.Item?.ticketId as string | undefined;
      if (existingTicketId) {
        const ticketResult = await getTicket(existingTicketId);
        if (ticketResult) return ticketResult;
      }
    }
    throw error;
  }
}

export async function getTicket(ticketId: string): Promise<Ticket | null> {
  const result = await client.send(new GetCommand({ TableName: TABLE_NAME, Key: ticketKey(ticketId) }));
  return result.Item ? fromItem(result.Item) : null;
}

export async function listTickets(filter: { studentId?: string; department?: string }): Promise<Ticket[]> {
  if (filter.studentId) {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'StudentIndex',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: { ':pk': `STUDENT#${filter.studentId}` },
        ScanIndexForward: false,
      }),
    );
    return (result.Items ?? []).map(fromItem);
  }

  if (filter.department) {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'DepartmentIndex',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: { ':pk': `DEPARTMENT#${filter.department}` },
        ScanIndexForward: false,
      }),
    );
    return (result.Items ?? []).map(fromItem);
  }

  // No filter: staff dashboard "all departments" view. A hackathon-scale table
  // can tolerate a scan; a production rollout would add a GSI3 with a constant
  // partition key to keep this a Query instead.
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const result = await client.send(
    new ScanCommand({ TableName: TABLE_NAME, FilterExpression: 'entityType = :t', ExpressionAttributeValues: { ':t': 'TICKET' } }),
  );
  return (result.Items ?? []).map(fromItem);
}

export async function updateTicket(
  ticketId: string,
  input: { status?: Ticket['status']; assignedStaff?: string },
  actor?: string,
): Promise<Ticket> {
  const ticket = await getTicket(ticketId);
  if (!ticket) throw new HttpError(404, `Ticket ${ticketId} not found.`);

  if (input.status && input.status !== ticket.status) {
    ticket.status = input.status;
    const labelKey =
      input.status === 'IN_REVIEW'
        ? 'timeline.inReview'
        : input.status === 'ACTION_TAKEN'
          ? 'timeline.actionTaken'
          : input.status === 'RESOLVED'
            ? 'timeline.resolved'
            : 'timeline.submitted';
    ticket.timeline.push(makeEvent(input.status, labelKey, undefined, actor));
  }

  if (input.assignedStaff && input.assignedStaff !== ticket.assignedStaff) {
    ticket.assignedStaff = input.assignedStaff;
    ticket.timeline.push(makeEvent(ticket.status, 'timeline.assigned', { staff: input.assignedStaff }, actor));
  }

  ticket.updatedAt = new Date().toISOString();
  await client.send(new TransactWriteCommand({ TransactItems: [{ Put: { TableName: TABLE_NAME, Item: toItem(ticket) } }] }));
  return ticket;
}

export async function addTimelineEvent(
  ticketId: string,
  event: Omit<TicketTimelineEvent, 'id' | 'createdAt'>,
): Promise<Ticket> {
  const ticket = await getTicket(ticketId);
  if (!ticket) throw new HttpError(404, `Ticket ${ticketId} not found.`);

  ticket.timeline.push({ ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  ticket.updatedAt = new Date().toISOString();
  await client.send(new TransactWriteCommand({ TransactItems: [{ Put: { TableName: TABLE_NAME, Item: toItem(ticket) } }] }));
  return ticket;
}

export async function submitFeedback(input: FeedbackInput): Promise<Ticket> {
  const ticket = await getTicket(input.ticketId);
  if (!ticket) throw new HttpError(404, `Ticket ${input.ticketId} not found.`);

  ticket.feedback = {
    rating: input.rating,
    comment: input.comment,
    firstContactResolution: input.firstContactResolution,
    submittedAt: new Date().toISOString(),
  };
  ticket.updatedAt = new Date().toISOString();
  await client.send(new TransactWriteCommand({ TransactItems: [{ Put: { TableName: TABLE_NAME, Item: toItem(ticket) } }] }));
  return ticket;
}
